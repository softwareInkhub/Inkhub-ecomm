'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const OffersInline: React.FC = () => {
  const router = useRouter()
  
  const offers = [
    { image: '/images/offer_pack.webp', alt: 'Offer Pack', filter: null },
    { image: '/images/offer_40_percent.webp', alt: '40% Off Offer', filter: 'discount40' },
    { image: '/images/offer_999.webp', alt: '999 Offer', filter: 'below999' },
    { image: '/images/offer_499.webp', alt: '499 Offer', filter: 'below499' }
  ]

  const handleOfferClick = (filter: string | null) => {
    if (filter) {
      router.push(`/offers?filter=${filter}`)
    }
  }

  return (
    <section 
      style={{
        /* .offers-inline from CSS */
        padding: '32px 20px'
      }}
    >
      {/* .offers-title from CSS: font-size: 32px; font-weight: 700; margin-bottom: 24px; color: var(--text); font-family: 'Poppins'; letter-spacing: -0.5px; */}
      <h2 
        style={{
          fontSize: '32px',
          fontWeight: '700',
          marginBottom: '24px',
          color: '#2d3748',
          fontFamily: "'Poppins', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          letterSpacing: '-0.5px',
          margin: '0 0 24px 0'
        }}
      >
        Offers
      </h2>
      {/* .offers-grid from CSS: display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}
      >
        {offers.map((offer, idx) => (
          <div 
            key={idx} 
            className="hover:translate-y-[-4px]"
            style={{
              /* .offers-inline .offer-item from CSS */
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.2s',
              display: 'block',
              cursor: offer.filter ? 'pointer' : 'default'
            }}
            onClick={() => handleOfferClick(offer.filter)}
          >
            <img 
              src={offer.image} 
              alt={offer.alt}
              style={{
                /* .offers-inline .offer-item img from CSS */
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

export default OffersInline

