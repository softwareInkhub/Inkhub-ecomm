'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import PhoneVerificationModal from '@/components/PhoneVerificationModal'
import DatePickerModal from '@/components/DatePickerModal'

export default function ManageAccountPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    instagram: '',
    dob: '',
    gender: '',
    avatar: ''
  })
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    // Try to get separate first and last names
    let firstName = localStorage.getItem('bagichaUserFirstName') || ''
    let lastName = localStorage.getItem('bagichaUserLastName') || ''
    
    // Migration: If old format exists (single name), split it
    if (!firstName && !lastName) {
      const oldName = localStorage.getItem('bagichaUserName') || ''
      if (oldName) {
        const nameParts = oldName.trim().split(' ')
        firstName = nameParts[0] || ''
        lastName = nameParts.slice(1).join(' ') || ''
        
        // Save in new format
        if (firstName) localStorage.setItem('bagichaUserFirstName', firstName)
        if (lastName) localStorage.setItem('bagichaUserLastName', lastName)
        
        // Also update the combined name for backward compatibility
        localStorage.setItem('bagichaUserName', `${firstName} ${lastName}`.trim())
      }
    }
    
    const phone = localStorage.getItem('bagichaPhoneNumber') || ''
    const instagram = localStorage.getItem('bagichaInstagram') || ''
    const dob = localStorage.getItem('bagichaDOB') || ''
    const gender = localStorage.getItem('bagichaGender') || ''
    const avatar = localStorage.getItem('Inkhubvatar') || ''
    
    setUserData({ firstName, lastName, phone, instagram, dob, gender, avatar })
  }, [])

  const handleInputChange = (field: string, value: string) => {
    const newUserData = { ...userData, [field]: value }
    setUserData(newUserData)
    
    if (field === 'firstName') {
      localStorage.setItem('bagichaUserFirstName', value)
      // Update combined name for backward compatibility
      const fullName = `${value} ${newUserData.lastName}`.trim()
      localStorage.setItem('bagichaUserName', fullName)
    }
    if (field === 'lastName') {
      localStorage.setItem('bagichaUserLastName', value)
      // Update combined name for backward compatibility
      const fullName = `${newUserData.firstName} ${value}`.trim()
      localStorage.setItem('bagichaUserName', fullName)
    }
    if (field === 'instagram') localStorage.setItem('bagichaInstagram', value)
    if (field === 'dob') localStorage.setItem('bagichaDOB', value)
    if (field === 'gender') localStorage.setItem('bagichaGender', value)
  }

  const handleAvatarEdit = () => {
    if (userData.avatar) {
      // If avatar exists, show modal with edit and delete options
      setShowAvatarModal(true)
    } else {
      // If no avatar, directly open file picker
      fileInputRef.current?.click()
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const avatarData = reader.result as string
        setUserData({ ...userData, avatar: avatarData })
        localStorage.setItem('Inkhubvatar', avatarData)
        setShowAvatarModal(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarDelete = () => {
    setUserData({ ...userData, avatar: '' })
    localStorage.removeItem('Inkhubvatar')
    setShowAvatarModal(false)
  }

  const handlePickImage = () => {
    setShowAvatarModal(false)
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 300)
  }

  const handlePhoneUpdate = () => {
    setShowVerificationModal(true)
  }

  const handlePhoneVerifySuccess = (newPhone: string) => {
    setUserData({ ...userData, phone: newPhone })
    setSuccessMessage('Phone number updated successfully!')
    setShowSuccessModal(true)
  }

  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false)
    setSuccessMessage('Please contact support to complete account deletion')
    setShowSuccessModal(true)
  }

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  const handleDateSelect = (dateString: string) => {
    handleInputChange('dob', dateString)
  }

  return (
    <div className="account-page-v2">
      <div className="account-container-v2">
        <header className="account-header-v2">
          <button className="back-btn" onClick={() => router.push('/profile')}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="account-title-v2">Manage Account</h1>
        </header>

        <main className="account-main-v2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
          
          <div className="account-avatar-section">
            <div className="account-avatar-v2">
              {userData.avatar ? (
                <img src={userData.avatar} alt="Profile" className="account-avatar-image" />
              ) : (
                <svg width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              <button className="account-avatar-edit" onClick={handleAvatarEdit}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="account-form-v2">
            <div className="account-field-v2">
              <label className="account-label-v2">First Name</label>
              <input
                type="text"
                className="account-input-v2"
                value={userData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div className="account-field-v2">
              <label className="account-label-v2">Last Name</label>
              <input
                type="text"
                className="account-input-v2"
                value={userData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            <div className="account-field-v2">
              <label className="account-label-v2">Phone Number</label>
              <div className="account-phone-field">
                <div className="account-phone-code">+91</div>
                <div className="account-phone-number">
                  <span>{userData.phone}</span>
                  <button className="account-phone-update" onClick={handlePhoneUpdate}>Update</button>
                </div>
              </div>
            </div>

            <div className="account-field-v2">
              <label className="account-label-v2">
                Instagram Username <span className="account-label-hint">(For special discounts)</span>
              </label>
              <input
                type="text"
                className="account-input-v2"
                value={userData.instagram}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                placeholder="@username"
              />
            </div>

            <div className="account-field-v2">
              <label className="account-label-v2">DOB</label>
              <div className="account-date-field" onClick={() => setShowDatePicker(true)}>
                <input
                  type="text"
                  className="account-input-v2 account-date-input"
                  value={formatDisplayDate(userData.dob)}
                  placeholder="Select your date of birth"
                  readOnly
                />
                <svg className="account-calendar-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
            </div>

            <div className="account-field-v2">
              <label className="account-label-v2">Gender</label>
              <div className="account-gender-buttons">
                <button
                  className={`account-gender-btn ${userData.gender === 'male' ? 'active' : ''}`}
                  onClick={() => handleInputChange('gender', 'male')}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="12" y1="8" x2="12" y2="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="12" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="12" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>Male</span>
                </button>
                <button
                  className={`account-gender-btn ${userData.gender === 'female' ? 'active' : ''}`}
                  onClick={() => handleInputChange('gender', 'female')}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"/>
                    <line x1="12" y1="12" x2="12" y2="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="8" y1="16" x2="16" y2="16" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>Female</span>
                </button>
                <button
                  className={`account-gender-btn ${userData.gender === 'other' ? 'active' : ''}`}
                  onClick={() => handleInputChange('gender', 'other')}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4"/>
                    <line x1="12" y1="8" x2="12" y2="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="8" y1="12" x2="4" y2="12" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <line x1="16" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                  <span>Other</span>
                </button>
              </div>
            </div>
          </div>

          <button className="account-delete-btn-v2" onClick={handleDeleteAccount}>
            DELETE ACCOUNT
          </button>
        </main>
      </div>
      
      <PhoneVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        currentPhone={userData.phone}
        onVerifySuccess={handlePhoneVerifySuccess}
      />
      
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={userData.dob}
        onDateSelect={handleDateSelect}
      />

      {showAvatarModal && (
        <div className="avatar-modal-overlay" onClick={() => setShowAvatarModal(false)}>
          <div className="avatar-modal" onClick={(e) => e.stopPropagation()}>
            <div className="avatar-modal-handle"></div>
            <h3 className="avatar-modal-title">Profile Photo</h3>
            <div className="avatar-modal-buttons">
              <button className="avatar-modal-btn" onClick={handlePickImage}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <path d="M21 15l-5-5L5 21"/>
                </svg>
                Pick from Gallery
              </button>
              <button className="avatar-modal-btn delete" onClick={handleAvatarDelete}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  <line x1="10" y1="11" x2="10" y2="17"/>
                  <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-handle"></div>
            <h3 className="confirm-modal-title">Are you sure you want to delete your account?</h3>
            <p className="confirm-modal-message">Your account will be deactivated for the first 24 hours after which it will be permanently deleted</p>
            <div className="confirm-modal-buttons">
              <button className="confirm-modal-btn delete" onClick={confirmDeleteAccount}>
                Delete anyway
              </button>
              <button className="confirm-modal-btn cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="confirm-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-handle"></div>
            <h3 className="confirm-modal-title">Success</h3>
            <p className="confirm-modal-message">{successMessage}</p>
            <div className="confirm-modal-buttons">
              <button className="confirm-modal-btn primary" onClick={() => setShowSuccessModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

