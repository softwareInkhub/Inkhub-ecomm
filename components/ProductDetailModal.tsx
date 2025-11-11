'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Product } from '@/types'

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onAddToCart: (productId: string) => void
  onBuyNow: (productId: string) => void
  onWishlistClick: (productId: string) => void
  onShare: () => void
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onBuyNow,
  onWishlistClick,
  onShare
}) => {
  const [quantity, setQuantity] = useState(1)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [mouseStart, setMouseStart] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [iconPosition, setIconPosition] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [thumbnailTouchStart, setThumbnailTouchStart] = useState<number | null>(null)
  const [thumbnailTouchEnd, setThumbnailTouchEnd] = useState<number | null>(null)
  const [imageDragStart, setImageDragStart] = useState<number | null>(null)
  const [isImageDragging, setIsImageDragging] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const swipeIconRef = useRef<HTMLDivElement>(null)

  const minSwipeDistance = 50

  useEffect(() => {
    if (product) {
      const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
      setIsWishlisted(wishlist.some((item: Product) => item.id === product.id))
      setSelectedImageIndex(0)
    }
  }, [product])

  // Generate multiple images for each product
  const getProductImages = (productItem: Product | null) => {
    if (!productItem) return []
    
    // Use images from API if available
    if (productItem.images && productItem.images.length > 0) {
      return productItem.images
    }
    
    // Fallback to single image if images array is not available
    if (productItem.image) {
      return [productItem.image]
    }
    
    // Final fallback - simple grey placeholder
    return ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E']
  }

  const productImages = getProductImages(product)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const handleAddToCart = useCallback(() => {
    if (onAddToCart && product?.id) {
      onAddToCart(product.id)
    }
  }, [onAddToCart, product?.id])

  const handleBuyNow = useCallback(() => {
    if (onBuyNow && product?.id) {
      onBuyNow(product.id)
    }
  }, [onBuyNow, product?.id])

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
      // Fix direction: negate to move with cursor/finger
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

  const handleHeartClick = () => {
    setIsWishlisted(!isWishlisted)
    if (onWishlistClick && product?.id) {
      onWishlistClick(product.id)
    }
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedImageIndex(index)
  }

  const handleThumbnailTouchStart = (e: React.TouchEvent) => {
    setThumbnailTouchEnd(null)
    setThumbnailTouchStart(e.targetTouches[0].clientX)
  }

  const handleThumbnailTouchMove = (e: React.TouchEvent) => {
    setThumbnailTouchEnd(e.targetTouches[0].clientX)
  }

  const handleThumbnailTouchEnd = () => {
    if (!thumbnailTouchStart || !thumbnailTouchEnd) {
      setThumbnailTouchStart(null)
      setThumbnailTouchEnd(null)
      return
    }
    
    const distance = thumbnailTouchStart - thumbnailTouchEnd
    const minSwipe = 50
    
    if (Math.abs(distance) > minSwipe) {
      if (distance > 0) {
        // Swiped left, go to next image
        setSelectedImageIndex((prev) => (prev + 1) % productImages.length)
      } else {
        // Swiped right, go to previous image
        setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
      }
    }
    
    setThumbnailTouchStart(null)
    setThumbnailTouchEnd(null)
  }

  const handleImageMouseDown = (e: React.MouseEvent) => {
    // Don't start drag if clicking on buttons
    if ((e.target as HTMLElement).closest('.product-detail-modal-actions')) return
    setIsImageDragging(true)
    setImageDragStart(e.clientX)
    e.preventDefault()
  }

  // Handle mouse drag for main image
  useEffect(() => {
    if (!isImageDragging) return

    const handleImageMouseMove = (e: MouseEvent) => {
      if (imageDragStart !== null) {
        const distance = e.clientX - imageDragStart
        // Visual feedback could be added here if needed
      }
    }

    const handleImageMouseUp = (e: MouseEvent) => {
      if (imageDragStart !== null) {
        const distance = e.clientX - imageDragStart
        const minSwipe = 50
        
        if (Math.abs(distance) > minSwipe) {
          if (distance > 0) {
            // Dragged right, show previous image
            setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
          } else {
            // Dragged left, show next image
            setSelectedImageIndex((prev) => (prev + 1) % productImages.length)
          }
        }
        
        setIsImageDragging(false)
        setImageDragStart(null)
      }
    }

    document.addEventListener('mousemove', handleImageMouseMove)
    document.addEventListener('mouseup', handleImageMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleImageMouseMove)
      document.removeEventListener('mouseup', handleImageMouseUp)
    }
  }, [isImageDragging, imageDragStart, productImages.length])

  if (!isOpen || !product) return null

  const currentPrice = parseFloat(product.price?.toString() || '0')
  const discountMap: {[key: string]: number} = {
    '1': 25,
    '2': 30,
    '3': 20,
    '4': 40,
    '5': 35,
    '6': 15
  }
  const discountPercent = discountMap[product.id] || 25
  const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100))

  
  return (
    <>
    <div className="product-detail-modal-overlay" onClick={onClose}>
      <div className="product-detail-modal" onClick={(e) => e.stopPropagation()} ref={modalRef}>
        <div className="product-detail-modal-header">
          <button className="product-detail-close" onClick={onClose}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="product-detail-modal-image-section">
          <div 
            className="product-detail-modal-image"
            onTouchStart={handleThumbnailTouchStart}
            onTouchMove={handleThumbnailTouchMove}
            onTouchEnd={handleThumbnailTouchEnd}
            onMouseDown={handleImageMouseDown}
            style={{ cursor: isImageDragging ? 'grabbing' : 'grab' }}
          >
            <img src={productImages[selectedImageIndex]} alt={product.title || product.name || 'Product'} />
            <div className="product-detail-modal-actions">
              <button className={`product-detail-heart ${isWishlisted ? 'active' : ''}`} onClick={handleHeartClick}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button className="product-detail-share" onClick={onShare}>
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>
          
          {productImages.length > 1 && (
            <div 
              className="product-detail-thumbnails"
              onTouchStart={handleThumbnailTouchStart}
              onTouchMove={handleThumbnailTouchMove}
              onTouchEnd={handleThumbnailTouchEnd}
            >
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`product-detail-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img src={img} alt={`${product.title || product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-modal-content">
          <h2 className="product-detail-title">{product.title || product.name}</h2>
          <p className="product-detail-description">{product.description || (product as any).desc}</p>

          <div className="product-detail-features">
            <div className="product-feature-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>100% Organic</span>
            </div>
            <div className="product-feature-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>7 Day Return</span>
            </div>
            <div className="product-feature-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7"/>
              </svg>
              <span>Free Delivery</span>
            </div>
            <div className="product-feature-badge">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Easy Care</span>
            </div>
          </div>

          <div className="product-detail-price-section">
            <div className="product-detail-price-container">
              <div className="product-detail-price-row">
                <span className="product-detail-price">₹{currentPrice.toFixed(0)}</span>
                <span className="product-detail-discount">{discountPercent}% off</span>
              </div>
              <span className="product-detail-previous-price">₹{previousPrice}</span>
            </div>
          </div>

          <div className="product-detail-quantity-section">
            <span className="product-detail-quantity-label">Quantity</span>
            <div className="product-detail-quantity-controls">
              <button className="product-detail-quantity-btn" onClick={() => handleQuantityChange(-1)}>-</button>
              <span className="product-detail-quantity-value">{quantity}</span>
              <button className="product-detail-quantity-btn" onClick={() => handleQuantityChange(1)}>+</button>
            </div>
          </div>

          <div className="product-detail-info-section">
            <h3 className="product-detail-info-title">About This Plant</h3>
            <p className="product-detail-info-text">
              This beautiful plant is perfect for indoor spaces, bringing nature's freshness into your home. 
              It requires minimal maintenance and thrives in indirect sunlight. Water it once a week and watch 
              it grow into a stunning addition to your space.
            </p>
          </div>

          <div className="product-detail-care-section">
            <h3 className="product-detail-info-title">Care Instructions</h3>
            <div className="product-detail-care-list">
              <div className="product-care-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <div>
                  <strong>Light:</strong> Indirect sunlight, bright but filtered
                </div>
              </div>
              <div className="product-care-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                </svg>
                <div>
                  <strong>Water:</strong> Once a week, keep soil slightly moist
                </div>
              </div>
              <div className="product-care-item">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                <div>
                  <strong>Temperature:</strong> 18-24°C, comfortable room temperature
                </div>
              </div>
            </div>
          </div>

          <div className="product-detail-return-policy">
            <h3 className="product-detail-info-title">Return & Refund Policy</h3>
            <p className="product-detail-info-text">
              We offer a 7-day return policy on all plants. If you're not satisfied with your purchase, 
              you can return it within 7 days of delivery. Plants must be in their original condition 
              and packaging. Contact our support team for return authorization.
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Separate Swipe Modal */}
      <div className="product-swipe-modal-overlay">
        <div className="product-swipe-modal" onClick={(e) => e.stopPropagation()}>
          <div className="product-detail-swipe-section" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <div className="product-detail-swipe-button left-swipe" onClick={handleBuyNow}>
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
              <span>Buy Now</span>
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
            <div className="product-detail-swipe-button right-swipe" onClick={handleAddToCart}>
              <span>Add to Cart</span>
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
    </>
  )
}

export default ProductDetailModal

