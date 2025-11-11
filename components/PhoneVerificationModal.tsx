'use client'

import React, { useState } from 'react'

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

  if (!isOpen) return null

  const handleConfirm = () => {
    // Send OTP to current number
    alert('OTP sent to your registered number')
    setStep(2)
  }

  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP')
      return
    }
    setVerifyingOtp(true)
    // Simulate OTP verification
    setTimeout(() => {
      setVerifyingOtp(false)
      setStep(3)
    }, 1000)
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
            <button className="phone-verify-confirm-btn" onClick={handleConfirm}>
              Confirm
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
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            />
            <button 
              className="phone-verify-confirm-btn" 
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
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
      </div>
    </div>
  )
}

