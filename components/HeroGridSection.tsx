'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import SeeAllCategoriesBtn from './SeeAllCategoriesBtn'
import { fetchProducts } from '@/lib/productsService'

interface CategoryItem {
  name: string
  image: string
}

const HeroGridSection: React.FC = () => {
  const router = useRouter()
  const [currentGridIndex, setCurrentGridIndex] = useState(0)
  const [items, setItems] = useState<CategoryItem[]>([])
  const gridScrollRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        const products = await fetchProducts()
        
        // Define tattoo categories
        const categories = [
          'Spiritual Collection',
          'Love & Couple Tattoos', 
          'Anime & Pop Tattoos',
          'Animal Tattoos',
          'Minimal Tattoos',
          'Bold & Dark Tattoos',
          'Tattoos Packs',
          'Body Placement Tattoos',
          'Lifestyle Tattoos',
          'Tattoos Size & Type'
        ]
        
        // Get one product per category with its image
        const categoryItems = categories.map(category => {
          const categoryProducts = products.filter(p => p.category === category)
          if (categoryProducts.length > 0) {
            return {
              name: category,
              image: categoryProducts[0].image || 'https://via.placeholder.com/400'
            }
          }
          return null
        }).filter((item): item is CategoryItem => item !== null)
        
        // Duplicate items to fill the grid (need 16 items for seamless scroll)
        const duplicatedItems = [...categoryItems, ...categoryItems]
        setItems(duplicatedItems.slice(0, 16))
      } catch (error) {
        console.error('Error loading category data:', error)
      }
    }
    
    loadCategoryData()
  }, [])

  // Create groups of 8 items for 4x2 grid
  const gridSize = 8
  const createGrids = () => {
    if (items.length === 0) return []
    const grids = []
    for (let i = 0; i < items.length; i += gridSize) {
      grids.push(items.slice(i, i + gridSize))
    }
    return grids
  }

  const grids = createGrids()
  // Triple the grids for seamless infinite scroll
  const duplicatedGrids = [...grids, ...grids, ...grids]

  useEffect(() => {
    if (items.length === 0) return
    
    const gridAutoScroll = setInterval(() => {
      setCurrentGridIndex((prevIndex) => prevIndex + 1)
    }, 3000)

    return () => clearInterval(gridAutoScroll)
  }, [items.length])

  useEffect(() => {
    if (gridScrollRef.current && !isScrollingRef.current && grids.length > 0) {
      const gridWidth = (gridScrollRef.current.children[0] as HTMLElement)?.offsetWidth || window.innerWidth
      const gap = 16
      const itemWidth = gridWidth + gap
      const totalOriginalGrids = grids.length
      
      // Reset to beginning when reaching the end of second set
      if (currentGridIndex >= totalOriginalGrids * 2) {
        isScrollingRef.current = true
        gridScrollRef.current.scrollTo({
          left: totalOriginalGrids * itemWidth,
          behavior: 'instant'
        })
        setCurrentGridIndex(totalOriginalGrids)
        setTimeout(() => {
          isScrollingRef.current = false
        }, 50)
      } else {
        const scrollPosition = currentGridIndex * itemWidth
        gridScrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        })
      }
    }
  }, [currentGridIndex, grids.length])

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/category/${encodeURIComponent(categoryName)}`)
  }

  return (
    <>
      <div className="hero-grids-wrapper" ref={gridScrollRef}>
        {duplicatedGrids.map((gridItems, gridIdx) => (
          <div 
            key={gridIdx} 
            className="hero-grid-container"
          >
            <div className="hero-grid">
              {gridItems.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className="hero-card"
                  onClick={() => handleCategoryClick(item.name)}
                >
                  <div className="hero-card-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="hero-card-content">
                    <h3 className="hero-card-title">{item.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="hero-section-footer">
        <SeeAllCategoriesBtn items={items} />
      </div>
    </>
  )
}

export default HeroGridSection

