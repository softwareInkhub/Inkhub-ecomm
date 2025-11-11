'use client'

import React from 'react'

interface TrendingBannerProps {
  title: string
  subtitle: string
  tagline: string
  image: string
  buttonText?: string
  bgColor: string
  onClick: () => void
}

const TrendingBanner: React.FC<TrendingBannerProps> = ({ 
  title, 
  subtitle, 
  tagline, 
  image, 
  buttonText, 
  bgColor, 
  onClick 
}) => {
  return (
    <div className="trending-banner" style={{ background: bgColor }}>
      <div className="trending-banner-content">
        <span className="trending-banner-tagline">{tagline}</span>
        <h2 className="trending-banner-title">{title}</h2>
        <p className="trending-banner-subtitle">{subtitle}</p>
        <button className="trending-banner-button" onClick={onClick}>
          {buttonText || 'SHOP NOW'}
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
      <div className="trending-banner-image">
        <img src={image} alt={title} />
      </div>
    </div>
  )
}

export default TrendingBanner

