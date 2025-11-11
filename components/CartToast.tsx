'use client'

import React, { useState, useEffect } from 'react'

interface CartToastEvent extends CustomEvent {
  detail: {
    productName: string
    added: boolean
    message?: string
  }
}

const CartToast = () => {
  const [showToast, setShowToast] = useState(false)
  const [productName, setProductName] = useState('')
  const [wasAdded, setWasAdded] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CartToastEvent
      setProductName(customEvent.detail.productName)
      setWasAdded(customEvent.detail.added)
      setMessage(customEvent.detail.message || '')
      setShowToast(true)

      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    }

    window.addEventListener('cartUpdatedToast', handleCartUpdate)

    return () => {
      window.removeEventListener('cartUpdatedToast', handleCartUpdate)
    }
  }, [])

  const handleClose = () => {
    setShowToast(false)
  }

  if (!showToast) return null

  return (
    <div className="cart-toast">
      <div className="cart-toast-content">
        <span className="cart-toast-message">
          {message ? `${productName} is ${message}` : (wasAdded ? `${productName} added to cart` : `${productName} removed from cart`)}
        </span>
        <button className="cart-toast-close" onClick={handleClose}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default CartToast


