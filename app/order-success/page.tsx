'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface OrderDetails {
  orderId: string
  items: any[]
  total: number
  subtotal?: number
  couponDiscount?: number
  appliedCoupon?: string
  paymentMethod: string
  orderDate: string
  address: {
    fullName: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
    phoneNumber: string
  }
}

export default function OrderSuccessPage() {
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/profile')
      return
    }

    // Get order details from latest order
    const orders = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
    if (orders.length > 0) {
      setOrderDetails(orders[0])
    } else {
      router.push('/')
    }
  }, [router])

  if (!orderDetails) {
    return null
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getPaymentMethodName = (method: string) => {
    const methods: {[key: string]: string} = {
      'upi': 'UPI',
      'card': 'Credit/Debit Card',
      'netbanking': 'Net Banking',
      'wallet': 'Wallet',
      'cod': 'Cash on Delivery'
    }
    return methods[method] || method
  }

  const estimatedDelivery = () => {
    const scheduledDelivery = localStorage.getItem('scheduledDelivery')
    if (scheduledDelivery) {
      const delivery = JSON.parse(scheduledDelivery)
      return delivery.displayText
    }
    const date = new Date()
    date.setMinutes(date.getMinutes() + 60)
    return 'Within 60 minutes - Expected by ' + date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getDeliveryType = () => {
    const scheduledDelivery = localStorage.getItem('scheduledDelivery')
    return scheduledDelivery ? 'Scheduled Delivery' : 'Express Delivery'
  }

  return (
    <div className="order-success-page">
      {/* Success Animation Section */}
      <div className="order-success-header">
        <div className="success-checkmark">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="38" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth="2"/>
            <path d="M25 40 L35 50 L55 30" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">Thank you for your order</p>
        <div className="order-id-badge">
          Order ID: {orderDetails.orderId}
        </div>
      </div>

      <main className="order-success-main">
        {/* Delivery Estimate */}
        <div className="delivery-estimate-card">
          <div className="delivery-estimate-icon">
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="1.5"/>
              <circle cx="18.5" cy="18.5" r="1.5"/>
            </svg>
          </div>
          <h2 className="delivery-estimate-title">{getDeliveryType()}</h2>
          <p className="delivery-estimate-time">{estimatedDelivery()}</p>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3 className="order-section-title">Order Items ({orderDetails.items.length})</h3>
          <div className="order-items-list">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="order-item-image">
                  <img src={item.image} alt={item.name || item.title || 'Product'} />
                </div>
                <div className="order-item-details">
                  <p className="order-item-name">{item.name || item.title}</p>
                  <p className="order-item-quantity">Qty: {item.quantity || 1}</p>
                </div>
                <div className="order-item-price">
                  ₹{(parseFloat(item.price?.toString() || '0') * (item.quantity || 1)).toFixed(0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment & Delivery Info */}
        <div className="order-info-card">
          <h3 className="order-section-title">Payment & Delivery Details</h3>
          
          <div className="order-info-section">
            <div className="order-info-label">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <span>Payment Method</span>
            </div>
            <div className="order-info-value">{getPaymentMethodName(orderDetails.paymentMethod)}</div>
          </div>

          <div className="order-info-divider"></div>

          <div className="order-info-section">
            <div className="order-info-label">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>Delivery Address</span>
            </div>
            <div className="order-info-value">
              <p>{orderDetails.address.fullName}</p>
              <p>{orderDetails.address.addressLine1}</p>
              {orderDetails.address.addressLine2 && <p>{orderDetails.address.addressLine2}</p>}
              <p>{orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.pincode}</p>
              <p className="order-info-phone">{orderDetails.address.phoneNumber}</p>
            </div>
          </div>

          <div className="order-info-divider"></div>

          <div className="order-info-section">
            <div className="order-info-label">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Order Date</span>
            </div>
            <div className="order-info-value">{formatDate(orderDetails.orderDate)}</div>
          </div>
        </div>

        {/* Price Summary */}
        <div className="order-summary-card">
          <h3 className="order-section-title">Price Details</h3>
          <div className="order-summary-row">
            <span>Subtotal</span>
            <span>₹{(orderDetails.subtotal || orderDetails.total).toFixed(0)}</span>
          </div>
          {orderDetails.appliedCoupon && orderDetails.couponDiscount && orderDetails.couponDiscount > 0 && (
            <div className="order-summary-row">
              <span>Coupon Discount ({orderDetails.appliedCoupon})</span>
              <span className="discount-amount">-₹{orderDetails.couponDiscount.toFixed(0)}</span>
            </div>
          )}
          <div className="order-summary-row">
            <span>Delivery Fee</span>
            <span className="free-delivery">FREE</span>
          </div>
          <div className="order-summary-divider"></div>
          <div className="order-summary-row order-summary-total">
            <span>Total Paid</span>
            <span>₹{orderDetails.total.toFixed(0)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-actions">
          <button 
            className="order-track-btn"
            onClick={() => router.push(`/track-order?orderId=${orderDetails.orderId}`)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Track Order
          </button>
          <button 
            className="order-continue-btn"
            onClick={() => router.push('/')}
          >
            Continue Shopping
          </button>
        </div>

        {/* Help Section */}
        <div className="order-help-card">
          <h4 className="order-help-title">Need Help?</h4>
          <p className="order-help-text">
            Contact our customer support for any queries about your order
          </p>
          <div className="order-help-contacts">
            <a href="tel:+911234567890" className="order-help-link">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Support
            </a>
            <a href="mailto:support@Inkhub.com" className="order-help-link">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Email Support
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
