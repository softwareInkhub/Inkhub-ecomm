'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavbar from '@/components/BottomNavbar'
import TrendingBanner from '@/components/TrendingBanner'
import ProductsSection from '@/components/ProductsSection'
import { fetchProducts } from '@/lib/productsService'

export default function TrendsPage() {
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [categoryImages, setCategoryImages] = useState<{[key: string]: string}>({})

  useEffect(() => {
    const loadCategoryImages = async () => {
      try {
        const products = await fetchProducts()
        
        // Get first product image for each category
        const animeProducts = products.filter(p => p.category === 'Anime & Pop Tattoos')
        const minimalProducts = products.filter(p => p.category === 'Minimal Tattoos')
        
        const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23f0f0f0" width="600" height="600"/%3E%3C/svg%3E'
        setCategoryImages({
          anime: animeProducts.length > 0 ? (animeProducts[0].image || placeholder) : placeholder,
          minimal: minimalProducts.length > 0 ? (minimalProducts[0].image || placeholder) : placeholder
        })
      } catch (error) {
        console.error('Error loading category images:', error)
      }
    }
    
    loadCategoryImages()
  }, [])

  const handleProductWishlistClick = () => {
    setShowLoginModal(true)
  }

  const handleBannerClick = (categoryName: string) => {
    router.push(`/category/${encodeURIComponent(categoryName)}`)
  }

  return (
    <div className="trends-page">
      <div className="trends-header">
        <h1 className="trends-main-title">
          <span className="trends-title-text">Trending</span>
          <span className="trends-title-highlight"> Tattoos</span>
        </h1>
        <p className="trends-subtitle">
          Stay ahead of the ink curve with curated designs. Your guide to what's hot now!
        </p>
      </div>

      <main className="trends-content">
        <div data-section-id="trending">
        <TrendingBanner
          title="ANIME & POP TATTOOS"
          subtitle="EXPRESS YOUR FANDOM"
          tagline="ICONIC DESIGNS"
          image={categoryImages.anime || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23f0f0f0" width="600" height="600"/%3E%3C/svg%3E'}
          buttonText="SHOP NOW"
          bgColor="linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)"
          onClick={() => handleBannerClick('Anime & Pop Tattoos')}
        />

        <ProductsSection 
          onWishlistClick={handleProductWishlistClick} 
          categoryTitle="Anime & Pop Tattoos"
          hideCategoryImage={true}
        />
        </div>

        <div data-section-id="best-sellers">
        <TrendingBanner
          title="MINIMAL TATTOOS"
          subtitle="LESS IS MORE"
          tagline="ELEGANT SIMPLICITY"
          image={categoryImages.minimal || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect fill="%23f0f0f0" width="600" height="600"/%3E%3C/svg%3E'}
          buttonText="EXPLORE"
          bgColor="linear-gradient(135deg, #d97706 0%, #92400e 100%)"
          onClick={() => handleBannerClick('Minimal Tattoos')}
        />

        <ProductsSection 
          onWishlistClick={handleProductWishlistClick} 
          categoryTitle="Minimal Tattoos"
          hideCategoryImage={true}
        />
        </div>
      </main>

      <BottomNavbar />
    </div>
  )
}
