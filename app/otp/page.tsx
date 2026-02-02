'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { verifyOTP, resendOTP } from '@/lib/otpService'

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [userName, setUserName] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(60)
  const [resendDisabled, setResendDisabled] = useState(true)
  const [resendCount, setResendCount] = useState(0)

  // Keys for localStorage
  const RESEND_COUNT_KEY = 'bagichaOtpResendCount'
  const RESEND_DATE_KEY = 'bagichaOtpResendDate'
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ]

  useEffect(() => {
    const phone = localStorage.getItem('bagichaPhoneNumber')
    setPhoneNumber(phone || '9876543210')

    // Initialize resend count with per-day reset
    const today = new Date().toISOString().slice(0, 10)
    const storedDate = localStorage.getItem(RESEND_DATE_KEY)
    const storedCount = localStorage.getItem(RESEND_COUNT_KEY)

    if (storedDate === today && storedCount) {
      setResendCount(parseInt(storedCount, 10) || 0)
    } else {
      localStorage.setItem(RESEND_DATE_KEY, today)
      localStorage.setItem(RESEND_COUNT_KEY, '0')
      setResendCount(0)
    }
  }, [])

  // Countdown effect for resend
  useEffect(() => {
    if (!resendDisabled) return
    if (resendCountdown <= 0) {
      setResendDisabled(false)
      return
    }

    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [resendDisabled, resendCountdown])

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  const handleVerify = async () => {
    const otpString = otp.join('')
    if (otpString.length === 6) {
      setIsVerifying(true)
      setErrorMessage('')
      
      try {
        // Verify OTP using Firebase
        const result = await verifyOTP(otpString)
        
        if (result.success && result.user) {
          // OTP verified successfully
          const firebaseUser = result.user
          const uid = firebaseUser.uid
          const phone = firebaseUser.phoneNumber || `+91${phoneNumber}`
          
          // Save to localStorage
          localStorage.setItem('Inkhubuthenticated', 'true')
          localStorage.setItem('bagichaUserPhone', phoneNumber)
          localStorage.setItem('firebaseUID', uid)
          
          // Save or fetch user from DynamoDB
          try {
            const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
            const userResponse = await fetch('/api/users', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: uid,
                phone: formattedPhone,
              }),
            })
            
            const userData = await userResponse.json()
            
            if (userData.success && userData.user) {
              // User saved/fetched successfully
              // If user has a name, save it to localStorage
              if (userData.user.name) {
                localStorage.setItem('bagichaUserName', userData.user.name)
              }
              
              // Check if user already has a name saved
              const savedName = localStorage.getItem('bagichaUserName')
              if (!savedName) {
                // First time login - ask for name
                setShowNameInput(true)
                setIsVerifying(false)
              } else {
                // User already has name - proceed
                completeLogin()
              }
            } else {
              // DynamoDB save failed, but continue with login
              console.warn('Failed to save user to DynamoDB:', userData.error)
              const savedName = localStorage.getItem('bagichaUserName')
              if (!savedName) {
                setShowNameInput(true)
                setIsVerifying(false)
              } else {
                completeLogin()
              }
            }
          } catch (dbError: any) {
            // DynamoDB error - log but don't block login
            console.error('Error saving user to DynamoDB:', dbError)
            const savedName = localStorage.getItem('bagichaUserName')
            if (!savedName) {
              setShowNameInput(true)
              setIsVerifying(false)
            } else {
              completeLogin()
            }
          }
        } else {
          // Show error message
          setErrorMessage(result.error || 'Invalid OTP. Please try again.')
          setIsVerifying(false)
        }
      } catch (error: any) {
        console.error('Error in handleVerify:', error)
        setErrorMessage('An unexpected error occurred. Please try again.')
        setIsVerifying(false)
      }
    }
  }

  const handleNameSubmit = async () => {
    if (userName.trim()) {
      const name = userName.trim()
      localStorage.setItem('bagichaUserName', name)
      
      // Update user in DynamoDB with name
      const uid = localStorage.getItem('firebaseUID')
      const phone = localStorage.getItem('bagichaUserPhone')
      
      if (uid && phone) {
        try {
          const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
          await fetch('/api/users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: uid,
              phone: formattedPhone,
              name: name,
            }),
          })
        } catch (error) {
          // Log error but don't block login
          console.error('Error updating user name in DynamoDB:', error)
        }
      }
      
      completeLogin()
    }
  }

  const completeLogin = () => {
    // Dispatch events to update UI across components
    window.dispatchEvent(new Event('authChanged'))
    window.dispatchEvent(new Event('storage'))
    
    // Check if there's a return URL saved (from trying to place order)
    const returnUrl = localStorage.getItem('returnAfterLogin')
    if (returnUrl) {
      localStorage.removeItem('returnAfterLogin')
      router.push(returnUrl)
    } else {
      router.push('/wishlist')
    }
  }

  const handleChangeNumber = () => {
    // Clear the stored phone number
    localStorage.removeItem('bagichaPhoneNumber')
    // Navigate to profile page
    router.push('/profile')
  }

  const isOtpComplete = otp.every(digit => digit !== '')

  if (showNameInput) {
    return (
      <div className="otp-page">
        <div className="otp-container">
          <div className="otp-content">
            <div className="otp-icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11h-6"/>
              </svg>
            </div>
            
            <h2 className="otp-title">What's your name?</h2>
            <p className="otp-subtitle">We'll use this for your deliveries</p>
            
            <div className="name-input-container">
              <input 
                type="text" 
                className="name-input" 
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                autoFocus
                maxLength={50}
              />
            </div>
            
            <button 
              className="verify-btn" 
              disabled={!userName.trim()}
              onClick={handleNameSubmit}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="otp-page">
      <div className="otp-container">
        <button className="back-btn-otp" onClick={() => router.back()}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="otp-content">
          <div className="otp-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#fdfcfc" viewBox="0 0 256 256"><path d="M216,50H40A14,14,0,0,0,26,64V224a13.88,13.88,0,0,0,8.09,12.69A14.11,14.11,0,0,0,40,238a13.87,13.87,0,0,0,9-3.31l.06-.05L82.23,206H216a14,14,0,0,0,14-14V64A14,14,0,0,0,216,50Zm2,142a2,2,0,0,1-2,2H80a6,6,0,0,0-3.92,1.46L41.26,225.53A2,2,0,0,1,38,224V64a2,2,0,0,1,2-2H216a2,2,0,0,1,2,2Z"></path></svg>
          </div>
          
          <h2 className="otp-title">Verify OTP</h2>
          <p className="otp-subtitle">Enter the 6-digit code sent to<br/><span>+91 {phoneNumber}</span></p>
          <button className="change-number-btn" onClick={handleChangeNumber}>
            Change Number
          </button>
          
          <div className="otp-input-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                className="otp-input"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                autoComplete="off"
              />
            ))}
          </div>
          
          {errorMessage && (
            <p className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
              {errorMessage}
            </p>
          )}
          <p className="resend-text">
            Didn't receive the code?{' '}
            <a
              href="#"
              className="resend-link"
              onClick={async (e) => {
                e.preventDefault()
                if (isResending || resendDisabled) return

                // Enforce max 5 resends per day per user
                if (resendCount >= 5) {
                  setErrorMessage('You have reached the maximum OTP resend limit for today. Please try again tomorrow.')
                  return
                }

                setIsResending(true)
                setErrorMessage('')
                try {
                  const result = await resendOTP(phoneNumber)
                  if (result.success) {
                    // Update resend count and persist
                    const newCount = resendCount + 1
                    setResendCount(newCount)
                    localStorage.setItem(RESEND_COUNT_KEY, String(newCount))

                    // Restart 60s countdown
                    setResendCountdown(60)
                    setResendDisabled(true)
                    alert('OTP resent successfully')
                  } else {
                    setErrorMessage(result.error || 'Failed to resend OTP. Please try again.')
                  }
                } catch (error: any) {
                  console.error('Error resending OTP:', error)
                  setErrorMessage('Failed to resend OTP. Please try again.')
                } finally {
                  setIsResending(false)
                }
              }}
              style={{ pointerEvents: isResending || resendDisabled ? 'none' : 'auto', opacity: isResending || resendDisabled ? 0.5 : 1 }}
            >
              {isResending
                ? 'Resending...'
                : resendDisabled
                ? `Resend in ${resendCountdown}s`
                : 'Resend'}
            </a>
          </p>
          
          <button className="verify-btn" disabled={!isOtpComplete || isVerifying} onClick={handleVerify}>
            {isVerifying ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          {/* reCAPTCHA container for Firebase Phone Auth - needed for resend functionality */}
          <div id="recaptcha-container" style={{ display: 'none' }}></div>
        </div>
      </div>
    </div>
  )
}

