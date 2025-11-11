'use client'

import React, { useState } from 'react'

interface LoginModalProps {
  show: boolean
  onClose: () => void
  onSuccess: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    setPhoneNumber(value.slice(0, 10))
  }
  
  const handleContinue = () => {
    if (phoneNumber.length === 10) {
      localStorage.setItem('bagichaPhoneNumber', phoneNumber)
      localStorage.setItem('bagichaUserPhone', phoneNumber)
      onSuccess()
    }
  }

  const handleCloseAttempt = () => {
    if (phoneNumber.length > 0 && phoneNumber.length < 10) {
      setShowExitConfirm(true)
    } else {
      onClose()
    }
  }

  const confirmExit = () => {
    setShowExitConfirm(false)
    setPhoneNumber('')
    onClose()
  }

  const cancelExit = () => {
    setShowExitConfirm(false)
  }

  if (!show) return null

  return (
    <div className="login-modal show" onClick={(e) => {
      const target = e.target as HTMLElement
      if (target.className === 'login-modal show') {
        handleCloseAttempt()
      }
    }}>
      <div className="login-modal-content">
        <div className="login-modal-header">
          <button className="login-close-btn" onClick={handleCloseAttempt}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <h2 className="login-modal-title">Login / Signup</h2>
        </div>
        <div className="login-modal-body">
          <div className="phone-input-container">
            <span className="phone-prefix">+91</span>
            <input 
              type="tel" 
              className="phone-input" 
              value={phoneNumber}
              onChange={handleInput}
              placeholder="Enter your phone number"
              maxLength={10}
              autoFocus
            />
          </div>
          <p className="otp-note">An OTP will be sent to your phone number</p>
          <p className="terms-text">
            By clicking I accept the <a href="#" className="terms-link">Terms and Conditions</a> and <a href="#" className="terms-link">Privacy Policy</a>
          </p>
          <button 
            className="continue-btn" 
            disabled={phoneNumber.length !== 10}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>

      {showExitConfirm && (
        <div className="exit-confirm-overlay" onClick={cancelExit}>
          <div className="exit-confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="exit-confirm-title">Are you sure you want to exit?</h3>
            <p className="exit-confirm-text">Your progress will be lost.</p>
            <div className="exit-confirm-buttons">
              <button className="exit-confirm-yes" onClick={confirmExit}>Yes</button>
              <button className="exit-confirm-no" onClick={cancelExit}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LoginModal
