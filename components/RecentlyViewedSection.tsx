'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const RecentlyViewedSection = () => {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [selectedImageIndices, setSelectedImageIndices] = useState<Record<string, number>>({})
  const [touchStartX, setTouchStartX] = useState<Record<string, any>>({})
  const [touchEndX, setTouchEndX] = useState<Record<string, any>>({})
  const [wishlistedIds, setWishlistedIds] = useState<any[]>([])

  useEffect(() => {
    // Load recently viewed products
    const recentlyViewed = JSON.parse(localStorage.getItem('bagichaRecentlyViewed') || '[]')
    setProducts(recentlyViewed.slice(0, 10))
    
    // Load wishlist
    const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
    setWishlistedIds(wishlist.map((item: any) => item.id))
  }, [])

  const getProductImages = (productItem: any) => {
    if (!productItem) return []
    if (productItem.images && productItem.images.length > 0) {
      return productItem.images
    }
    if (productItem.image) {
      return [productItem.image]
    }
    return ['../assets/images/arm_band_banner.webp']
  }

  const handleImageTouchStart = (productId: any, e: any) => {
    setTouchEndX(prev => ({ ...prev, [productId]: null }))
    setTouchStartX(prev => ({ ...prev, [productId]: e.targetTouches[0].clientX }))
  }

  const handleImageTouchMove = (productId: any, e: any) => {
    setTouchEndX(prev => ({ ...prev, [productId]: e.targetTouches[0].clientX }))
  }

  const handleImageTouchEnd = (productId: any, productImages: any) => {
    if (!touchStartX[productId] || !touchEndX[productId]) {
      setTouchStartX(prev => ({ ...prev, [productId]: null }))
      setTouchEndX(prev => ({ ...prev, [productId]: null }))
      return
    }
    
    const distance = touchStartX[productId] - touchEndX[productId]
    const minSwipe = 50
    
    if (Math.abs(distance) > minSwipe) {
      const currentIndex = selectedImageIndices[productId] || 0
      if (distance > 0) {
        setSelectedImageIndices(prev => ({
          ...prev,
          [productId]: (currentIndex + 1) % productImages.length
        }))
      } else {
        setSelectedImageIndices(prev => ({
          ...prev,
          [productId]: (currentIndex - 1 + productImages.length) % productImages.length
        }))
      }
    }
    
    setTouchStartX(prev => ({ ...prev, [productId]: null }))
    setTouchEndX(prev => ({ ...prev, [productId]: null }))
  }

  const handleImageMouseDown = (productId: any, e: any) => {
    if (e.target.closest('.product-wishlist-heart')) return
    setTouchStartX(prev => ({ ...prev, [productId]: e.clientX }))
    e.preventDefault()
  }

  useEffect(() => {
    const handleMouseMove = (e: any) => {
      Object.keys(touchStartX).forEach(productId => {
        if (touchStartX[productId] !== null && !touchEndX[productId]) {
          setTouchEndX(prev => ({ ...prev, [productId]: e.clientX }))
        }
      })
    }

    const handleMouseUp = () => {
      Object.keys(touchStartX).forEach(productId => {
        if (touchStartX[productId] !== null && touchEndX[productId] !== null) {
          const product = products.find((p: any) => p.id === productId)
          if (product) {
            const productImages = getProductImages(product)
            const distance = touchStartX[productId] - touchEndX[productId]
            const minSwipe = 50
            
            if (Math.abs(distance) > minSwipe) {
              const currentIndex = selectedImageIndices[productId] || 0
              if (distance > 0) {
                setSelectedImageIndices(prev => ({
                  ...prev,
                  [productId]: (currentIndex + 1) % productImages.length
                }))
              } else {
                setSelectedImageIndices(prev => ({
                  ...prev,
                  [productId]: (currentIndex - 1 + productImages.length) % productImages.length
                }))
              }
            }
          }
          setTouchStartX(prev => ({ ...prev, [productId]: null }))
          setTouchEndX(prev => ({ ...prev, [productId]: null }))
        }
      })
    }

    if (Object.keys(touchStartX).length > 0) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [touchStartX, touchEndX, selectedImageIndices, products])

  const getPriceInfo = (product: any) => {
    const currentPrice = parseFloat(product.price)
    const discountMap = {
      '1': 25, '2': 30, '3': 20, '4': 40, '5': 35, '6': 15,
      '7': 20, '8': 22, '9': 18, '10': 25, '11': 28, '12': 24,
      '13': 35, '14': 30, '15': 32, '16': 20, '17': 22, '18': 18,
      '19': 25, '20': 30, '21': 28, '22': 20, '23': 15, '24': 24,
      '25': 22, '26': 18, '27': 20, '28': 25, '29': 28, '30': 26,
      '31': 21, '32': 23, '33': 20, '34': 33, '35': 22, '36': 24
    }
    const discountPercent = discountMap[product.id as keyof typeof discountMap] || 25
    const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100))
    return {
      currentPrice: currentPrice.toFixed(0),
      previousPrice: previousPrice.toFixed(0),
      discountPercent
    }
  }

  const handleProductClick = (product: any) => {
    router.push(`/product/${product.id}`)
  }

  const handleHeartClick = (productId: any, e: any) => {
    e.stopPropagation()
    const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
    const existingIndex = wishlist.findIndex((item: any) => item.id === productId)
    const product = products.find((p: any) => p.id === productId)
    
    if (existingIndex > -1) {
      wishlist.splice(existingIndex, 1)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: product.name, added: false }
      }))
    } else {
      wishlist.push(product)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: product.name, added: true }
      }))
    }
    
    localStorage.setItem('bagichaWishlist', JSON.stringify(wishlist))
    setWishlistedIds(wishlist.map((item: any) => item.id))
  }

  const handleAddToCart = (productId: any, e: any) => {
    if (e) e.stopPropagation()
    const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    const product = products.find((p: any) => p.id === productId)
    
      if (!cartItems.find((i: any) => i.id === productId)) {
      cartItems.push(product)
      localStorage.setItem('bagichaCart', JSON.stringify(cartItems))
      window.dispatchEvent(new Event('cartUpdated'))
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: product.name, added: true }
      }))
    }
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="recently-viewed-section">
      <div className="recently-viewed-content">
        <h2 className="recently-viewed-title">Recently Viewed</h2>
        <div className="products-items">
          {products.map((product: any) => {
            const priceInfo = getPriceInfo(product)
            const productImages = getProductImages(product)
            const currentImageIndex = selectedImageIndices[product.id] || 0
            const currentImage = productImages[currentImageIndex]
            
            return (
              <div key={product.id} className="wishlist-item" onClick={() => handleProductClick(product)}>
                <div 
                  className="wishlist-item-image"
                  onTouchStart={(e) => handleImageTouchStart(product.id, e)}
                  onTouchMove={(e) => handleImageTouchMove(product.id, e)}
                  onTouchEnd={() => handleImageTouchEnd(product.id, productImages)}
                  onMouseDown={(e) => handleImageMouseDown(product.id, e)}
                >
                  <img 
                    src={currentImage} 
                    alt={product.name} 
                    className="carousel-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E'
                    }}
                  />
                  {productImages.length > 1 && (
                    <div className="product-image-dots">
                      {productImages.map((_: any, index: number) => (
                        <span
                          key={index}
                          className={`product-image-dot ${currentImageIndex === index ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  )}
                  <button 
                    className={`product-wishlist-heart ${wishlistedIds.includes(product.id) ? 'active' : ''}`}
                    onClick={(e) => handleHeartClick(product.id, e)}
                    aria-label="Add to wishlist"
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div className="wishlist-item-info">
                  <h3 className="wishlist-item-name">{product.name}</h3>
                  <p className="wishlist-item-desc">{product.desc}</p>
                  <div className="wishlist-item-footer">
                    <div className="wishlist-price-container">
                      <div className="wishlist-price-row">
                        <span className="wishlist-item-price">₹{priceInfo.currentPrice}</span>
                        <span className="wishlist-discount-badge">{priceInfo.discountPercent}% off</span>
                      </div>
                      <span className="wishlist-previous-price">₹{priceInfo.previousPrice}</span>
                    </div>
                    <button className="product-cart-icon-btn" onClick={(e) => handleAddToCart(product.id, e)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default RecentlyViewedSection


