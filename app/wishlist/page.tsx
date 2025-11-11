'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import CartToast from '@/components/CartToast'
import WishlistToast from '@/components/WishlistToast'
import type { Product } from '@/types'

export default function WishlistPage() {
  const router = useRouter()
  const [wishlist, setWishlist] = useState<Product[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeImageIndex, setActiveImageIndex] = useState<{[key: string]: number}>({})
  const touchStartX = useRef<{[key: string]: number | null}>({})
  const touchEndX = useRef<{[key: string]: number | null}>({})
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    const loadWishlist = () => {
      const items = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
      setWishlist(items)
      
      // Initialize active image index for each item
      const initialIndices: {[key: string]: number} = {}
      items.forEach((item: Product) => {
        initialIndices[item.id] = 0
      })
      setActiveImageIndex(initialIndices)
    }
    
    loadWishlist()
    
    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', loadWishlist)
    return () => window.removeEventListener('wishlistUpdated', loadWishlist)
  }, [])

  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
      setCartCount(cartItems.length)
    }

    updateCartCount()
    window.addEventListener('cartUpdated', updateCartCount)
    window.addEventListener('storage', updateCartCount)

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount)
      window.removeEventListener('storage', updateCartCount)
    }
  }, [])

  const filteredItems = activeFilter === 'all' 
    ? wishlist 
    : wishlist.filter(item => item.category === activeFilter)

  // Get unique categories from wishlist items
  const getAvailableCategories = () => {
    const categories = new Set(wishlist.map(item => item.category))
    return Array.from(categories).filter(Boolean) // Remove null/undefined
  }

  const availableCategories = getAvailableCategories()

  // Category display name mapping
  const categoryDisplayNames: Record<string, string> = {
    'Spiritual Collection': 'Spiritual Collection',
    'Love & Couple Tattoos': 'Love & Couple',
    'Anime & Pop Tattoos': 'Anime & Pop',
    'Animal Tattoos': 'Animal',
    'Minimal Tattoos': 'Minimal',
    'Bold & Dark Tattoos': 'Bold & Dark',
    'Tattoos Packs': 'Packs',
    'Body Placement Tattoos': 'Body Placement',
    'Lifestyle Tattoos': 'Lifestyle',
    'Tattoos Size & Type': 'Size & Type'
  }

  // Generate multiple images for each item (for demo purposes)
  const getItemImages = (item: Product | undefined) => {
    if (!item) return []
    
    // Use images from API if available
    if (item.images && item.images.length > 0) {
      return item.images
    }
    
    // Fallback to single image if images array is not available
    if (item.image) {
      return [item.image]
    }
    
    // Final fallback - simple grey placeholder
    return ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E']
  }

  // Calculate previous price and discount for demo purposes
  const getPriceInfo = (item: Product) => {
    const currentPrice = parseFloat(item.price?.toString() || '0')
    
    // Fixed discount percent based on product ID for consistency
    const discountMap: {[key: string]: number} = {
      '1': 25,
      '2': 30,
      '3': 20,
      '4': 40,
      '5': 35,
      '6': 15
    }
    
    const discountPercent = discountMap[item.id] || 25
    const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100))
    
    return {
      currentPrice: currentPrice.toFixed(0),
      previousPrice: previousPrice.toFixed(0),
      discountPercent
    }
  }

  const handleImageChange = (itemId: string, direction: 'next' | 'prev') => {
    setActiveImageIndex(prev => {
      const images = getItemImages(wishlist.find(i => i.id === itemId))
      const currentIndex = prev[itemId] || 0
      let newIndex
      
      if (direction === 'next') {
        newIndex = (currentIndex + 1) % images.length
      } else {
        newIndex = (currentIndex - 1 + images.length) % images.length
      }
      
      return { ...prev, [itemId]: newIndex }
    })
  }

  const handleTouchStart = (itemId: string, e: React.TouchEvent) => {
    touchStartX.current = { ...touchStartX.current, [itemId]: e.touches[0].clientX }
  }

  const handleTouchMove = (itemId: string, e: React.TouchEvent) => {
    touchEndX.current = { ...touchEndX.current, [itemId]: e.touches[0].clientX }
  }

  const handleTouchEnd = (itemId: string) => {
    const startX = touchStartX.current[itemId]
    const endX = touchEndX.current[itemId]
    
    if (!startX || !endX) {
      touchStartX.current = { ...touchStartX.current, [itemId]: null }
      touchEndX.current = { ...touchEndX.current, [itemId]: null }
      return
    }
    
    const distance = startX - endX
    const minSwipeDistance = 50
    
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swiped left, go to next image
        handleImageChange(itemId, 'next')
      } else {
        // Swiped right, go to previous image
        handleImageChange(itemId, 'prev')
      }
    }
    
    touchStartX.current = { ...touchStartX.current, [itemId]: null }
    touchEndX.current = { ...touchEndX.current, [itemId]: null }
  }

  const handleAddToCart = (itemId: string) => {
    const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    const item = wishlist.find(i => i.id === itemId)
    
    if (!item) return
    
    if (!cartItems.find((i: Product) => i.id === itemId)) {
      cartItems.push(item)
      localStorage.setItem('bagichaCart', JSON.stringify(cartItems))
      
      // Trigger cart update event
      window.dispatchEvent(new Event('cartUpdated'))
      
      // Trigger cart toast notification
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: item.title || item.name, added: true }
      }))
    } else {
      // Trigger cart toast notification for already in cart
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: item.title || item.name, added: false, message: 'already in cart' }
      }))
    }
  }

  const handleShare = (itemId: string) => {
    const item = wishlist.find(i => i.id === itemId)
    if (!item) return
    
    if (navigator.share) {
      navigator.share({
        title: item.title || item.name,
        text: item.description,
        url: window.location.href
      }).catch(() => alert('Share functionality not available'))
    } else {
      alert(`Share ${item.title || item.name}!`)
    }
  }

  const handleRemoveFromWishlist = (itemId: string) => {
    const item = wishlist.find(w => w.id === itemId)
    const updatedWishlist = wishlist.filter(w => w.id !== itemId)
    setWishlist(updatedWishlist)
    localStorage.setItem('bagichaWishlist', JSON.stringify(updatedWishlist))
    window.dispatchEvent(new CustomEvent('wishlistUpdated', {
      detail: { productName: item?.title || item?.name || 'Item', added: false }
    }))
  }

  return (
    <div className="wishlist-page">
      <CartToast />
      <WishlistToast />
      <header className="wishlist-header">
        <div className="wishlist-header-content">
          <div className="wishlist-header-left">
            <button className="back-btn" onClick={() => router.back()}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <div className="wishlist-logo">
              <span className="logo-text">Bagicha</span>
            </div>
          </div>
          <div className="wishlist-header-right">
            <button className="icon-btn" onClick={() => router.push('/search')}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <button className="icon-btn cart-icon-btn" aria-label="Cart" onClick={() => router.push('/cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="wishlist-main">
        <div className="wishlist-content">
          <h1 className="wishlist-title">Wishlist</h1>

          {wishlist.length > 0 && availableCategories.length > 0 && (
            <div className="wishlist-filter">
              <button 
                className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} 
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              {availableCategories.map(category => (
                <button 
                  key={category}
                  className={`filter-btn ${activeFilter === category ? 'active' : ''}`} 
                  onClick={() => setActiveFilter(category)}
                >
                  {categoryDisplayNames[category] || category}
                </button>
              ))}
            </div>
          )}

          {filteredItems.length === 0 ? (
            <div className="empty-wishlist">
              <div className="empty-state-icon">
                <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h2 className="empty-state-title">Fill your wishlist?</h2>
              <p className="empty-state-text">Save your favorite plants and flowers to buy them later</p>
              <button className="start-shopping-btn" onClick={() => router.push('/')}>
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="wishlist-items">
              {filteredItems.map(item => {
                const images = getItemImages(item)
                const currentIndex = activeImageIndex[item.id] || 0
                const priceInfo = getPriceInfo(item)
                
                return (
                  <div key={item.id} className="wishlist-item">
                    <div className="wishlist-item-image">
                      <div 
                        className="image-carousel-container"
                        onTouchStart={(e) => handleTouchStart(item.id, e)}
                        onTouchMove={(e) => handleTouchMove(item.id, e)}
                        onTouchEnd={() => handleTouchEnd(item.id)}
                      >
                        <img 
                          src={images[currentIndex]} 
                          alt={item.title || item.name || 'Product'} 
                          className="carousel-image"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E'
                          }}
                        />
                        
                        {/* Wishlist Remove Icon */}
                        <button 
                          className="wishlist-remove-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFromWishlist(item.id)
                          }}
                          aria-label="Remove from wishlist"
                        >
                          <svg 
                            width="24" 
                            height="24" 
                            fill="currentColor" 
                            stroke="currentColor" 
                            strokeWidth="0" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                        </button>
                        
                        {images.length > 1 && (
                          <div className="carousel-dots">
                            {images.map((_, idx) => (
                              <button
                                key={idx}
                                className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveImageIndex(prev => ({ ...prev, [item.id]: idx }))
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="wishlist-item-info">
                      <h3 className="wishlist-item-name">{item.title || item.name}</h3>
                      <p className="wishlist-item-desc">{item.description}</p>
                      <div className="wishlist-item-footer">
                        <div className="wishlist-price-container">
                          <div className="wishlist-price-row">
                            <span className="wishlist-item-price">₹{priceInfo.currentPrice}</span>
                            <span className="wishlist-discount-badge">{priceInfo.discountPercent}% off</span>
                          </div>
                          <span className="wishlist-previous-price">₹{priceInfo.previousPrice}</span>
                        </div>
                        <button className="product-cart-icon-btn" onClick={(e) => {
                          e.stopPropagation()
                          handleAddToCart(item.id)
                        }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M3 6H21" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
