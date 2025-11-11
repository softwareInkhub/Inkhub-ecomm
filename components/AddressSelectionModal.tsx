'use client'

import React, { useState, useEffect } from 'react'
import type { Address } from '@/types'

interface AddressSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAddress: (address: Address) => void
  onAddNewAddress: () => void
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectAddress, 
  onAddNewAddress 
}) => {
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Load saved addresses from localStorage
      const addresses = JSON.parse(localStorage.getItem('bagichaSavedAddresses') || '[]')
      setSavedAddresses(addresses)
      
      // Check if there's a currently selected address
      const currentAddress = JSON.parse(localStorage.getItem('Inkhubddress') || '{}')
      if (currentAddress.id) {
        setSelectedAddressId(currentAddress.id)
      }
    }
  }, [isOpen])

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id || null)
    onSelectAddress(address)
    onClose()
  }

  const handleAddNewClick = () => {
    onAddNewAddress()
  }

  if (!isOpen) return null

  return (
    <div className="address-modal-overlay" onClick={onClose}>
      <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="address-modal-header">
          <h2 className="address-modal-title">Select delivery address</h2>
        </div>

        <div className="address-modal-body">
          {/* Add New Address Button */}
          <div className="add-new-address-btn" onClick={handleAddNewClick}>
            <div className="add-address-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </div>
            <span>Add a new address</span>
          </div>

          {/* Saved Addresses Section */}
          {savedAddresses.length > 0 && (
            <div className="saved-addresses-section">
              <h3 className="saved-addresses-title">Your saved address</h3>
              <div className="saved-addresses-list">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`saved-address-item ${selectedAddressId === address.id ? 'selected' : ''}`}
                    onClick={() => handleSelectAddress(address)}
                  >
                    <div className="address-radio">
                      <div className={`radio-circle ${selectedAddressId === address.id ? 'checked' : ''}`}>
                        {selectedAddressId === address.id && <div className="radio-dot"></div>}
                      </div>
                    </div>
                    <div className="address-details">
                      <div className="address-type-badge">{(address as any).type || 'Home'}</div>
                      <p className="address-name">{(address as any).fullName || address.name}</p>
                      <p className="address-text">
                        {address.addressLine1}, {address.addressLine2 && `${address.addressLine2}, `}
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="address-phone">{(address as any).phoneNumber || address.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddressSelectionModal

