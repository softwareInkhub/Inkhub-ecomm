'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import FixedHeader from '@/components/FixedHeader'
import BottomNavbar from '@/components/BottomNavbar'
import WishlistToast from '@/components/WishlistToast'
import CartToast from '@/components/CartToast'
import HeroBannerSection from '@/components/HeroBannerSection'
import HeroSection from '@/components/HeroSection'
import ProductsSection from '@/components/ProductsSection'
import PosterSection from '@/components/PosterSection'
import CountdownBanner from '@/components/CountdownBanner'

export default function Home() {
  const router = useRouter()

  const handleWishlistClick = () => {
    const isAuthenticated = localStorage.getItem('Inkhubuthenticated') === 'true'
    if (isAuthenticated) {
      router.push('/wishlist')
    } else {
      router.push('/profile')
    }
  }

  const handleProductWishlistClick = () => {
    router.push('/profile')
  }

  const handleAccountClick = () => {
    router.push('/profile')
  }

  // Define the sections - using exact category names from Categories page
  const categorySections = [
    { type: 'products', category: 'Spiritual Collection' },
    { type: 'poster', imageType: 'anime' as const },
    { type: 'products', category: 'Love & Couple Tattoos' },
    { type: 'poster', imageType: 'japanese' as const },
    { type: 'products', category: 'Anime & Pop Tattoos' },
    { type: 'products', category: 'Animal Tattoos' },
    { type: 'countdown' },
    { type: 'products', category: 'Minimal Tattoos' },
    { type: 'products', category: 'Bold & Dark Tattoos' },
    { type: 'products', category: 'Tattoos Packs' },
    { type: 'products', category: 'Body Placement Tattoos' },
    { type: 'products', category: 'Lifestyle Tattoos' },
    { type: 'products', category: 'Tattoos Size & Type' }
  ]

  return (
    <div className="home-page">
      <WishlistToast />
      <CartToast />
      <FixedHeader onWishlistClick={handleWishlistClick} onAccountClick={handleAccountClick} />
      <main className="main-content">
        <HeroBannerSection />
        <HeroSection />
        
        {/* Display each category section once */}
        {categorySections.map((section, index) => (
          <React.Fragment key={`section-${index}`}>
            {section.type === 'products' ? (
              <ProductsSection 
                onWishlistClick={handleProductWishlistClick} 
                categoryTitle={section.category} 
              />
            ) : section.type === 'countdown' ? (
              <CountdownBanner />
            ) : (
              <PosterSection imageType={section.imageType} />
            )}
          </React.Fragment>
        ))}
        
        {/* All products section at the end - without category titles */}
        <ProductsSection 
          onWishlistClick={handleProductWishlistClick} 
          categoryTitle="All Tattoos"
          hideCategoryImage={true}
        />
      </main>
      <BottomNavbar />
    </div>
  )
}
