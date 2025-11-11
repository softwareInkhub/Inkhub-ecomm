import React, { useState, useEffect } from 'react'

const WishlistToast = () => {
  const [showToast, setShowToast] = useState(false)
  const [productName, setProductName] = useState('')
  const [wasAdded, setWasAdded] = useState(true)

  useEffect(() => {
    const handleWishlistUpdate = (event: any) => {
      setProductName(event.detail.productName)
      setWasAdded(event.detail.added)
      setShowToast(true)

      setTimeout(() => {
        setShowToast(false)
      }, 3000)
    }

    window.addEventListener('wishlistUpdated', handleWishlistUpdate)

    return () => {
      window.removeEventListener('wishlistUpdated', handleWishlistUpdate)
    }
  }, [])

  const handleClose = () => {
    setShowToast(false)
  }

  if (!showToast) return null

  return (
    <div className="wishlist-toast">
      <div className="wishlist-toast-content">
        <span className="wishlist-toast-message">
          {wasAdded ? `${productName} added to wishlist` : `${productName} removed from wishlist`}
        </span>
        <button className="wishlist-toast-close" onClick={handleClose}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default WishlistToast



