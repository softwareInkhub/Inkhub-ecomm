'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchProducts } from '@/lib/productsService'
import type { Product } from '@/types'

function OffersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const filterType = searchParams.get('filter') // 'below499', 'below999', 'discount40'
  
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0)
    
    const loadFilteredProducts = async () => {
      try {
        setLoading(true)
        const allProducts = await fetchProducts()
        
        let filtered: Product[] = []
        
        if (filterType === 'below499') {
          filtered = allProducts.filter(p => parseFloat(p.price?.toString() || '0') < 499)
        } else if (filterType === 'below999') {
          filtered = allProducts.filter(p => parseFloat(p.price?.toString() || '0') < 999)
        } else if (filterType === 'discount40') {
          // Filter products with 40% or more discount
          filtered = allProducts.filter(p => {
            const discountMap: {[key: string]: number} = {
              '1': 25, '2': 30, '3': 20, '4': 40, '5': 35, '6': 15,
              '7': 20, '8': 22, '9': 18, '10': 25, '11': 28, '12': 24,
              '13': 35, '14': 30, '15': 32, '16': 20, '17': 22, '18': 18,
              '19': 25, '20': 30, '21': 28, '22': 20, '23': 15, '24': 24,
              '25': 22, '26': 18, '27': 20, '28': 25, '29': 28, '30': 26,
              '31': 21, '32': 23, '33': 20, '34': 33, '35': 22, '36': 24
            }
            const discountPercent = discountMap[p.id] || 25
            return discountPercent >= 40
          })
        } else {
          filtered = allProducts
        }
        
        setProducts(filtered)
        setLoading(false)
      } catch (error) {
        console.error('Error loading products:', error)
        setLoading(false)
      }
    }
    
    loadFilteredProducts()
  }, [filterType])
  
  const getPageTitle = () => {
    if (filterType === 'below499') return 'Products Below ₹499'
    if (filterType === 'below999') return 'Products Below ₹999'
    if (filterType === 'discount40') return 'Flat 40% Off & More'
    return 'Special Offers'
  }
  
  const getPriceInfo = (product: Product) => {
    const currentPrice = parseFloat(product.price?.toString() || '0')
    
    // Fixed discount percent based on product ID for consistency
    const discountMap: {[key: string]: number} = {
      '1': 25, '2': 30, '3': 20, '4': 40, '5': 35, '6': 15,
      '7': 20, '8': 22, '9': 18, '10': 25, '11': 28, '12': 24,
      '13': 35, '14': 30, '15': 32, '16': 20, '17': 22, '18': 18,
      '19': 25, '20': 30, '21': 28, '22': 20, '23': 15, '24': 24,
      '25': 22, '26': 18, '27': 20, '28': 25, '29': 28, '30': 26,
      '31': 21, '32': 23, '33': 20, '34': 33, '35': 22, '36': 24
    }
    
    const discountPercent = discountMap[product.id] || 25
    const previousPrice = Math.ceil(currentPrice / (1 - discountPercent / 100))
    
    return {
      currentPrice: currentPrice.toFixed(0),
      previousPrice: previousPrice.toFixed(0),
      discountPercent
    }
  }

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  return (
    <div className="offer-products-page">
      <header className="offer-products-header">
        <button className="back-btn" onClick={() => router.back()}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <h1 className="offer-products-title">{getPageTitle()}</h1>
        <div style={{ width: '24px' }}></div>
      </header>

      <main className="offer-products-main">
        {loading ? (
          <div className="offer-products-loading">
            <p>Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="offer-products-empty">
            <p>No products found for this offer.</p>
          </div>
        ) : (
          <div className="offer-products-grid">
            {products.map((product) => {
              const priceInfo = getPriceInfo(product)
              return (
                <div 
                  key={product.id} 
                  className="offer-product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="offer-product-image">
                    <img src={product.image} alt={product.title || product.name || 'Product'} />
                  </div>
                  <div className="offer-product-details">
                    <h3 className="offer-product-name">{product.title || product.name}</h3>
                    <p className="offer-product-category">{product.category}</p>
                    <div className="offer-product-price-row">
                      <span className="current-price">₹{priceInfo.currentPrice}</span>
                      <span className="discount-badge">{priceInfo.discountPercent}% off</span>
                    </div>
                    <span className="original-price">₹{priceInfo.previousPrice}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default function OffersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
      <OffersContent />
    </Suspense>
  )
}
