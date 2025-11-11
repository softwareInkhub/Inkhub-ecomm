'use client'

import React, { useState, useEffect } from 'react'

interface MapLocationPickerProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelected: (address: any) => void
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ isOpen, onClose, onLocationSelected }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(true)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    latitude: number | null
    longitude: number | null
  }>({
    address: '',
    latitude: null,
    longitude: null
  })
  const [addressDetails, setAddressDetails] = useState({
    houseNo: '',
    landmark: '',
    addressType: 'Home'
  })

  useEffect(() => {
    if (isOpen) {
      // Reset states
      setShowAddressForm(false)
      setAddressDetails({
        houseNo: '',
        landmark: '',
        addressType: 'Home'
      })
      
      // Simulate loading location
      setTimeout(() => {
        setIsLoadingLocation(false)
        setSelectedLocation({
          address: 'Fort, Mumbai, Maharashtra 400001',
          latitude: 18.9353,
          longitude: 72.8351
        })
      }, 1500)
    }
  }, [isOpen])

  const handleCurrentLocation = () => {
    setIsLoadingLocation(true)
    // Simulate getting current location
    setTimeout(() => {
      setIsLoadingLocation(false)
      setSelectedLocation({
        address: 'Your current location, Mumbai',
        latitude: 19.0760,
        longitude: 72.8777
      })
    }, 1000)
  }

  const handleConfirmLocation = () => {
    if (selectedLocation.address) {
      setShowAddressForm(true)
    }
  }

  const handleSaveAddress = () => {
    if (addressDetails.houseNo.trim()) {
      const userName = localStorage.getItem('bagichaUserName') || 'User'
      const phoneNumber = localStorage.getItem('bagichaPhoneNumber') || ''
      
      const fullAddress = {
        id: `addr_${Date.now()}`,
        fullName: userName,
        phoneNumber: phoneNumber,
        addressLine1: addressDetails.houseNo,
        addressLine2: selectedLocation.address,
        landmark: addressDetails.landmark,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        type: addressDetails.addressType,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      }
      
      onLocationSelected(fullAddress)
      onClose()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  if (!isOpen) return null

  return (
    <div className="map-modal-overlay">
      <div className="map-modal-content">
        {/* Header */}
        <div className="map-modal-header">
          <button className="map-back-btn" onClick={() => {
            if (showAddressForm) {
              setShowAddressForm(false)
            } else {
              onClose()
            }
          }}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="map-modal-title">
            {showAddressForm ? 'Complete your address' : 'Confirm map pin location'}
          </h2>
        </div>

        {!showAddressForm ? (
          <>
            {/* Search Bar */}
            <div className="map-search-container">
              <div className="map-search-bar">
                <svg className="map-search-icon" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                  type="text"
                  className="map-search-input"
                  placeholder="Search for area, street name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="map-search-clear" onClick={clearSearch}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="map-display-area">
              {/* Simulated Map Background */}
              <div className="map-background">
                {/* Map Grid Lines */}
                <div className="map-grid">
                  {[...Array(20)].map((_, i) => (
                    <div key={`h-${i}`} className="map-grid-line horizontal" style={{ top: `${i * 5}%` }}></div>
                  ))}
                  {[...Array(20)].map((_, i) => (
                    <div key={`v-${i}`} className="map-grid-line vertical" style={{ left: `${i * 5}%` }}></div>
                  ))}
                </div>

                {/* Roads/Streets Simulation */}
                <div className="map-roads">
                  <div className="map-road horizontal" style={{ top: '25%' }}></div>
                  <div className="map-road horizontal" style={{ top: '50%' }}></div>
                  <div className="map-road horizontal" style={{ top: '75%' }}></div>
                  <div className="map-road vertical" style={{ left: '30%' }}></div>
                  <div className="map-road vertical" style={{ left: '60%' }}></div>
                </div>

                {/* Buildings/Blocks */}
                <div className="map-buildings">
                  <div className="map-building" style={{ top: '15%', left: '15%', width: '60px', height: '50px' }}></div>
                  <div className="map-building" style={{ top: '15%', left: '65%', width: '70px', height: '60px' }}></div>
                  <div className="map-building" style={{ top: '55%', left: '20%', width: '50px', height: '55px' }}></div>
                  <div className="map-building" style={{ top: '58%', left: '65%', width: '65px', height: '50px' }}></div>
                </div>

                {/* Location Markers */}
                <div className="map-marker" style={{ top: '25%', left: '45%' }}>📍</div>
                <div className="map-marker" style={{ top: '60%', left: '75%' }}>🏪</div>
                <div className="map-marker" style={{ top: '80%', left: '35%' }}>🏥</div>

                {/* Main Pin */}
                <div className="map-pin-marker">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="#ef4444">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>

              {/* Current Location Button */}
              <button className="map-current-location-btn" onClick={handleCurrentLocation}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>Go to current location</span>
              </button>
            </div>

            {/* Location Details Bottom Sheet */}
            <div className="map-location-details">
              {isLoadingLocation ? (
                <>
                  <h3 className="map-location-loading">Getting your pin location...</h3>
                  <div className="map-loading-skeleton">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </>
              ) : (
                <>
                  <div className="map-location-info">
                    <div className="map-location-icon">
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="map-location-text">
                      <h3 className="map-location-title">Delivery Location</h3>
                      <p className="map-location-address">{selectedLocation.address}</p>
                    </div>
                  </div>
                  <button className="map-confirm-btn" onClick={handleConfirmLocation}>
                    Confirm Location
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          /* Address Details Form */
          <div className="map-address-form">
            <div className="map-address-form-content">
              <div className="map-address-location-preview">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{selectedLocation.address}</span>
              </div>

              <div className="map-form-group">
                <label className="map-form-label">
                  Flat / House No. / Floor / Building <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className="map-form-input"
                  placeholder="e.g. 201, Tower A"
                  value={addressDetails.houseNo}
                  onChange={(e) => setAddressDetails(prev => ({ ...prev, houseNo: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="map-form-group">
                <label className="map-form-label">Nearby Landmark (Optional)</label>
                <input
                  type="text"
                  className="map-form-input"
                  placeholder="e.g. Near City Mall"
                  value={addressDetails.landmark}
                  onChange={(e) => setAddressDetails(prev => ({ ...prev, landmark: e.target.value }))}
                />
              </div>

              <div className="map-form-group">
                <label className="map-form-label">Save address as</label>
                <div className="map-address-type-buttons">
                  {['Home', 'Work', 'Other'].map(type => (
                    <button
                      key={type}
                      className={`map-address-type-btn ${addressDetails.addressType === type ? 'active' : ''}`}
                      onClick={() => setAddressDetails(prev => ({ ...prev, addressType: type }))}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="map-address-form-footer">
              <button 
                className="map-save-address-btn" 
                onClick={handleSaveAddress}
                disabled={!addressDetails.houseNo.trim()}
              >
                Save & Proceed
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MapLocationPicker

