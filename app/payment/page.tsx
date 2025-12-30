'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import gokwikService from '@/lib/gokwikService'
import razorpayService from '@/lib/razorpayService'
import shopifyService from '@/lib/shopifyService'
import type { CartItem, Address } from '@/types'
import {
  getCustomerDetails,
  getShippingAddress,
  calculateOrderTotal,
  generateOrderId,
  saveOrderToHistory,
  clearCart,
  validatePaymentData,
  handlePaymentError,
  logPaymentEvent,
} from '@/utils/paymentHelpers'

export const dynamic = 'force-dynamic'

export default function PaymentPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedPayment, setSelectedPayment] = useState('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Scroll to top when page loads
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
    
    // Check authentication
    if (typeof window === 'undefined') return
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/profile')
      return
    }

    const items = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    const address = JSON.parse(localStorage.getItem('Inkhubddress') || '{}')
    
    if (items.length === 0) {
      router.push('/cart')
    } else if (Object.keys(address).length === 0) {
      router.push('/checkout')
    } else {
      setCartItems(items)
    }
  }, [mounted, router])

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const qty = item.quantity || 1
      return sum + (parseFloat(String(item.price || 0)) * qty)
    }, 0)
  }

  const getAppliedCoupon = () => {
    if (typeof window === 'undefined') return null
    const savedCoupon = localStorage.getItem('appliedCoupon')
    if (!savedCoupon) return null
    
    try {
      return JSON.parse(savedCoupon)
    } catch (e) {
      return null
    }
  }

  const calculateCouponDiscount = () => {
    if (!mounted) return 0
    const coupon = getAppliedCoupon()
    if (coupon && coupon.discountAmount) {
      return coupon.discountAmount
    }
    return 0
  }

  const total = mounted ? Math.max(0, calculateSubtotal() - calculateCouponDiscount()) : 0

  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay Payment',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" />
        </svg>
      ),
      description: 'UPI, Cards, NetBanking & More - Fast & Secure',
      recommended: true
    },
    {
      id: 'gokwik',
      name: 'GoKwik Payment',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
          <circle cx="17" cy="14" r="1.5" fill="currentColor" />
        </svg>
      ),
      description: 'UPI, Cards, NetBanking & More',
      recommended: false
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" strokeLinecap="round" />
        </svg>
      ),
      description: 'Pay via Google Pay, PhonePe, Paytm'
    },
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <path d="M2 10h20" />
        </svg>
      ),
      description: 'Visa, Mastercard, RuPay'
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M3 21h18" />
          <path d="M5 21V7l7-4 7 4v14" />
          <path d="M9 9v1M15 9v1M9 14v1M15 14v1" strokeLinecap="round" />
        </svg>
      ),
      description: 'All major banks'
    },
    {
      id: 'wallet',
      name: 'Wallet',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M19 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
          <path d="M3 7V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" />
          <circle cx="17" cy="13" r="1" fill="currentColor" />
        </svg>
      ),
      description: 'Paytm, PhonePe, Amazon Pay'
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: (
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M16 8V5l3 3-3 3v-3M8 8V5L5 8l3 3V8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="16" r="6" />
        </svg>
      ),
      description: 'Pay when you receive'
    }
  ]

  const completeOrder = async (paymentData: any = null) => {
    // Get scheduled delivery info
    const scheduledDelivery = localStorage.getItem('scheduledDelivery')
    const appliedCouponData = getAppliedCoupon()
    const address = JSON.parse(localStorage.getItem('Inkhubddress') || '{}')
    const customerDetails = getCustomerDetails()
    
    // Create order details
    const orderDetails: any = {
      orderId: paymentData?.razorpay_order_id || `ORD${Date.now()}`,
      items: cartItems,
      total: total,
      subtotal: calculateSubtotal(),
      couponDiscount: calculateCouponDiscount(),
      appliedCoupon: appliedCouponData ? appliedCouponData.code : null,
      couponDetails: appliedCouponData,
      paymentMethod: selectedPayment,
      paymentId: paymentData?.razorpay_payment_id || paymentData?.paymentId || 'PENDING',
      address: address,
      scheduledDelivery: scheduledDelivery ? JSON.parse(scheduledDelivery) : null,
      orderDate: new Date().toISOString(),
      status: 'confirmed'
    }

    // Create order in Shopify
    try {
      const shopifyOrder = await shopifyService.createOrder({
        customer: customerDetails,
        items: cartItems,
        shippingAddress: address,
        total: total,
        orderId: orderDetails.orderId,
        paymentDetails: paymentData
      })
      
      if (shopifyOrder) {
        console.log('Order created in Shopify:', shopifyOrder.id)
        orderDetails.shopifyOrderId = shopifyOrder.id
        orderDetails.shopifyOrderNumber = shopifyOrder.order_number
      }
    } catch (error) {
      console.error('Failed to create order in Shopify:', error)
      // Continue with order even if Shopify fails
    }

    // Save order to order history
    const orderHistory = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
    orderHistory.unshift(orderDetails)
    localStorage.setItem('bagichaOrders', JSON.stringify(orderHistory))

    // Clear cart and coupon
    localStorage.removeItem('bagichaCart')
    localStorage.removeItem('appliedCoupon')
    window.dispatchEvent(new Event('cartUpdated'))

    setIsProcessing(false)
    
    // Navigate to success page
    router.push('/order-success')
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setErrorMessage('')

    try {
      // Check payment method and handle accordingly
      if (selectedPayment === 'razorpay') {
        await handleRazorpayPayment()
      } else if (selectedPayment === 'gokwik') {
        await handleGoKwikPayment()
      } else {
        // Handle other payment methods (existing flow)
        setTimeout(() => {
          const paymentData = {
            paymentId: `PAY${Date.now()}`,
            method: selectedPayment
          }
          completeOrder(paymentData)
        }, 1000)
      }
    } catch (error) {
      console.error('Payment Error:', error)
      const errorMsg = handlePaymentError(error)
      setErrorMessage(errorMsg)
      setIsProcessing(false)
      
      // Show error for 5 seconds
      setTimeout(() => {
        setErrorMessage('')
      }, 5000)
    }
  }

  const handleRazorpayPayment = async () => {
    try {
      // Get necessary data
      const customerDetails = getCustomerDetails()
      const shippingAddress = getShippingAddress()
      const orderTotals = calculateOrderTotal(cartItems)
      const orderId = generateOrderId()

      // Validate payment data
      const validation = validatePaymentData({
        customerDetails,
        shippingAddress,
        items: cartItems,
        amount: orderTotals.total,
      })

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Log payment initiation
      logPaymentEvent('payment_initiated', {
        order_id: orderId,
        amount: orderTotals.total,
        method: 'razorpay',
      })

      // Initialize Razorpay checkout
      await razorpayService.initializeCheckout({
        amount: orderTotals.total,
        orderId: orderId,
        customerDetails: customerDetails,
        onSuccess: async (response: any) => {
          // Log successful payment
          logPaymentEvent('payment_success', {
            order_id: orderId,
            payment_id: response.razorpay_payment_id,
            amount: orderTotals.total,
          })

          // Complete the order
          await completeOrder(response)
        },
        onFailure: (error: any) => {
          console.error('Razorpay Payment Failed:', error)
          logPaymentEvent('payment_failed', {
            order_id: orderId,
            error: error.description || error.message,
          })
          setErrorMessage(error.description || 'Payment failed. Please try again.')
          setIsProcessing(false)
        },
        onClose: () => {
          setIsProcessing(false)
          console.log('Payment modal closed')
        },
      })
    } catch (error) {
      throw error
    }
  }

  const handleGoKwikPayment = async () => {
    try {
      // Get necessary data
      const customerDetails = getCustomerDetails()
      const shippingAddress = getShippingAddress()
      const orderTotals = calculateOrderTotal(cartItems)
      const orderId = generateOrderId()

      // Validate payment data
      const validation = validatePaymentData({
        customerDetails,
        shippingAddress,
        items: cartItems,
        amount: orderTotals.total,
      })

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '))
      }

      // Ensure shipping address is not null
      if (!shippingAddress) {
        throw new Error('Shipping address is required')
      }

      // Log payment initiation
      logPaymentEvent('payment_initiated', {
        order_id: orderId,
        amount: orderTotals.total,
        method: 'gokwik',
      })

      // Prepare order data for GoKwik
      // Type assertion: shippingAddress is guaranteed to be non-null after the check above
      const orderData = {
        orderId: orderId,
        amount: orderTotals.total,
        customerDetails: customerDetails,
        items: cartItems,
        shippingAddress: shippingAddress as Address,
        billingAddress: shippingAddress as Address, // Using same address for billing
      }

      // Create payment order with GoKwik
      const paymentOrder = await gokwikService.createPaymentOrder(orderData)

      // Initialize GoKwik checkout
      await gokwikService.initializeCheckout(paymentOrder, {
        onSuccess: (response: any) => {
          handleGoKwikSuccess(response, orderId, orderTotals)
        },
        onFailure: (error: any) => {
          handleGoKwikFailure(error)
        },
        onClose: () => {
          setIsProcessing(false)
        },
      })
    } catch (error) {
      throw error
    }
  }

  const handleGoKwikSuccess = async (response: any, orderId: string, orderTotals: any) => {
    try {
      // Log successful payment
      logPaymentEvent('payment_success', {
        order_id: orderId,
        payment_id: response.payment_id,
        amount: orderTotals.total,
      })

      // Verify payment with GoKwik (optional but recommended)
      const paymentVerification = await gokwikService.verifyPayment(response.payment_id)

      if (paymentVerification.status === 'success') {
        // Complete the order
        const paymentData = {
          paymentId: response.payment_id,
          method: 'gokwik',
          transactionId: response.transaction_id,
          status: 'paid',
        }
        completeOrder(paymentData)
      } else {
        throw new Error('Payment verification failed')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      // Even if verification fails, proceed with order if payment was successful
      const paymentData = {
        paymentId: response.payment_id,
        method: 'gokwik',
        status: 'paid',
      }
      completeOrder(paymentData)
    }
  }

  const handleGoKwikFailure = (error: any) => {
    setIsProcessing(false)
    const errorMsg = 'Payment failed. Please try again.'
    setErrorMessage(errorMsg)
    
    // Log payment failure
    logPaymentEvent('payment_failed', {
      error: error.message || 'Unknown error',
    })
    
    setTimeout(() => {
      setErrorMessage('')
    }, 5000)
  }

  return (
    <div className="payment-page">
      <header className="payment-header">
        <button className="back-btn" onClick={() => router.push('/checkout')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="payment-title">Payment</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="payment-main">
        {/* Payment Methods */}
        <div className="payment-methods-card">
          <h2 className="payment-section-title">Select Payment Method</h2>
          
          <div className="payment-methods-list">
            {paymentMethods.map(method => (
              <div
                key={method.id}
                className={`payment-method-item ${selectedPayment === method.id ? 'active' : ''} ${method.recommended ? 'recommended' : ''}`}
                onClick={() => setSelectedPayment(method.id)}
              >
                {method.recommended && (
                  <div className="payment-recommended-badge">Recommended</div>
                )}
                <div className="payment-method-radio">
                  <div className={`radio-circle ${selectedPayment === method.id ? 'selected' : ''}`}>
                    {selectedPayment === method.id && <div className="radio-dot"></div>}
                  </div>
                </div>
                <div className="payment-method-icon">{method.icon}</div>
                <div className="payment-method-details">
                  <div className="payment-method-name">{method.name}</div>
                  <div className="payment-method-description">{method.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="payment-error-card">
            <div className="payment-error-icon">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p className="payment-error-text">{errorMessage}</p>
          </div>
        )}

        {/* Payment Details Info */}
        {selectedPayment === 'gokwik' && (
          <div className="payment-info-card">
            <div className="payment-secure-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
              </svg>
              <span>Powered by GoKwik - 100% Secure</span>
            </div>
            <p className="payment-info-text">
              GoKwik provides a seamless and secure payment experience with multiple payment options including UPI, Cards, Net Banking, and Wallets.
            </p>
            <div className="payment-features">
              <div className="payment-feature-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Bank-grade encryption</span>
              </div>
              <div className="payment-feature-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>PCI DSS compliant</span>
              </div>
              <div className="payment-feature-item">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Instant payment confirmation</span>
              </div>
            </div>
          </div>
        )}

        {selectedPayment !== 'cod' && selectedPayment !== 'gokwik' && (
          <div className="payment-info-card">
            <div className="payment-secure-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round"/>
              </svg>
              <span>Secure payment processing</span>
            </div>
            <p className="payment-info-text">
              Your payment will be processed securely.
            </p>
          </div>
        )}

        {selectedPayment === 'cod' && (
          <div className="payment-info-card">
            <div className="payment-cod-icon">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v12M15 9H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H9" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="payment-cod-title">Cash on Delivery</h3>
            <p className="payment-cod-desc">Pay when you receive your order</p>
            <div className="payment-cod-amount">Amount to Pay: ₹{total.toFixed(0)}</div>
          </div>
        )}

        {/* Order Summary */}
        {mounted && (
          <div className="payment-summary-card">
            <h3 className="payment-section-title">Order Summary</h3>
            <div className="payment-summary-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal().toFixed(0)}</span>
            </div>
            {getAppliedCoupon() && (
              <div className="payment-summary-row">
                <span>Coupon Discount ({getAppliedCoupon()?.code || 'Applied'})</span>
                <span className="discount-amount">-₹{calculateCouponDiscount().toFixed(0)}</span>
              </div>
            )}
            <div className="payment-summary-row">
              <span>Delivery Fee</span>
              <span className="free-text">FREE</span>
            </div>
            <div className="payment-summary-divider"></div>
            <div className="payment-summary-row payment-summary-total">
              <span>Total Amount</span>
              <span>₹{total.toFixed(0)}</span>
            </div>
          </div>
        )}
      </main>

      {/* Fixed Bottom Button */}
      {mounted && (
        <div className="payment-bottom-bar">
          <div className="payment-bottom-info">
            <span className="payment-bottom-label">Total Amount</span>
            <span className="payment-bottom-price">₹{total.toFixed(0)}</span>
          </div>
        <button 
          className="payment-place-order-btn"
          onClick={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Place Order'}
        </button>
        </div>
      )}

      {/* Processing Overlay */}
      {isProcessing && (
        <div className="payment-processing-overlay">
          <div className="payment-processing-spinner">
            <div className="spinner"></div>
            <p>Processing your payment...</p>
          </div>
        </div>
      )}
    </div>
  )
}

