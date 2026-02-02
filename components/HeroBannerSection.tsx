'use client'

import React, { useState, useEffect, useRef } from 'react'

interface Banner {
  image: string
  alt: string
}

const HeroBannerSection: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [banners, setBanners] = useState<Banner[]>([
    {
      image: '/images/nature_tattoos.webp',
      alt: 'Nature Tattoos'
    },
    {
      image: '/images/finger_pack_tattoo_2.webp',
      alt: 'Finger Pack Tattoos'
    },
    {
      image: '/images/arm_band_banner.webp',
      alt: 'Arm Band Tattoos'
    },
    {
      image: '/images/quote_tattoos.webp',
      alt: 'Quote Tattoos'
    },
    {
      image: '/images/samurai_tattoo_2.webp',
      alt: 'Samurai Tattoos'
    }
  ])
  const scrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  // Load banners from config
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetch('/api/config/homepage')
        if (response.ok) {
          const data = await response.json()
          if (data.heroBanners && Array.isArray(data.heroBanners) && data.heroBanners.length > 0) {
            // Filter out banners with empty images
            const validBanners = data.heroBanners.filter((b: Banner) => b.image && b.image.trim() !== '')
            if (validBanners.length > 0) {
              setBanners(validBanners)
            }
          }
        }
      } catch (error) {
        console.error('Error loading banner config:', error)
        // Keep default banners on error
      }
    }
    
    loadBanners()
  }, [])

  // Listen for admin preview updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { sectionId, data } = event.detail
      if (sectionId === 'hero-banners' || sectionId === 'homepage') {
        if (data.heroBanners && Array.isArray(data.heroBanners)) {
          const validBanners = data.heroBanners.filter((b: Banner) => b.image && b.image.trim() !== '')
          if (validBanners.length > 0) {
            setBanners(validBanners)
          }
        }
      }
    }

    window.addEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)
    return () => {
      window.removeEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)
    }
  }, [])

  // Triple the banners for seamless infinite scroll
  const duplicatedBanners = [...banners, ...banners, ...banners]

  // Initialize to middle set on mount
  useEffect(() => {
    if (scrollRef.current) {
      const cardWidth = 320
      const gap = 2
      const itemWidth = cardWidth + gap
      const containerWidth = scrollRef.current.offsetWidth
      const initialIndex = banners.length // Start at first banner of second set
      const initialScrollPosition = (initialIndex * itemWidth) - (containerWidth / 2) + (cardWidth / 2)
      
      scrollRef.current.scrollTo({
        left: initialScrollPosition,
        behavior: 'auto'
      })
      setCurrentIndex(initialIndex)
    }
  }, [banners.length])

  useEffect(() => {
    const autoScroll = setInterval(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1)
    }, 4000)

    return () => clearInterval(autoScroll)
  }, [])

  useEffect(() => {
    if (scrollRef.current && !isScrollingRef.current) {
      const cardWidth = 320
      const gap = 2
      const itemWidth = cardWidth + gap
      const totalOriginalBanners = banners.length
      const containerWidth = scrollRef.current.offsetWidth
      
      // Calculate scroll position to center the active banner
      const scrollPosition = (currentIndex * itemWidth) - (containerWidth / 2) + (cardWidth / 2)
      
      // Reset to beginning when reaching the end of second set
      if (currentIndex >= totalOriginalBanners * 2) {
        isScrollingRef.current = true
        const resetScrollPosition = (totalOriginalBanners * itemWidth) - (containerWidth / 2) + (cardWidth / 2)
        scrollRef.current.scrollTo({
          left: resetScrollPosition,
          behavior: 'instant' as ScrollBehavior
        })
        setCurrentIndex(totalOriginalBanners)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 50)
      } else {
        scrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }
  }, [currentIndex, banners.length])

  return (
    <section className="mb-4 -mt-0.5" aria-label="Hero Banners">
      {/* hero-banner-container from CSS: display: flex; gap: 2px; padding: 20px; scroll-snap-type: x mandatory; overflow-x: auto; */}
      <div 
        ref={scrollRef}
        className="scrollbar-hide"
        style={{ 
          display: 'flex',
          gap: '2px',
          padding: '20px 0',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          alignItems: 'center',
          overflowX: 'auto'
        }}
      >
        {duplicatedBanners.map((banner, idx) => (
          <div 
            key={`banner-${idx}-${banner.image}`} 
            className={`
              relative 
              ${idx === currentIndex ? 'active' : ''}
            `}
            style={{
              /* .hero-banner-card from CSS */
              flex: '0 0 320px',
              width: '320px',
              height: '480px',
              borderRadius: '24px',
              overflow: 'hidden',
              scrollSnapAlign: 'center',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              boxShadow: idx === currentIndex 
                ? '0 20px 48px rgba(0, 0, 0, 0.4), 0 10px 24px rgba(0, 0, 0, 0.3)'
                : '0 8px 24px rgba(0, 0, 0, 0.2)',
              opacity: idx === currentIndex ? 1 : 0.6,
              transform: idx === currentIndex ? 'scale(1)' : 'scale(0.85)',
              zIndex: idx === currentIndex ? 10 : 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <img 
              src={banner.image} 
              alt={banner.alt} 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover', 
                display: 'block'
              }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default HeroBannerSection

