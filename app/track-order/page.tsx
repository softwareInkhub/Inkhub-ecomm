'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface OrderDetails {
  orderId: string
  items: any[]
  total: number
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

function TrackOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (!isAuthenticated) {
      router.push('/profile')
      return
    }

    const orderId = searchParams.get('orderId')
    const orders = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
    
    const order = orderId 
      ? orders.find((o: OrderDetails) => o.orderId === orderId)
      : orders[0]

    if (order) {
      setOrderDetails(order)
    } else {
      router.push('/')
    }
  }, [router, searchParams])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!orderDetails) return null

  const statusSteps = [
    { id: 'confirmed', label: 'Order Confirmed', completed: true },
    { id: 'preparing', label: 'Preparing Order', completed: false },
    { id: 'shipped', label: 'Out for Delivery', completed: false },
    { id: 'delivered', label: 'Delivered', completed: false }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button onClick={() => router.push('/profile')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">Track Order</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4 max-w-md mx-auto">
        {/* Order Info */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Order ID</span>
            <span className="text-sm font-bold text-gray-900">{orderDetails.orderId}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>Estimated Delivery: 45-50 mins</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-6">Order Status</h3>
          <div className="space-y-6">
            {statusSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.completed ? 'bg-black' : 'bg-gray-200'
                  }`}>
                    {step.completed ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                        <path d="M5 8l2 2 4-4"/>
                      </svg>
                    ) : (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  {index < statusSteps.length - 1 && (
                    <div className={`w-0.5 h-full mt-2 ${
                      step.completed ? 'bg-black' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                <div className="flex-1 pb-6">
                  <p className={`text-sm font-semibold ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  {step.completed && index === 0 && (
                    <p className="text-xs text-gray-500 mt-1">{formatDate(orderDetails.orderDate)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Delivery Address</h3>
          <div className="flex gap-3">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400 mt-0.5 flex-shrink-0">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <div className="text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold text-gray-900 mb-1">{orderDetails.address.fullName}</p>
              <p>{orderDetails.address.addressLine1}</p>
              {orderDetails.address.addressLine2 && <p>{orderDetails.address.addressLine2}</p>}
              <p>{orderDetails.address.city}, {orderDetails.address.state} - {orderDetails.address.pincode}</p>
              <p className="mt-2">📞 {orderDetails.address.phoneNumber}</p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Order Items ({orderDetails.items.length})</h3>
          <div className="space-y-3">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name || item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name || item.title}</p>
                  <p className="text-xs text-gray-600">Qty: {item.quantity || 1}</p>
                </div>
                <div className="text-sm font-bold text-gray-900">₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Button */}
        <button 
          onClick={() => router.push('/profile')}
          className="w-full bg-blue-50 border border-blue-200 text-blue-700 py-3 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors"
        >
          Need Help? Contact Support
        </button>
      </main>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
      <TrackOrderContent />
    </Suspense>
  )
}
