/**
 * Products Service
 * 
 * Handles fetching and managing products from Shopify
 */

import type { Product } from '@/types'

interface ShopifyProduct {
  id?: number
  handle: string
  title: string
  body_html?: string
  tags?: string
  images?: Array<{ src: string }>
  variants?: Array<{ price: string }>
}

let cachedProducts: Product[] | null = null

// Clear cache if needed (for development/testing)
export const clearCache = (): void => {
  cachedProducts = null
}

export const fetchProducts = async (): Promise<Product[]> => {
  if (cachedProducts) {
    return cachedProducts
  }

  try {
    // Use server-side proxy API route to avoid CORS and rate limit issues
    const response = await fetch('/api/products', { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Handle both { data: [...] } and direct array formats
    const productsData = (result?.data && Array.isArray(result.data)) 
      ? result.data 
      : (Array.isArray(result) ? result : [])
    
    if (productsData.length > 0) {
      // First pass: categorize products
      const categorizedProducts = productsData
        .filter((product: ShopifyProduct) => product && product.handle && product.title) // Filter invalid products
        .map((product: ShopifyProduct, index: number) => ({
          id: product.id?.toString() || product.handle || '',
          handle: product.handle || '',
          title: product.title || 'Untitled Product',
          name: product.title || 'Untitled Product',
          desc: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 50) : (product.title || ''),
          description: product.body_html ? product.body_html.replace(/<[^>]*>/g, '').substring(0, 200) : (product.title || ''),
          price: product.variants && product.variants[0] ? (parseFloat(product.variants[0].price) || 0) : 0,
          image: (product.images && product.images[0] && product.images[0].src) || '',
          images: (product.images && Array.isArray(product.images)) ? product.images.map((img: any) => img?.src || '').filter(Boolean) : [],
          category: extractCategory(product.tags || '', index),
          tags: product.tags || '',
          fabric: 'Temporary Tattoo',
          pattern: extractPattern(product.tags || ''),
          fit: extractSize(product.tags || ''),
          occasion: 'Body Art',
          inStock: true,
        }))
        .filter((p: Product) => p.id && p.title) // Ensure required fields exist
      
      // Ensure each category has at least some products
      cachedProducts = ensureCategoryDistribution(categorizedProducts)
      
      return cachedProducts
    }
    
    return []
  } catch (error) {
    console.error('Error fetching products:', error)
    // Return empty array on error to prevent UI crashes
    return []
  }
}

const ensureCategoryDistribution = (products: Product[]): Product[] => {
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
  
  const categoryCounts: Record<string, number> = {}
  categories.forEach(cat => {
    categoryCounts[cat] = products.filter(p => p.category === cat).length
  })
  
  // Assign uncategorized products to empty categories
  const emptyCategories = categories.filter(cat => categoryCounts[cat] === 0)
  const allTattoosProducts = products.filter(p => p.category === 'All Tattoos')
  
  if (emptyCategories.length > 0 && allTattoosProducts.length > 0) {
    emptyCategories.forEach((emptyCat, index) => {
      const productsToAssign = allTattoosProducts.slice(
        index * 5, 
        (index + 1) * 5
      )
      productsToAssign.forEach(product => {
        product.category = emptyCat
      })
    })
  }
  
  return products
}

const extractCategory = (tags: string, index: number): string => {
  const tagLower = tags.toLowerCase()
  
  // Check for Lifestyle first (more specific patterns)
  if (tagLower.includes('mandala') || tagLower.includes('geometric') || tagLower.includes('pattern') || 
      tagLower.includes('ornamental') || tagLower.includes('floral') || tagLower.includes('nature') ||
      tagLower.includes('abstract') || tagLower.includes('dotwork') || tagLower.includes('line art')) {
    return 'Lifestyle Tattoos'
  }
  
  // Check for Size & Type specific tags
  if (tagLower.includes('2 inch') || tagLower.includes('2inch') || 
      tagLower.includes('3 inch') || tagLower.includes('3inch') ||
      tagLower.includes('4 inch') || tagLower.includes('4inch') ||
      tagLower.includes('5 inch') || tagLower.includes('5inch') ||
      tagLower.includes('6 inch') || tagLower.includes('6inch') ||
      tagLower.includes('large') || tagLower.includes('medium') || 
      tagLower.includes('extra large') || tagLower.includes('xxl')) {
    return 'Tattoos Size & Type'
  }
  
  if (tagLower.includes('spiritual') || tagLower.includes('mahadev') || tagLower.includes('ganesha') || 
      tagLower.includes('ganesh') || tagLower.includes('shiva') || tagLower.includes('buddha') || 
      tagLower.includes('om') || tagLower.includes('kalki') || tagLower.includes('hanuman') ||
      tagLower.includes('krishna') || tagLower.includes('ram')) {
    return 'Spiritual Collection'
  }
  
  if (tagLower.includes('couple') || tagLower.includes('love') || tagLower.includes('heart') || 
      tagLower.includes('rose') || tagLower.includes('romance') || tagLower.includes('maa')) {
    return 'Love & Couple Tattoos'
  }
  
  if (tagLower.includes('anime') || tagLower.includes('cartoon') || tagLower.includes('pop') || 
      tagLower.includes('music') || tagLower.includes('artistic') || tagLower.includes('hip hop')) {
    return 'Anime & Pop Tattoos'
  }
  
  if (tagLower.includes('animal') || tagLower.includes('dragon') || tagLower.includes('lion') || 
      tagLower.includes('wolf') || tagLower.includes('tiger') || tagLower.includes('bird') ||
      tagLower.includes('butterfly') || tagLower.includes('snake') || tagLower.includes('cat')) {
    return 'Animal Tattoos'
  }
  
  if (tagLower.includes('minimal') || tagLower.includes('simple') || tagLower.includes('small') || 
      tagLower.includes('tiny') || tagLower.includes('delicate') || tagLower.includes('minimalist')) {
    return 'Minimal Tattoos'
  }
  
  if (tagLower.includes('dark') || tagLower.includes('bold') || tagLower.includes('tribal') || 
      tagLower.includes('demon') || tagLower.includes('skull') || tagLower.includes('gothic')) {
    return 'Bold & Dark Tattoos'
  }
  
  if (tagLower.includes('pack') || tagLower.includes('bundle') || tagLower.includes('set') ||
      tagLower.includes('combo') || tagLower.includes('collection')) {
    return 'Tattoos Packs'
  }
  
  if (tagLower.includes('arm') || tagLower.includes('leg') || tagLower.includes('back') || 
      tagLower.includes('chest') || tagLower.includes('neck') || tagLower.includes('hand') ||
      tagLower.includes('forearm') || tagLower.includes('bicep') || tagLower.includes('shoulder') ||
      tagLower.includes('wrist') || tagLower.includes('ankle') || tagLower.includes('thigh')) {
    return 'Body Placement Tattoos'
  }
  
  return 'All Tattoos'
}

const extractPattern = (tags: string): string => {
  const tagLower = tags.toLowerCase()
  
  if (tagLower.includes('geometric')) return 'Geometric'
  if (tagLower.includes('mandala')) return 'Mandala'
  if (tagLower.includes('tribal')) return 'Tribal'
  if (tagLower.includes('floral')) return 'Floral'
  if (tagLower.includes('minimalist')) return 'Minimalist'
  
  return 'Custom Design'
}

const extractSize = (tags: string): string => {
  const tagLower = tags.toLowerCase()
  
  if (tagLower.includes('2 inch') || tagLower.includes('2inch')) return 'Small - 2 inch'
  if (tagLower.includes('3 inch') || tagLower.includes('3inch')) return 'Small - 3 inch'
  if (tagLower.includes('4 inch') || tagLower.includes('4inch')) return 'Medium - 4 inch'
  if (tagLower.includes('5 inch') || tagLower.includes('5inch')) return 'Medium - 5 inch'
  if (tagLower.includes('6 inch') || tagLower.includes('6inch')) return 'Large - 6 inch'
  if (tagLower.includes('12 inch') || tagLower.includes('12inch') || tagLower.includes('xxl')) return 'Extra Large - 12 inch'
  
  return 'Medium Size'
}

export const getProductById = async (id: string): Promise<Product | undefined> => {
  const products = await fetchProducts()
  return products.find(p => p.id === id || p.handle === id)
}

export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  const products = await fetchProducts()
  if (category === 'All Tattoos') {
    return products
  }
  return products.filter(p => p.category === category)
}

export const searchProducts = async (query: string): Promise<Product[]> => {
  const products = await fetchProducts()
  const searchLower = query.toLowerCase()
  return products.filter(p => 
    p.title.toLowerCase().includes(searchLower) ||
    p.tags?.toLowerCase().includes(searchLower) ||
    p.description?.toLowerCase().includes(searchLower)
  )
}

