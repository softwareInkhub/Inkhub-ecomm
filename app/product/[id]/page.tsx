'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { fetchProducts, getProductById } from '@/lib/productsService'
import type { Product } from '@/types'
import CartToast from '@/components/CartToast'
import WishlistToast from '@/components/WishlistToast'
import SwipeModal from '@/components/SwipeModal'

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [activeTab, setActiveTab] = useState<'specification' | 'description'>('specification')
  const [wishlistUpdate, setWishlistUpdate] = useState(0)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const loadProduct = async () => {
      try {
        const foundProduct = await getProductById(id)
        if (foundProduct) {
          setProduct(foundProduct)
          const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
          setIsWishlisted(wishlist.some((item: Product) => item.id === id))
          
          // Track recently viewed items
          const recentlyViewed = JSON.parse(localStorage.getItem('bagichaRecentlyViewed') || '[]')
          const filteredViewed = recentlyViewed.filter((item: Product) => item.id !== foundProduct.id)
          filteredViewed.unshift(foundProduct)
          // Keep only last 10 viewed items
          const updatedViewed = filteredViewed.slice(0, 10)
          localStorage.setItem('bagichaRecentlyViewed', JSON.stringify(updatedViewed))
        } else {
          router.push('/')
        }
        
        // Load all products for similar products section
        const products = await fetchProducts()
        setAllProducts(products)
      } catch (error) {
        console.error('Error loading product:', error)
        router.push('/')
      }
    }
    loadProduct()
  }, [id, router])

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

  // Generate multiple images for the gallery
  const getProductImages = (productItem: Product | null) => {
    if (!productItem) return []
    const anyProduct = productItem as any
    if (anyProduct.images && anyProduct.images.length > 0) {
      return anyProduct.images.slice(0, 3) // Use first 3 real images
    }
    const baseImage = productItem.image || ''
    return [baseImage]
  }

  const productImages = product ? getProductImages(product) : []

  // Get similar products (same category, excluding current)
  const getSimilarProducts = () => {
    if (!product || !allProducts.length) return []
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4)
  }

  const similarProducts = getSimilarProducts()

  const handleSimilarProductWishlist = (e: React.MouseEvent, item: Product) => {
    e.stopPropagation() // Prevent navigation
    const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
    const existingIndex = wishlist.findIndex((w: Product) => w.id === item.id)
    
    if (existingIndex > -1) {
      wishlist.splice(existingIndex, 1)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: item.title || item.name, added: false }
      }))
    } else {
      wishlist.push(item)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: item.title || item.name, added: true }
      }))
    }
    
    localStorage.setItem('bagichaWishlist', JSON.stringify(wishlist))
    // Force re-render
    setWishlistUpdate(prev => prev + 1)
  }

  const handleSimilarProductAddToCart = (e: React.MouseEvent, item: Product) => {
    e.stopPropagation() // Prevent navigation
    const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    
    if (!cartItems.find((i: Product) => i.id === item.id)) {
      cartItems.push(item)
      localStorage.setItem('bagichaCart', JSON.stringify(cartItems))
      window.dispatchEvent(new Event('cartUpdated'))
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: item.title || item.name, added: true }
      }))
    } else {
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: item.title || item.name, added: false, message: 'already in cart' }
      }))
    }
  }

  const isSimilarProductWishlisted = (itemId: string) => {
    const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
    return wishlist.some((item: Product) => item.id === itemId)
  }

  const handleAddToCart = () => {
    if (!product) return
    const cartItems = JSON.parse(localStorage.getItem('bagichaCart') || '[]')
    
    if (!cartItems.find((i: Product) => i.id === product.id)) {
      cartItems.push(product)
      localStorage.setItem('bagichaCart', JSON.stringify(cartItems))
      window.dispatchEvent(new Event('cartUpdated'))
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: product.title || product.name, added: true }
      }))
    } else {
      window.dispatchEvent(new CustomEvent('cartUpdatedToast', {
        detail: { productName: product.title || product.name, added: false, message: 'already in cart' }
      }))
    }
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push('/cart')
  }

  const handleWishlistToggle = () => {
    if (!product) return
    
    const wishlist = JSON.parse(localStorage.getItem('bagichaWishlist') || '[]')
    const existingIndex = wishlist.findIndex((item: Product) => item.id === product.id)
    
    if (existingIndex > -1) {
      wishlist.splice(existingIndex, 1)
      setIsWishlisted(false)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: product.title || product.name, added: false }
      }))
    } else {
      wishlist.push(product)
      setIsWishlisted(true)
      window.dispatchEvent(new CustomEvent('wishlistUpdated', {
        detail: { productName: product.title || product.name, added: true }
      }))
    }
    
    localStorage.setItem('bagichaWishlist', JSON.stringify(wishlist))
  }

  if (!product) return null

  return (
    <div className="product-detail-page">
      <CartToast />
      <WishlistToast />
      
      {/* Header */}
      <header className="product-detail-header">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="product-detail-logo" onClick={() => router.push('/')}>
          Inkhub
        </div>
        <button className="icon-btn cart-icon-btn" onClick={() => router.push('/cart')}>
          <div className="nav-item-icon-wrapper">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </button>
      </header>

      {/* Main Product Image */}
      <div className="product-main-image">
        <img src={productImages[selectedImageIndex]} alt={product.title || product.name || 'Product'} />
        <button 
          className={`product-wishlist-btn ${isWishlisted ? 'active' : ''}`}
          onClick={handleWishlistToggle}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        
        {/* Thumbnail Gallery at Bottom Center */}
        <div className="product-thumbnail-gallery">
          {productImages.map((img: string, index: number) => (
            <button
              key={index}
              className={`product-thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
              onClick={() => setSelectedImageIndex(index)}
            >
              <img src={img} alt={`${product.title || product.name} view ${index + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="product-info-section">
        <div className="product-header-row">
          <div>
            <h1 className="product-name">{product.title || product.name}</h1>
            <p className="product-category">{product.category}</p>
          </div>
          <div className="product-price">₹{product.price}</div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <button 
            className={`product-tab ${activeTab === 'specification' ? 'active' : ''}`}
            onClick={() => setActiveTab('specification')}
          >
            SPECIFICATION
          </button>
          <button 
            className={`product-tab ${activeTab === 'description' ? 'active' : ''}`}
            onClick={() => setActiveTab('description')}
          >
            DESCRIPTION
          </button>
        </div>

        {/* Tab Content */}
        <div className="product-tab-content">
          {activeTab === 'specification' ? (
            <div className="product-specifications">
              <div className="spec-row">
                <span className="spec-label">Pattern</span>
                <span className="spec-value">{(product as any).pattern || 'Custom Design'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Type</span>
                <span className="spec-value">{(product as any).fabric || 'Temporary Tattoo'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Size</span>
                <span className="spec-value">{(product as any).fit || 'Medium Size'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-label">Occasion</span>
                <span className="spec-value">{(product as any).occasion || 'Body Art'}</span>
              </div>
            </div>
          ) : (
            <div className="product-description-text">
              <p>{product.description || product.title || product.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="similar-products-section">
          <h2 className="similar-products-title">Similar Products</h2>
          <div className="similar-products-grid">
            {similarProducts.map((item) => (
              <div 
                key={item.id} 
                className="similar-product-card"
                onClick={() => router.push(`/product/${item.id}`)}
              >
                <div className="similar-product-image">
                  <img src={item.image} alt={item.title || item.name || 'Product'} />
                  <button 
                    className={`similar-product-wishlist ${isSimilarProductWishlisted(item.id) ? 'active' : ''}`}
                    onClick={(e) => handleSimilarProductWishlist(e, item)}
                  >
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
                <div className="similar-product-info">
                  <h3 className="similar-product-name">{item.title || item.name}</h3>
                  <p className="similar-product-desc">{(item as any).desc || item.description}</p>
                  <div className="similar-product-footer">
                    <div className="similar-product-price">₹{item.price}</div>
                    <button 
                      className="similar-product-add-cart"
                      onClick={(e) => handleSimilarProductAddToCart(e, item)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 6H21" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swipe Modal for Buy Now and Add to Cart */}
      <SwipeModal 
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
    </div>
  )
}
