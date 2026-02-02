'use client'

import React, { useState } from 'react'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const [hasPermission, setHasPermission] = useState(true) // Assuming permission check

  if (!isOpen) return null

  const handleEnableLocation = () => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setHasPermission(true)
        },
        () => {
          setHasPermission(false)
        }
      )
    }
  }

  const handleAddNewAddress = () => {
    // Handle add new address
    alert('Add new address functionality coming soon!')
  }

  const handleSetDeliveryLocation = () => {
    // Handle set delivery location
    alert('Set delivery location functionality coming soon!')
  }

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-handle"></div>
        
        {!hasPermission && (
          <div className="location-permission-warning">
            <div className="location-permission-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#ef4444"/>
                <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="location-pin-overlay">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="#ef4444"/>
                <circle cx="12" cy="10" r="3" fill="white"/>
              </svg>
            </div>
            <div className="location-permission-text">
              <p className="location-permission-title">Location permission is off</p>
              <p className="location-permission-subtitle">Enable for a better delivery experience</p>
            </div>
            <button className="location-enable-btn" onClick={handleEnableLocation}>
              Enable
            </button>
          </div>
        )}

        <h2 className="location-modal-title">Select Location</h2>

        <div className="location-options">
          <button className="location-option-btn" onClick={handleAddNewAddress}>
            <div className="location-option-left">
              <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Add new address</span>
            </div>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          <button className="location-option-btn" onClick={handleSetDeliveryLocation}>
            <div className="location-option-left">
              <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
                <path d="M12 7v6M12 13h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Set delivery location</span>
            </div>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationModal
