'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ProductsSection from '@/components/ProductsSection'
import WishlistToast from '@/components/WishlistToast'
import CartToast from '@/components/CartToast'

export default function CategoryProductsPage() {
  const params = useParams()
  const router = useRouter()
  const categoryName = decodeURIComponent(params.categoryName as string)
  const [cartCount, setCartCount] = useState(0)
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [selectedSize, setSelectedSize] = useState('all')
  const [sortBy, setSortBy] = useState('default')

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
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

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    setShowSizeModal(false)
  }

  const handleSortSelect = (sort: string) => {
    setSortBy(sort)
    setShowSortModal(false)
  }

  const handleClearFilters = () => {
    setSelectedSize('all')
    setShowSizeModal(false)
  }

  const getSizeLabel = () => {
    if (selectedSize === 'all') return 'Size'
    return selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)
  }

  const getSortLabel = () => {
    if (sortBy === 'default') return 'Sort'
    if (sortBy === 'relevancy') return 'Relevancy'
    if (sortBy === 'price-low') return 'Price: Low to High'
    return 'Price: High to Low'
  }

  const handleProductWishlistClick = () => {
    router.push('/profile')
  }

  return (
    <div className="category-products-page">
      <WishlistToast />
      <CartToast />
      <header className="category-products-header">
        <button className="back-btn" onClick={() => router.push('/')}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="category-products-title">{categoryName}</h1>
        <button className="cart-icon-btn" onClick={() => router.push('/cart')}>
          <div className="nav-item-icon-wrapper">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"/>
              <path d="M3 6H21"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </div>
        </button>
      </header>

      <main className="category-products-main">
        {/* Filter and Sort Bar */}
        <div className="category-filter-bar">
          {/* Size Filter Button */}
          <button 
            className={`filter-btn ${selectedSize !== 'all' ? 'active' : ''}`}
            onClick={() => setShowSizeModal(true)}
          >
            {selectedSize !== 'all' && <span className="filter-badge">1</span>}
            <span>{getSizeLabel()}</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Sort Button */}
          <button 
            className={`filter-btn ${sortBy !== 'default' ? 'active' : ''}`}
            onClick={() => setShowSortModal(true)}
          >
            <span>{getSortLabel()}</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        <ProductsSection 
          categoryTitle={categoryName} 
          hideCategoryImage={true} 
          useGridLayout={true}
          filterSize={selectedSize}
          sortBy={sortBy}
          onWishlistClick={handleProductWishlistClick}
        />
      </main>

      {/* Size Filter Modal */}
      {showSizeModal && (
        <div className="filter-modal-overlay" onClick={() => setShowSizeModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3 className="filter-modal-title">Filter by Size</h3>
              <button className="filter-modal-close" onClick={() => setShowSizeModal(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="filter-modal-options">
              <button 
                onClick={() => handleSizeSelect('all')} 
                className={`filter-option ${selectedSize === 'all' ? 'active' : ''}`}
              >
                <span>All Sizes</span>
                {selectedSize === 'all' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSizeSelect('small')} 
                className={`filter-option ${selectedSize === 'small' ? 'active' : ''}`}
              >
                <span>Small</span>
                {selectedSize === 'small' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSizeSelect('medium')} 
                className={`filter-option ${selectedSize === 'medium' ? 'active' : ''}`}
              >
                <span>Medium</span>
                {selectedSize === 'medium' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSizeSelect('large')} 
                className={`filter-option ${selectedSize === 'large' ? 'active' : ''}`}
              >
                <span>Large</span>
                {selectedSize === 'large' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
            </div>
            {selectedSize !== 'all' && (
              <div className="filter-modal-footer">
                <button className="filter-clear-btn" onClick={handleClearFilters}>
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sort Modal */}
      {showSortModal && (
        <div className="filter-modal-overlay" onClick={() => setShowSortModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="filter-modal-header">
              <h3 className="filter-modal-title">Sort By</h3>
              <button className="filter-modal-close" onClick={() => setShowSortModal(false)}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="filter-modal-options">
              <button 
                onClick={() => handleSortSelect('default')} 
                className={`filter-option ${sortBy === 'default' ? 'active' : ''}`}
              >
                <span>Default</span>
                {sortBy === 'default' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSortSelect('relevancy')} 
                className={`filter-option ${sortBy === 'relevancy' ? 'active' : ''}`}
              >
                <span>Relevancy</span>
                {sortBy === 'relevancy' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSortSelect('price-low')} 
                className={`filter-option ${sortBy === 'price-low' ? 'active' : ''}`}
              >
                <span>Price: Low to High</span>
                {sortBy === 'price-low' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
              <button 
                onClick={() => handleSortSelect('price-high')} 
                className={`filter-option ${sortBy === 'price-high' ? 'active' : ''}`}
              >
                <span>Price: High to Low</span>
                {sortBy === 'price-high' && (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
