'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchProducts } from '@/lib/productsService'
import type { Product } from '@/types'

const LatestDropsInline: React.FC = () => {
  const router = useRouter()
  const [latestDrops, setLatestDrops] = useState<Product[]>([])

  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        const products = await fetchProducts()
        
        // Get the 4 most recent products
        const recentProducts = products.slice(0, 4)
        setLatestDrops(recentProducts)
      } catch (error) {
        console.error('Error loading latest products:', error)
      }
    }
    
    loadLatestProducts()
  }, [])

  const handleDropClick = (productId: string) => {
    router.push(`/product/${productId}`)
  }

  return (
    <section 
      aria-label="Latest Arrivals"
      style={{
        /* .latest-drops-inline from CSS */
        padding: '32px 20px'
      }}
    >
      {/* .latest-drops-title from CSS: font-size: 32px; font-weight: 700; margin-bottom: 24px; color: var(--text); font-family: 'Poppins'; letter-spacing: -0.5px; */}
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
        Latest Drops
      </h2>
      {/* .latest-drops-grid from CSS: display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}
      >
        {latestDrops.map((drop) => (
          <div 
            key={drop.id} 
            className="hover:translate-y-[-6px] hover:scale-[1.02]"
            style={{
              /* .latest-drop-item from CSS */
              position: 'relative',
              aspectRatio: '1',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
              transition: 'transform 0.2s',
              display: 'block',
              cursor: 'pointer'
            }}
            onClick={() => handleDropClick(drop.id)}
          >
            <img 
              src={drop.image} 
              alt={drop.title || drop.name || 'Product'}
              style={{
                /* .latest-drop-item img from CSS */
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            {/* .drop-overlay from CSS: gradient background overlay with product name */}
            <span 
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '20px 16px 16px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px'
              }}
            >
              {drop.title || drop.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LatestDropsInline

