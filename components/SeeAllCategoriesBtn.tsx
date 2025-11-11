'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

interface CategoryItem {
  name: string
  image: string
}

interface SeeAllCategoriesBtnProps {
  items?: CategoryItem[]
}

const SeeAllCategoriesBtn: React.FC<SeeAllCategoriesBtnProps> = ({ items = [] }) => {
  const router = useRouter()
  
  // Get first 3 items for thumbnails
  const thumbnailItems = items.slice(0, 3)

  return (
    <button 
      className="see-all-categories-btn"
      onClick={() => router.push('/categories')}
    >
      <div className="see-all-categories-thumbnails">
        {thumbnailItems.map((item, idx) => (
          <div key={idx} className="see-all-categories-thumbnail">
            <img src={item.image} alt={item.name} />
          </div>
        ))}
      </div>
      <span className="see-all-categories-text">See all Categories</span>
      <svg className="see-all-categories-arrow" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  )
}

export default SeeAllCategoriesBtn

