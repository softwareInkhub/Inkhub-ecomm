'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function OTPPage() {
  const router = useRouter()
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', ''])
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)
  const [userName, setUserName] = useState('')
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
  }, [])

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

  const handleVerify = () => {
    const otpString = otp.join('')
    if (otpString.length === 6) {
      localStorage.setItem('Inkhubuthenticated', 'true')
      
      // Save phone number for payment system
      localStorage.setItem('bagichaUserPhone', phoneNumber)
      
      // Check if user already has a name saved
      const savedName = localStorage.getItem('bagichaUserName')
      if (!savedName) {
        // First time login - ask for name
        setShowNameInput(true)
      } else {
        // User already has name - proceed
        completeLogin()
      }
    }
  }

  const handleNameSubmit = () => {
    if (userName.trim()) {
      localStorage.setItem('bagichaUserName', userName.trim())
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
            <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
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
          
          <p className="resend-text">
            Didn't receive the code? <a href="#" className="resend-link" onClick={(e) => {
              e.preventDefault()
              alert('OTP resent')
            }}>Resend</a>
          </p>
          
          <button className="verify-btn" disabled={!isOtpComplete} onClick={handleVerify}>
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  )
}

