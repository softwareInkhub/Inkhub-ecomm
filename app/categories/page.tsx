'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import BottomNavbar from '@/components/BottomNavbar'
import { fetchProducts, clearCache } from '@/lib/productsService'
import type { Product } from '@/types'

export default function CategoriesPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('All Tattoos')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const categoryTitleRefs = useRef<Record<string, HTMLHeadingElement | null>>({})
  const sidebarItemRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sidebarRef = useRef<HTMLElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const isScrollingToCategory = useRef(false)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // Clear cache to get fresh data with updated categorization
        clearCache()
        const data = await fetchProducts()
        setProducts(data)
        console.log('Products loaded:', data.length)
        
        // Log category distribution
        const categories: Record<string, number> = {}
        data.forEach(p => {
          categories[p.category] = (categories[p.category] || 0) + 1
        })
        console.log('Category distribution:', categories)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Get category thumbnail image from first product in that category
  const getCategoryImage = (categoryName: string) => {
    const categoryProducts = categoryName === 'All Tattoos' 
      ? products 
      : products.filter(p => p.category === categoryName)
    
    if (categoryProducts.length > 0 && categoryProducts[0].image) {
      return categoryProducts[0].image
    }
    
    // Return first available product image as fallback
    if (products.length > 0 && products[0].image) {
      return products[0].image
    }
    
    // Transparent placeholder as last resort
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E'
  }

  const [categoryOrder, setCategoryOrder] = useState<string[]>([])
  const [hiddenPositions, setHiddenPositions] = useState<number[]>([])
  const [categoriesLoaded, setCategoriesLoaded] = useState(false)

  // Load category order from config.json
  useEffect(() => {
    const loadCategoryOrder = async () => {
      try {
        const response = await fetch('/api/config/categories')
        if (response.ok) {
          const data = await response.json()
          // Use order array if available, otherwise fall back to enabled array
          const order = data?.order || data?.enabled || []
          const hidden = data?.hiddenPositions || []
          setCategoryOrder(order)
          setHiddenPositions(hidden)
          setCategoriesLoaded(true)
        }
      } catch (error) {
        console.error('Error loading category order:', error)
        // Fallback to default order
        setCategoryOrder([
          'All Tattoos',
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
        ])
        setHiddenPositions([])
        setCategoriesLoaded(true)
      }
    }
    loadCategoryOrder()
  }, [])

  // Listen for admin preview updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { sectionId, data } = event.detail
      if (sectionId === 'categories') {
        if (data.order && Array.isArray(data.order)) {
          setCategoryOrder(data.order)
        }
        if (data.hiddenPositions && Array.isArray(data.hiddenPositions)) {
          setHiddenPositions(data.hiddenPositions)
        }
      }
    }

    window.addEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)
    return () => {
      window.removeEventListener('adminPreviewUpdate', handleAdminUpdate as EventListener)
    }
  }, [])

  // Map category names to IDs
  const categoryNameToId = (name: string): string => {
    const mapping: Record<string, string> = {
      'All Tattoos': 'all-tattoos',
      'Spiritual Collection': 'spiritual',
      'Love & Couple Tattoos': 'love-couple',
      'Anime & Pop Tattoos': 'anime-pop',
      'Animal Tattoos': 'animal',
      'Minimal Tattoos': 'minimal',
      'Bold & Dark Tattoos': 'bold-dark',
      'Tattoos Packs': 'tattoo-packs',
      'Body Placement Tattoos': 'body-placement',
      'Lifestyle Tattoos': 'lifestyle',
      'Tattoos Size & Type': 'size-type'
    }
    return mapping[name] || name.toLowerCase().replace(/\s+/g, '-')
  }

  // Build mainCategories from order array, filtering out hidden positions
  const mainCategories = categoryOrder.length > 0 && categoriesLoaded
    ? categoryOrder
        .filter((name, index) => !hiddenPositions.includes(index))
        .map(name => ({
          id: categoryNameToId(name),
          name: name
        }))
    : [
        { id: 'all-tattoos', name: 'All Tattoos' },
        { id: 'spiritual', name: 'Spiritual Collection' },
        { id: 'love-couple', name: 'Love & Couple Tattoos' },
        { id: 'anime-pop', name: 'Anime & Pop Tattoos' },
        { id: 'animal', name: 'Animal Tattoos' },
        { id: 'minimal', name: 'Minimal Tattoos' },
        { id: 'bold-dark', name: 'Bold & Dark Tattoos' },
        { id: 'tattoo-packs', name: 'Tattoos Packs' },
        { id: 'body-placement', name: 'Body Placement Tattoos' },
        { id: 'lifestyle', name: 'Lifestyle Tattoos' },
        { id: 'size-type', name: 'Tattoos Size & Type' }
      ]

  // Group products by category
  const getProductsByCategory = (categoryName: string) => {
    if (categoryName === 'All Tattoos') {
      return products
    }
    return products.filter(p => p.category === categoryName)
  }

  // Auto-scroll sidebar when category changes (from scrolling main content)
  useEffect(() => {
    if (!isScrollingToCategory.current && sidebarItemRefs.current[selectedCategory] && sidebarRef.current) {
      const sidebarItem = sidebarItemRefs.current[selectedCategory]
      const sidebar = sidebarRef.current
      
      if (sidebarItem) {
        // Get the position of the sidebar item relative to the sidebar container
        const itemTop = sidebarItem.offsetTop
        const itemHeight = sidebarItem.offsetHeight
        const sidebarHeight = sidebar.clientHeight
        const sidebarScrollTop = sidebar.scrollTop
        
        // Calculate if the item is visible in the sidebar
        const itemBottom = itemTop + itemHeight
        const visibleTop = sidebarScrollTop
        const visibleBottom = sidebarScrollTop + sidebarHeight
        
        // Scroll sidebar if item is not fully visible
        if (itemTop < visibleTop || itemBottom > visibleBottom) {
          // Center the item in the sidebar
          const scrollTo = itemTop - (sidebarHeight / 2) + (itemHeight / 2)
          sidebar.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
          })
        }
      }
    }
  }, [selectedCategory])

  // Intersection Observer to detect which category title is visible on screen
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isScrollingToCategory.current) return
        
        // Find all visible title entries
        const visibleEntries = entries.filter(entry => entry.isIntersecting)
        
        if (visibleEntries.length > 0) {
          // Find the title closest to the top of the viewport
          const topEntry = visibleEntries.reduce((closest, entry) => {
            const closestTop = Math.abs(closest.boundingClientRect.top)
            const entryTop = Math.abs(entry.boundingClientRect.top)
            return entryTop < closestTop ? entry : closest
          })
          
          const categoryName = topEntry.target.getAttribute('data-category')
          if (categoryName) {
            setSelectedCategory(categoryName)
          }
        }
      },
      {
        root: null,
        rootMargin: '-80px 0px -80% 0px', // Trigger when title is near top of screen
        threshold: [0, 1]
      }
    )

    // Observe all category title elements
    Object.keys(categoryTitleRefs.current).forEach((key) => {
      if (categoryTitleRefs.current[key]) {
        observerRef.current?.observe(categoryTitleRefs.current[key]!)
      }
    })

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [products])

  // Handle sidebar category click - scroll to category
  const handleCategoryClick = (categoryName: string) => {
    isScrollingToCategory.current = true
    setSelectedCategory(categoryName)
    
    const targetElement = categoryRefs.current[categoryName]
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Reset flag after scroll animation completes
      setTimeout(() => {
        isScrollingToCategory.current = false
      }, 1000)
    }
  }

  return (
    <div className="categories-page">
      <header className="categories-header">
        <h1 className="categories-title">Categories</h1>
        <div className="categories-header-icons">
          <button className="categories-icon-btn" onClick={() => router.push('/search')}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="categories-icon-btn" onClick={() => router.push('/wishlist')}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="categories-icon-btn" onClick={() => router.push('/profile')}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </header>

      <div className="categories-content">
        <aside className="categories-sidebar" ref={sidebarRef as React.RefObject<HTMLElement>}>
          {mainCategories.map((category) => (
            <div
              key={category.id}
              ref={(el) => { if (el) sidebarItemRefs.current[category.name] = el }}
              className={`category-sidebar-item ${selectedCategory === category.name ? 'active' : ''}`}
              onClick={() => handleCategoryClick(category.name)}
            >
              <div className="category-sidebar-thumbnail">
                <img 
                  src={getCategoryImage(category.name)} 
                  alt={category.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3C/svg%3E'
                  }}
                />
              </div>
              <span className="category-sidebar-name">{category.name}</span>
            </div>
          ))}
        </aside>

        <main className="categories-main">
          {loading ? (
            <div className="categories-loading">
              <p>Loading products...</p>
            </div>
          ) : (
            <div data-section-id="category-list">
              {mainCategories.map((category, index) => {
              const categoryProducts = getProductsByCategory(category.name)
              return (
                <div
                  key={`${category.id}-${index}`}
                  ref={(el) => { if (el) categoryRefs.current[category.name] = el }}
                  className="category-section-container"
                >
                  <h2 
                    className="category-section-title"
                    ref={(el) => { if (el) categoryTitleRefs.current[category.name] = el }}
                    data-category={category.name}
                  >
                    {category.name}
                  </h2>
                  <div className="subcategories-grid">
                    {categoryProducts.length > 0 ? (
                      categoryProducts.map((product, idx) => (
                        <div 
                          key={`${product.id}-${idx}`} 
                          className="subcategory-card"
                          onClick={() => router.push(`/product/${product.id}`)}
                        >
                          <div className="subcategory-image">
                            <img 
                              src={product.image} 
                              alt={product.title || product.name || 'Product'}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect fill="%23f0f0f0" width="150" height="150"/%3E%3C/svg%3E'
                              }}
                            />
                          </div>
                          <p className="subcategory-name">{product.title || product.name}</p>
                        </div>
                      ))
                    ) : (
                      <p className="no-products">No products in this category yet</p>
                    )}
                  </div>
                </div>
              )
              })}
            </div>
          )}
        </main>
      </div>

      <BottomNavbar />
    </div>
  )
}
