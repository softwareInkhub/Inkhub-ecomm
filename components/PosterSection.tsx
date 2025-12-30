'use client'

import React from 'react'

interface PosterSectionProps {
  imageType?: 'anime' | 'japanese'
}

const PosterSection: React.FC<PosterSectionProps> = ({ imageType = 'anime' }) => {
  const images = {
    anime: '/images/ANIME_COLLECTION_BANNER_V2_ea01d5a0-4ee1-4c94-b641-6b6cebb41340.webp',
    japanese: '/images/Japenese_Collection-Recovered.webp'
  }

  const imageAlt = {
    anime: 'Anime Collection',
    japanese: 'Japanese Collection'
  }

  return (
    <section 
      style={{
        /* .poster-section from CSS: padding: 0 20px 12px; */
        padding: '0 20px 12px'
      }}
    >
      {/* .poster-link from CSS */}
      <a 
        href="#"
        className="hover:translate-y-[-4px]"
        style={{
          display: 'block',
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 24px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.2s'
        }}
      >
        <img 
          src={images[imageType]} 
          alt={imageAlt[imageType]}
          style={{
            /* .poster-link img from CSS */
            width: '100%',
            height: '124px',
            objectFit: 'cover'
          }}
        />
      </a>
    </section>
  )
}

export default PosterSection

