'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CartItem } from '@/types'
import { fetchProducts } from '@/lib/productsService'
import LoginModal from '@/components/LoginModal'
import CartToast from '@/components/CartToast'

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [showPopup, setShowPopup] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    // Check authentication status
    const authStatus = localStorage.getItem('Inkhubuthenticated') === 'true'
    setIsAuthenticated(authStatus)

    const items = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    setCartItems(items)
    
    // Initialize quantities
    const initialQuantities: Record<string, number> = {}
    items.forEach((item: CartItem) => {
      initialQuantities[item.id] = item.quantity || 1
    })
    setQuantities(initialQuantities)
    
    // Load related products from API
    const loadRelatedProducts = async () => {
      try {
        const products = await fetchProducts()
        const shuffled = products.sort(() => 0.5 - Math.random())
        setRelatedProducts(shuffled.slice(0, 3))
      } catch (error) {
        console.error('Error loading related products:', error)
      }
    }
    loadRelatedProducts()
    
    // Listen for cart updates
    const handleCartUpdate = () => {
      const updatedItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
      setCartItems(updatedItems)
      const updatedQuantities: Record<string, number> = {}
      updatedItems.forEach((item: CartItem) => {
        updatedQuantities[item.id] = item.quantity || 1
      })
      setQuantities(updatedQuantities)
    }
    
    // Listen for authentication changes
    const handleAuthUpdate = () => {
      const authStatus = localStorage.getItem('Inkhubuthenticated') === 'true'
      setIsAuthenticated(authStatus)
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    window.addEventListener('storage', handleAuthUpdate)
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      window.removeEventListener('storage', handleAuthUpdate)
    }
  }, [])

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('bagichaCart', JSON.stringify(updatedCart))
    
    const newQuantities = { ...quantities }
    delete newQuantities[itemId]
    setQuantities(newQuantities)
    
    window.dispatchEvent(new Event('cartUpdated'))
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 2000)
  }

  const handleQuantityChange = (itemId: string, delta: number) => {
    const currentQuantity = quantities[itemId] || 1
    const newQuantity = currentQuantity + delta
    
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }
    
    setQuantities(prev => ({ ...prev, [itemId]: newQuantity }))
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('bagichaCart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const getPriceInfo = (item: CartItem) => {
    const currentPrice = parseFloat(String(item.price))
    const discountMap: Record<string, number> = {
      '1': 25, '2': 30, '3': 20, '4': 40, '5': 35, '6': 15,
      '7': 20, '8': 22, '9': 18, '10': 25, '11': 28, '12': 24,
      '13': 35, '14': 30, '15': 32, '16': 20, '17': 22, '18': 18,
      '19': 25, '20': 30, '21': 28, '22': 20, '23': 15, '24': 24,
      '25': 22, '26': 18, '27': 20, '28': 25, '29': 28, '30': 26,
      '31': 21, '32': 23, '33': 20, '34': 33, '35': 22, '36': 24
    }
    const discountPercent = discountMap[item.id] || 25
    const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100))
    return { currentPrice, previousPrice, discountPercent }
  }

  const calculateItemsTotal = () => {
    return cartItems.reduce((sum, item) => {
      const qty = quantities[item.id] || 1
      const { previousPrice } = getPriceInfo(item)
      return sum + (previousPrice * qty)
    }, 0)
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const qty = quantities[item.id] || 1
      return sum + (parseFloat(String(item.price || 0)) * qty)
    }, 0)
  }

  const calculateSavings = () => {
    return calculateItemsTotal() - calculateSubtotal()
  }

  const calculateHandlingCharge = () => {
    return 5
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateHandlingCharge()
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    // Save return URL for after OTP verification
    localStorage.setItem('returnAfterLogin', '/cart')
    // Navigate to OTP page
    router.push('/otp')
  }

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true)
    } else {
      router.push('/checkout')
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + (quantities[item.id] || 1), 0)

  return (
    <div className="cart-page-v2">
      <header className="cart-header-v2">
        <h1 className="cart-title-v2">My Cart</h1>
        <button className="cart-close-btn" onClick={() => router.push('/')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </header>

      <main className="cart-main-v2">
        {cartItems.length === 0 ? (
          <div className="empty-cart-v2">
            <div className="empty-state-icon-v2">
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="empty-state-title-v2">Your cart is empty</h2>
            <p className="empty-state-text-v2">Add items to your cart to get started</p>
            <button className="start-shopping-btn-v2" onClick={() => router.push('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Total Savings Banner */}
            <div className="cart-savings-banner">
              <span>Your total savings</span>
              <span className="cart-savings-amount">₹{calculateSavings().toFixed(0)}</span>
            </div>

            {/* Delivery Info Card */}
            <div className="cart-delivery-card-v2">
              <div className="cart-delivery-icon">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div className="cart-delivery-info-v2">
                <p className="cart-delivery-time-v2">Delivery in 60 minutes</p>
                <p className="cart-delivery-count">Shipment of {totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items-v2">
              {cartItems.map(item => {
                const { currentPrice, previousPrice } = getPriceInfo(item)
                const quantity = quantities[item.id] || 1
                
                return (
                  <div key={item.id} className="cart-item-card-v2">
                    <div className="cart-item-image-v2">
                      <img src={item.image} alt={item.title || item.name} />
                    </div>
                    <div className="cart-item-details-v2">
                      <h3 className="cart-item-brand-v2">Inkhub</h3>
                      <p className="cart-item-name-v2">{item.title || item.name}</p>
                      <p className="cart-item-weight">250 g</p>
                      <div className="cart-item-price-row">
                        <div className="cart-item-prices-v2">
                          <span className="cart-item-current-v2">₹{(currentPrice * quantity).toFixed(0)}</span>
                          <span className="cart-item-previous-v2">₹{(previousPrice * quantity).toFixed(0)}</span>
                        </div>
                        <div className="cart-quantity-selector-v2">
                          <button 
                            className="quantity-btn-v2" 
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            −
                          </button>
                          <span className="quantity-value-v2">{quantity}</span>
                          <button 
                            className="quantity-btn-v2" 
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Bill Details Card */}
            <div className="cart-bill-card">
              <h3 className="cart-bill-title">Bill details</h3>
              
              <div className="cart-bill-row">
                <div className="cart-bill-label">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  <span>Items total</span>
                  <span className="cart-saved-badge">Saved ₹{calculateSavings().toFixed(0)}</span>
                </div>
                <div className="cart-bill-value">
                  <span className="cart-bill-strike">₹{calculateItemsTotal().toFixed(0)}</span>
                  <span className="cart-bill-actual">₹{calculateSubtotal().toFixed(0)}</span>
                </div>
              </div>

              <div className="cart-bill-row">
                <div className="cart-bill-label">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                  </svg>
                  <span>Delivery charge</span>
                  <button className="cart-info-icon">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </button>
                </div>
                <div className="cart-bill-value">
                  <span className="cart-bill-strike">₹25</span>
                  <span className="cart-bill-free">FREE</span>
                </div>
              </div>

              <div className="cart-bill-row">
                <div className="cart-bill-label">
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                  </svg>
                  <span>Handling charge</span>
                  <button className="cart-info-icon">
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  </button>
                </div>
                <div className="cart-bill-value">
                  <span className="cart-bill-actual">₹{calculateHandlingCharge().toFixed(0)}</span>
                </div>
              </div>

              <div className="cart-bill-divider"></div>

              <div className="cart-bill-row cart-bill-total-row">
                <span className="cart-bill-total-label">Grand total</span>
                <span className="cart-bill-total-value">₹{calculateTotal().toFixed(0)}</span>
              </div>

              <div className="cart-savings-banner cart-savings-banner-bottom">
                <span>Your total savings</span>
                <span className="cart-savings-amount">₹{calculateSavings().toFixed(0)}</span>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="cart-policy-card">
              <h3 className="cart-policy-title">Cancellation Policy</h3>
              <p className="cart-policy-text">
                Orders cannot be cancelled once packed for delivery. In case of unexpected delays, 
                a refund will be provided, if applicable.
              </p>
            </div>
          </>
        )}
      </main>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div className="cart-bottom-bar-v2">
          <div className="cart-bottom-total">
            <span className="cart-bottom-price">₹{calculateTotal().toFixed(0)}</span>
            <span className="cart-bottom-label">TOTAL</span>
          </div>
          <button 
            className="cart-checkout-btn"
            onClick={handleProceedToCheckout}
          >
            {isAuthenticated ? 'Proceed to Checkout' : 'Login to Proceed'} 
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>
      )}

      {showPopup && (
        <div className="cart-popup-v2">
          <p>Item removed from cart</p>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        show={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* Cart Toast */}
      <CartToast />
    </div>
  )
}
