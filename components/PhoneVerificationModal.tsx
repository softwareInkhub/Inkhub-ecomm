'use client'

import React, { useState } from 'react'
import { sendOTP, verifyOTP } from '@/lib/otpService'

interface PhoneVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  currentPhone: string
  onVerifySuccess: (newPhone: string) => void
}

export default function PhoneVerificationModal({ isOpen, onClose, currentPhone, onVerifySuccess }: PhoneVerificationModalProps) {
  const [step, setStep] = useState(1) // 1: Confirm, 2: OTP, 3: New Number
  const [otp, setOtp] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    // Send OTP to current number using Firebase
    setSendingOtp(true)
    setErrorMessage('')
    
    try {
      const result = await sendOTP(currentPhone)
      if (result.success) {
        setStep(2)
      } else {
        setErrorMessage(result.error || 'Failed to send OTP. Please try again.')
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit OTP')
      return
    }
    
    setVerifyingOtp(true)
    setErrorMessage('')
    
    try {
      // Verify OTP using Firebase
      const result = await verifyOTP(otp)
      if (result.success) {
        // OTP verified successfully, proceed to step 3
        setVerifyingOtp(false)
        setStep(3)
      } else {
        setErrorMessage(result.error || 'Invalid OTP. Please try again.')
        setVerifyingOtp(false)
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setVerifyingOtp(false)
    }
  }

  const handleUpdateNumber = () => {
    if (newPhone.length !== 10) {
      alert('Please enter a valid 10-digit phone number')
      return
    }
    // Update phone number
    localStorage.setItem('bagichaPhoneNumber', newPhone)
    localStorage.setItem('bagichaUserPhone', newPhone)
    onVerifySuccess(newPhone)
    handleClose()
  }

  const handleClose = () => {
    setStep(1)
    setOtp('')
    setNewPhone('')
    setVerifyingOtp(false)
    setSendingOtp(false)
    setErrorMessage('')
    onClose()
  }

  return (
    <div className="phone-verify-overlay" onClick={handleClose}>
      <div className="phone-verify-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phone-verify-handle"></div>
        
        {step === 1 && (
          <>
            <h2 className="phone-verify-title">2-Step Verification Required</h2>
            <p className="phone-verify-text">
              For added security, we'll send an OTP to your registered number
            </p>
            <div className="phone-verify-number">+91-{currentPhone}</div>
            {errorMessage && (
              <p className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
                {errorMessage}
              </p>
            )}
            <button 
              className="phone-verify-confirm-btn" 
              onClick={handleConfirm}
              disabled={sendingOtp}
            >
              {sendingOtp ? 'Sending OTP...' : 'Confirm'}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="phone-verify-title">Enter OTP</h2>
            <p className="phone-verify-text">
              Enter the 6-digit code sent to +91-{currentPhone}
            </p>
            <input
              type="text"
              className="phone-verify-otp-input"
              placeholder="Enter OTP"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ''))
                setErrorMessage('') // Clear error when user types
              }}
              disabled={verifyingOtp}
            />
            {errorMessage && (
              <p className="error-message" style={{ color: 'red', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
                {errorMessage}
              </p>
            )}
            <button 
              className="phone-verify-confirm-btn" 
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otp.length !== 6}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="phone-verify-title">Enter New Number</h2>
            <p className="phone-verify-text">
              Please enter your new phone number
            </p>
            <div className="phone-verify-new-number-field">
              <span className="phone-verify-country-code">+91</span>
              <input
                type="text"
                className="phone-verify-new-number-input"
                placeholder="Enter new phone number"
                maxLength={10}
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <button 
              className="phone-verify-confirm-btn" 
              onClick={handleUpdateNumber}
            >
              Update Number
            </button>
          </>
        )}
        
        {/* reCAPTCHA container for Firebase Phone Auth - always available when modal is open */}
        <div id="recaptcha-container" style={{ display: 'none' }}></div>
      </div>
    </div>
  )
}

