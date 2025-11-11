'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface SwipeModalProps {
  onAddToCart: () => void
  onBuyNow: () => void
}

const SwipeModal: React.FC<SwipeModalProps> = ({ onAddToCart, onBuyNow }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [mouseStart, setMouseStart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [iconPosition, setIconPosition] = useState(0)
  const swipeIconRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  const handleAddToCart = useCallback(() => {
    if (onAddToCart) {
      onAddToCart()
    }
  }, [onAddToCart])

  const handleBuyNow = useCallback(() => {
    if (onBuyNow) {
      onBuyNow()
    }
  }, [onBuyNow])

  // Mouse event handlers
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setMouseStart(e.clientX)
    e.preventDefault()
  }

  // Touch event handlers
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
    if (touchStart !== null) {
      const distance = e.targetTouches[0].clientX - touchStart
      setIconPosition(distance)
    }
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIconPosition(0)
      return
    }
    
    const distance = touchEnd - touchStart
    const isLeftSwipe = distance < -minSwipeDistance
    const isRightSwipe = distance > minSwipeDistance

    if (isRightSwipe) {
      handleAddToCart()
    } else if (isLeftSwipe) {
      handleBuyNow()
    }
    
    setTouchStart(null)
    setTouchEnd(null)
    setTimeout(() => setIconPosition(0), 300)
  }

  // Handle mouse move globally when dragging
  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (mouseStart !== null) {
        const distance = e.clientX - mouseStart
        setIconPosition(distance)
      }
    }

    const handleMouseUp = () => {
      if (mouseStart !== null) {
        const distance = iconPosition
        const isLeftSwipe = distance < -minSwipeDistance
        const isRightSwipe = distance > minSwipeDistance

        if (isRightSwipe) {
          handleAddToCart()
        } else if (isLeftSwipe) {
          handleBuyNow()
        }
        
        setIsDragging(false)
        setMouseStart(null)
        setTimeout(() => setIconPosition(0), 300)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, mouseStart, iconPosition, handleAddToCart, handleBuyNow])

  // Calculate opacity based on swipe position
  // When swiping left (negative position), fade "Buy Now"
  // When swiping right (positive position), fade "Add to Cart"
  const maxSwipeDistance = 150
  const buyNowOpacity = Math.max(0, 1 - Math.abs(Math.min(0, iconPosition)) / maxSwipeDistance)
  const addToCartOpacity = Math.max(0, 1 - Math.abs(Math.max(0, iconPosition)) / maxSwipeDistance)

  return (
    <div className="product-swipe-modal-overlay">
      <div className="product-swipe-modal" onClick={(e) => e.stopPropagation()}>
        <div className="product-detail-swipe-section" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
          <div className="product-detail-swipe-button left-swipe buy-now-button" onClick={handleBuyNow}>
            <div className="swipe-arrows-container">
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </div>
            <span style={{ opacity: buyNowOpacity, transition: 'opacity 0.2s ease' }}>Buy Now</span>
          </div>
          <div 
            className="product-detail-swipe-icon" 
            ref={swipeIconRef}
            onMouseDown={onMouseDown}
            style={{ 
              transform: `translateX(${iconPosition}px)`,
              transition: isDragging || touchStart !== null ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <img src="/images/icon_buy_now.webp" alt="Buy Now Icon" />
          </div>
          <div className="product-detail-swipe-button right-swipe add-to-cart-button" onClick={handleAddToCart}>
            <span style={{ opacity: addToCartOpacity, transition: 'opacity 0.2s ease' }}>Add to Cart</span>
            <div className="swipe-arrows-container">
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
              <svg className="swipe-arrow" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwipeModal

