'use client'

import React, { useState, useEffect, useRef } from 'react'
import { fetchProducts } from '@/lib/productsService'

const HeroPostersScrollableSection: React.FC = () => {
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0)
  const [posters, setPosters] = useState<string[]>([])
  const posterScrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const loadPosters = async () => {
      try {
        const products = await fetchProducts()
        if (products.length > 0) {
          // Get 2 random product images for the poster
          const shuffled = products.sort(() => 0.5 - Math.random())
          const posterImages = shuffled.slice(0, 2).map(p => p.image)
          setPosters(posterImages)
        }
      } catch (error) {
        console.error('Error loading posters:', error)
      }
    }
    loadPosters()
  }, [])

  // Triple the posters for seamless infinite scroll
  const duplicatedPosters = [...posters, ...posters, ...posters]

  useEffect(() => {
    const posterAutoScroll = setInterval(() => {
      setCurrentPosterIndex((prevIndex) => prevIndex + 1)
    }, 2500)

    return () => clearInterval(posterAutoScroll)
  }, [])

  useEffect(() => {
    if (posterScrollRef.current && !isScrollingRef.current) {
      const posterWidth = (posterScrollRef.current.children[0] as HTMLElement)?.offsetWidth || window.innerWidth - 40
      const gap = 16
      const itemWidth = posterWidth + gap
      const totalOriginalItems = posters.length
      
      // Reset to beginning when reaching the end of second set
      if (currentPosterIndex >= totalOriginalItems * 2) {
        isScrollingRef.current = true
        posterScrollRef.current.scrollTo({
          left: totalOriginalItems * itemWidth,
          behavior: 'instant' as ScrollBehavior
        })
        setCurrentPosterIndex(totalOriginalItems)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 50)
      } else {
        const scrollPosition = currentPosterIndex * itemWidth
        posterScrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }
  }, [currentPosterIndex, posters.length])

  return (
    <div 
      style={{
        /* .hero-posters-section from CSS: margin-top: 16px; padding: 0 10px; */
        marginTop: '16px',
        padding: '0 10px'
      }}
    >
      {/* hero-posters-container from CSS: display: flex; gap: 16px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; */}
      <div 
        ref={posterScrollRef}
        className="scrollbar-hide"
        style={{ 
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch', 
          scrollbarWidth: 'none'
        }}
      >
        {duplicatedPosters.map((poster, idx) => (
          <div 
            key={idx} 
            className="animate-[slideIn_0.5s_ease-out]"
            style={{
              /* .hero-poster from CSS */
              flex: '0 0 calc(100vw - 40px)',
              maxWidth: 'calc(430px - 40px)',
              borderRadius: '16px',
              overflow: 'hidden',
              scrollSnapAlign: 'center',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08)',
              border: '2px solid transparent',
              background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15)) border-box',
              aspectRatio: '2 / 1',
              transition: 'all 0.3s ease'
            }}
          >
            <img 
              src={poster} 
              alt="Special Offer"
              style={{
                /* .hero-poster img from CSS */
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default HeroPostersScrollableSection

