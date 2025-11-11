'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import shopifyService from '@/lib/shopifyService'
import type { CartItem, Address } from '@/types'
import AddressSelectionModal from '@/components/AddressSelectionModal'
import MapLocationPicker from '@/components/MapLocationPicker'

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null)

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    // Check authentication
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/profile')
      return
    }

    const items = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    if (items.length === 0) {
      router.push('/cart')
      return
    }
    setCartItems(items)
    
    // Initialize quantities
    const initialQuantities: Record<string, number> = {}
    items.forEach((item: CartItem) => {
      initialQuantities[item.id] = item.quantity || 1
    })
    setQuantities(initialQuantities)
    
    // Check if there's a saved address
    const savedAddress = JSON.parse(localStorage.getItem('Inkhubddress') || '{}')
    if (Object.keys(savedAddress).length > 0) {
      setSelectedAddress(savedAddress)
    } else {
      // Show address modal if no address is saved
      setShowAddressModal(true)
    }

    // Load applied coupon if exists
    const savedCoupon = localStorage.getItem('appliedCoupon')
    if (savedCoupon) {
      try {
        const couponData = JSON.parse(savedCoupon)
        setAppliedCoupon(couponData)
      } catch (e) {
        // Handle old format (just string)
        localStorage.removeItem('appliedCoupon')
      }
    }
  }, [router])

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const qty = quantities[item.id] || item.quantity || 1
      return sum + (parseFloat(String(item.price || 0)) * qty)
    }, 0)
  }

  const calculateCouponDiscount = () => {
    if (appliedCoupon && appliedCoupon.discountAmount) {
      return appliedCoupon.discountAmount
    }
    return 0
  }

  const deliveryFee = 0 // Free delivery
  const subtotal = calculateSubtotal()
  const discount = calculateCouponDiscount()
  const total = Math.max(0, subtotal - discount + deliveryFee) // Ensure total doesn't go negative

  const handleApplyCoupon = async () => {
    setCouponError('')
    const code = couponCode.trim().toUpperCase()
    
    if (!code) {
      setCouponError('Please enter a coupon code')
      return
    }

    setIsValidatingCoupon(true)

    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🎫 FRONTEND: Validating Coupon')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📝 Code:', code)
      console.log('💰 Cart Subtotal:', subtotal)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Validate coupon with Shopify
      const validation = await shopifyService.validateDiscountCode(code, subtotal)
      
      console.log('📡 FRONTEND: Got validation response:', validation)
      
      if (validation.valid) {
        const couponData = {
          code: validation.code,
          discountAmount: validation.discountAmount,
          discountType: validation.discountType,
          discountValue: validation.discountValue,
          title: validation.title,
          priceRuleId: validation.priceRuleId,
          fallback: validation.fallback,
        }
        
        setAppliedCoupon(couponData)
        localStorage.setItem('appliedCoupon', JSON.stringify(couponData))
        setCouponCode('')
        setCouponError('')
        
        // Show success message
        if (validation.fallback) {
          console.log('✅ Coupon applied (fallback mode):', validation.code)
        } else {
          console.log('✅ Coupon validated from Shopify:', validation.code)
        }
      } else {
        console.log('❌ FRONTEND: Validation failed:', validation.error)
        setCouponError(validation.error || 'Invalid coupon code')
      }
    } catch (error) {
      console.error('❌ FRONTEND: Error validating coupon:', error)
      setCouponError('Failed to validate coupon. Please try again.')
    } finally {
      setIsValidatingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    localStorage.removeItem('appliedCoupon')
    setCouponCode('')
    setCouponError('')
  }

  const handleQuantityChange = (itemId: string, change: number) => {
    const newQuantity = (quantities[itemId] || 1) + change
    if (newQuantity < 1) return

    setQuantities({ ...quantities, [itemId]: newQuantity })
    
    // Update cart in localStorage
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('bagichaCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('bagichaCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
    
    if (updatedCart.length === 0) {
      router.push('/cart')
    }
  }

  const handleSelectAddress = (address: Address) => {
    setSelectedAddress(address)
    localStorage.setItem('Inkhubddress', JSON.stringify(address))
    
    // Also add to saved addresses if not already there
    const savedAddresses = JSON.parse(localStorage.getItem('bagichaSavedAddresses') || '[]')
    const existingIndex = savedAddresses.findIndex((addr: Address) => addr.id === address.id)
    if (existingIndex >= 0) {
      savedAddresses[existingIndex] = address
    } else {
      savedAddresses.push(address)
    }
    localStorage.setItem('bagichaSavedAddresses', JSON.stringify(savedAddresses))
    
    setShowAddressModal(false)
  }

  const handleAddNewAddress = () => {
    setShowAddressModal(false)
    setShowMapPicker(true)
  }

  const handleLocationSelected = (addressData: Address) => {
    handleSelectAddress(addressData)
    setShowMapPicker(false)
  }

  const handleChangeAddress = () => {
    setShowAddressModal(true)
  }

  const handleContinueToPayment = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address')
      setShowAddressModal(true)
      return
    }
    
    // Navigate to payment page
    router.push('/payment')
  }

  return (
    <div className="checkout-page-v2">
      <header className="checkout-header-v2">
        <h1 className="checkout-title-v2">My Cart</h1>
        <button className="checkout-close-btn" onClick={() => router.push('/cart')}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Close
        </button>
      </header>

      <main className="checkout-main-v2">
        {/* Cart Items */}
        <div className="checkout-items-section">
          {cartItems.map(item => (
            <div key={item.id} className="checkout-item-card">
              <div className="checkout-item-image">
                <img src={item.image} alt={item.title || item.name} />
              </div>
              <div className="checkout-item-details">
                <div className="checkout-item-header">
                  <h3 className="checkout-item-name">{item.title || item.name}</h3>
                  <button className="checkout-item-remove" onClick={() => handleRemoveItem(item.id)}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="checkout-item-footer">
                  <div className="checkout-item-quantity">
                    <button onClick={() => handleQuantityChange(item.id, -1)} disabled={(quantities[item.id] || 1) <= 1}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <span>{quantities[item.id] || 1}</span>
                    <button onClick={() => handleQuantityChange(item.id, 1)}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round"/>
                        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                  <div className="checkout-item-price">
                    <span className="checkout-item-price-current">₹{parseFloat(String(item.price)).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Section */}
        <div className="checkout-coupon-section">
          <h3 className="checkout-coupon-title">Apply Discount Code</h3>
          {appliedCoupon ? (
            <div className="checkout-coupon-applied">
              <div className="checkout-coupon-applied-info">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <span>Coupon "{appliedCoupon?.code}" applied!</span>
                  {appliedCoupon?.title && (
                    <div style={{ fontSize: '12px', color: '#059669', marginTop: '2px' }}>
                      {appliedCoupon.title}
                    </div>
                  )}
                </div>
              </div>
              <button className="checkout-coupon-remove" onClick={handleRemoveCoupon}>Remove</button>
            </div>
          ) : (
            <div className="checkout-coupon-input-row">
              <input 
                type="text"
                className="checkout-coupon-input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
              />
              <button 
                className="checkout-coupon-apply-btn" 
                onClick={handleApplyCoupon}
                disabled={isValidatingCoupon}
              >
                {isValidatingCoupon ? 'Validating...' : 'Apply'}
              </button>
            </div>
          )}
          {couponError && <p className="checkout-coupon-error">{couponError}</p>}
          {!appliedCoupon && (
            <div className="checkout-coupon-hints">
              <p>💡 <strong>Available coupons:</strong> Ask support for discount codes or check your email for exclusive offers!</p>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="checkout-price-summary">
          <h3 className="checkout-summary-title">Price Details</h3>
          <div className="checkout-summary-row-v2">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          {discount > 0 && (
            <div className="checkout-summary-row-v2 discount-row">
              <span>Discount ({appliedCoupon?.code || 'Applied'})</span>
              <span className="discount-amount">-₹{discount.toFixed(0)}</span>
            </div>
          )}
          <div className="checkout-summary-row-v2">
            <span>Delivery Fee</span>
            <span className="free-delivery">FREE</span>
          </div>
          <div className="checkout-summary-divider-v2"></div>
          <div className="checkout-summary-row-v2 checkout-total-v2">
            <span>Total Amount</span>
            <span>₹{total.toFixed(0)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="checkout-address-card-v2">
          <div className="checkout-address-header-v2">
            <h3 className="checkout-section-title-v2">Delivery Address</h3>
            {selectedAddress && (
              <button className="checkout-change-btn" onClick={handleChangeAddress}>
                Change
              </button>
            )}
          </div>

          {selectedAddress ? (
            <div className="checkout-address-selected">
              <div className="checkout-address-type-badge">{(selectedAddress as any).type || 'Home'}</div>
              <div className="checkout-address-name">{(selectedAddress as any).fullName || selectedAddress.name}</div>
              <div className="checkout-address-text">
                {selectedAddress.addressLine1}
                {(selectedAddress as any).landmark && `, ${(selectedAddress as any).landmark}`}
                {selectedAddress.addressLine2 && <><br />{selectedAddress.addressLine2}</>}
                <br />
                {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
              </div>
              <div className="checkout-address-phone">📞 {(selectedAddress as any).phoneNumber || selectedAddress.phone}</div>
            </div>
          ) : (
            <button className="checkout-add-address-btn-v2" onClick={() => setShowAddressModal(true)}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round"/>
              </svg>
              Add Delivery Address
            </button>
          )}
        </div>
      </main>

      {/* Fixed Bottom Button */}
      <div className="checkout-bottom-bar">
        <div className="checkout-bottom-info">
          <span className="checkout-bottom-label">Total Amount</span>
          <span className="checkout-bottom-price">₹{total.toFixed(0)}</span>
        </div>
        <button 
          className="checkout-continue-btn"
          onClick={handleContinueToPayment}
        >
          {total === 0 ? 'Place Free Order' : 'Checkout'}
        </button>
      </div>

      {/* Address Selection Modal */}
      <AddressSelectionModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={handleSelectAddress}
        onAddNewAddress={handleAddNewAddress}
      />

      {/* Map Location Picker */}
      <MapLocationPicker
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelected={handleLocationSelected}
      />
    </div>
  )
}
