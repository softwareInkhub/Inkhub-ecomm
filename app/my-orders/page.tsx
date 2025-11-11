'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Order {
  orderId: string
  items: any[]
  total: number
  status: string
  orderDate: string
}

export default function MyOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/profile')
      return
    }

    // Load orders from localStorage
    const savedOrders = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
    setOrders(savedOrders)
  }, [router])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'confirmed': '#10b981',
      'processing': '#f59e0b',
      'shipped': '#3b82f6',
      'delivered': '#22c55e',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="orders-page">
      <header className="orders-header">
        <button className="back-btn" onClick={() => router.push('/profile')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="orders-title">My Orders</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="orders-main">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                {/* Box outline */}
                <rect x="20" y="40" width="80" height="60" stroke="#333333" strokeWidth="1.5" fill="none" rx="2"/>
                {/* Box interior (dark) */}
                <rect x="22" y="42" width="76" height="56" fill="#333333" rx="1"/>
                {/* Left flap */}
                <path d="M20 40 L30 25 L30 40 Z" fill="#333333" stroke="#333333" strokeWidth="1"/>
                {/* Right flap */}
                <path d="M100 40 L90 25 L90 40 Z" fill="#333333" stroke="#333333" strokeWidth="1"/>
                {/* Blue accent lines on front */}
                <line x1="35" y1="70" x2="65" y2="70" stroke="#6A6AFE" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="35" y1="80" x2="65" y2="80" stroke="#6A6AFE" strokeWidth="1.5" strokeLinecap="round"/>
                {/* Side label rectangle */}
                <rect x="75" y="65" width="18" height="18" stroke="#6A6AFE" strokeWidth="1" fill="none" rx="1"/>
                <line x1="78" y1="70" x2="88" y2="70" stroke="#6A6AFE" strokeWidth="0.8"/>
                <line x1="78" y1="74" x2="88" y2="74" stroke="#6A6AFE" strokeWidth="0.8"/>
                <line x1="78" y1="78" x2="88" y2="78" stroke="#6A6AFE" strokeWidth="0.8"/>
                {/* Question marks */}
                <text x="70" y="22" fill="#6A6AFE" fontSize="20" fontWeight="500">?</text>
                <text x="80" y="18" fill="#6A6AFE" fontSize="20" fontWeight="500">?</text>
                <text x="90" y="24" fill="#6A6AFE" fontSize="20" fontWeight="500">?</text>
              </svg>
            </div>
            <h2 className="orders-empty-title">You haven't placed any order yet!</h2>
            <p className="orders-empty-text">Once you place an order, you'll be able to track it here.</p>
            <button className="orders-shop-btn" onClick={() => router.push('/')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.orderId} className="order-card" onClick={() => router.push(`/track-order?orderId=${order.orderId}`)}>
                <div className="order-card-header">
                  <div className="order-id">Order #{order.orderId.slice(-8)}</div>
                  <div className="order-status" style={{ color: getStatusColor(order.status) }}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                </div>
                
                <div className="order-card-items">
                  {order.items.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="order-item-mini">
                      <img src={item.image} alt={item.name} className="order-item-image" />
                      <div className="order-item-info">
                        <p className="order-item-name">{item.name}</p>
                        <p className="order-item-qty">Qty: {item.quantity || 1}</p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="order-more-items">+{order.items.length - 2} more items</p>
                  )}
                </div>

                <div className="order-card-footer">
                  <div className="order-date">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" strokeLinecap="round"/>
                      <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{formatDate(order.orderDate)}</span>
                  </div>
                  <div className="order-total">₹{order.total.toFixed(0)}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
