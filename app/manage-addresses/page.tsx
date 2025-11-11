'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MapLocationPicker from '@/components/MapLocationPicker'

interface Address {
  id: string
  fullName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  type: string
}

export default function ManageAddressesPage() {
  const router = useRouter()
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([])
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  useEffect(() => {
    loadAddresses()
  }, [])

  const loadAddresses = () => {
    const addresses = JSON.parse(localStorage.getItem('bagichaSavedAddresses') || '[]')
    setSavedAddresses(addresses)
  }

  const handleDeleteAddress = (addressId: string) => {
    setAddressToDelete(addressId)
    setShowDeleteModal(true)
  }

  const confirmDeleteAddress = () => {
    if (!addressToDelete) return
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== addressToDelete)
    setSavedAddresses(updatedAddresses)
    localStorage.setItem('bagichaSavedAddresses', JSON.stringify(updatedAddresses))
    setShowDeleteModal(false)
    setAddressToDelete(null)
  }

  const handleAddressAdded = (newAddress: Address) => {
    const addresses = JSON.parse(localStorage.getItem('bagichaSavedAddresses') || '[]')
    
    if (editingAddress) {
      // Update existing address
      const updatedAddresses = addresses.map((addr: Address) => 
        addr.id === editingAddress.id ? { ...newAddress, id: editingAddress.id } : addr
      )
      localStorage.setItem('bagichaSavedAddresses', JSON.stringify(updatedAddresses))
      setEditingAddress(null)
    } else {
      // Add new address
      addresses.push(newAddress)
      localStorage.setItem('bagichaSavedAddresses', JSON.stringify(addresses))
    }
    
    loadAddresses()
    setShowMapPicker(false)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setShowMapPicker(true)
  }

  return (
    <div className="addresses-page">
      <div className="addresses-page-container">
        <header className="addresses-header">
          <button className="back-btn" onClick={() => router.push('/profile')}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="addresses-title">My Addresses</h1>
          <div style={{ width: '24px' }}></div>
        </header>

        <main className="addresses-main">
          <button className="addresses-add-btn" onClick={() => setShowMapPicker(true)}>
            <div className="addresses-add-btn-left">
              <div className="addresses-add-icon">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <span>Add new address</span>
            </div>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {savedAddresses.length === 0 ? (
            <div className="addresses-empty">
              <svg width="80" height="80" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <h2>No addresses saved</h2>
              <p>Add your delivery addresses for quick checkout</p>
            </div>
          ) : (
            <>
              <h2 className="saved-addresses-heading">Saved Addresses</h2>
              <div className="addresses-list">
                {savedAddresses.map((address) => (
                  <div key={address.id} className="address-card">
                    <div className="address-card-delivery">Delivering in 60 minutes</div>
                    <div className="address-card-body">
                      <div className="address-card-left">
                        <div className="address-card-type">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                          <span>{address.type || 'Home'}</span>
                        </div>
                        <div className="address-card-content">
                          <div className="address-text">
                            {address.addressLine1}
                            {address.landmark && `, ${address.landmark}`}, {address.addressLine2}, {address.city}, {address.state} {address.pincode}, India
                          </div>
                          <div className="address-phone">Phone Number: {address.phoneNumber}</div>
                        </div>
                      </div>
                      <div className="address-card-actions">
                        <button className="address-edit-btn" onClick={() => handleEditAddress(address)}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="address-delete-btn" onClick={() => handleDeleteAddress(address.id)}>
                          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>

        <MapLocationPicker
          isOpen={showMapPicker}
          onClose={() => {
            setShowMapPicker(false)
            setEditingAddress(null)
          }}
          onLocationSelected={handleAddressAdded}
        />

        {showDeleteModal && (
          <div className="confirm-modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-modal-handle"></div>
              <h3 className="confirm-modal-title">Delete this address?</h3>
              <p className="confirm-modal-message">This action cannot be undone. Are you sure you want to delete this address?</p>
              <div className="confirm-modal-buttons">
                <button className="confirm-modal-btn delete" onClick={confirmDeleteAddress}>
                  Delete
                </button>
                <button className="confirm-modal-btn cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
