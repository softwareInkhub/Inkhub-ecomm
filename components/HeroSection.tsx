'use client'

import React from 'react'
import HeroPostersScrollableSection from './HeroPostersScrollableSection'
import LatestDropsInline from './LatestDropsInline'
import OffersInline from './OffersInline'
import HeroPosterInline from './HeroPosterInline'
import HeroGridSection from './HeroGridSection'

const HeroSection: React.FC = () => {
  return (
    <section className="hero-section" aria-label="Shop by Category">
      <HeroGridSection />
      <HeroPostersScrollableSection />
      <LatestDropsInline />
      <OffersInline />
      <HeroPosterInline />
    </section>
  )
}

export default HeroSection
