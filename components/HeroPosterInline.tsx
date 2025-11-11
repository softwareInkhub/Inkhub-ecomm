'use client'

import React, { useState, useEffect } from 'react'
import { fetchProducts } from '@/lib/productsService'

const HeroPosterInline: React.FC = () => {
  const [posterImage, setPosterImage] = useState('')

  useEffect(() => {
    const loadPosterImage = async () => {
      try {
        const products = await fetchProducts()
        if (products.length > 0) {
          // Get a random product image for the poster
          const randomProduct = products[Math.floor(Math.random() * products.length)]
          setPosterImage(randomProduct.image)
        }
      } catch (error) {
        console.error('Error loading poster image:', error)
      }
    }
    loadPosterImage()
  }, [])

  if (!posterImage) return null

  return (
    <div 
      style={{
        /* .hero-poster-section from CSS: padding: 0 20px 32px; */
        padding: '0 20px 32px'
      }}
    >
      {/* .hero-poster-link from CSS */}
      <a 
        href="#"
        className="hover:translate-y-[-4px]"
        style={{
          display: 'block',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.04)',
          transition: 'transform 0.2s'
        }}
      >
        <img 
          src={posterImage} 
          alt="Special Promotion"
          style={{
            /* .hero-poster-link img from CSS */
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: '16px'
          }}
        />
      </a>
    </div>
  )
}

export default HeroPosterInline

