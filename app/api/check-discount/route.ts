import { NextRequest, NextResponse } from 'next/server'

interface CartItem {
  id: string
  price: number
  quantity: number
  title?: string
  variantId?: string
}

interface DiscountValidationRequest {
  code: string
  cartItems: CartItem[]
  cartTotal: number
}

interface ShopifyDiscountCode {
  id: number
  code: string
  price_rule_id: number
  status?: string | null
  usage_count?: number
}

interface ShopifyPriceRule {
  id: number
  title: string
  value_type: 'fixed_amount' | 'percentage'
  value: string
  starts_at: string
  ends_at?: string | null
  status?: string | null
  usage_limit?: number | null
  usage_count?: number
  prerequisite_subtotal_range?: {
    greater_than_or_equal_to?: string
  }
  target_selection?: 'all' | 'specific'
  entitled_variant_ids?: number[]
  entitled_product_ids?: number[]
  entitled_collection_ids?: number[]
  customer_selection?: 'all' | 'specific'
  allocation_method?: 'across' | 'each'
}

/**
 * In-memory cache for lookup results, price rules, and discount codes
 * TTL: 5 minutes, Max entries: 2000
 */
class SimpleCache<T> {
  private map = new Map<string, { value: T; exp: number }>()
  constructor(private ttlMs = 5 * 60 * 1000, private maxEntries = 2000) {}

  get(key: string): T | null {
    const e = this.map.get(key)
    if (!e) return null
    if (Date.now() > e.exp) {
      this.map.delete(key)
      return null
    }
    return e.value
  }

  set(key: string, value: T): void {
    if (this.map.size >= this.maxEntries) {
      const firstKey = this.map.keys().next().value
      this.map.delete(firstKey)
    }
    this.map.set(key, { value, exp: Date.now() + this.ttlMs })
  }

  clear(): void {
    this.map.clear()
  }
}

// Global caches
const lookupCache = new SimpleCache<any>(5 * 60 * 1000, 2000)
const priceRuleCache = new SimpleCache<ShopifyPriceRule>(5 * 60 * 1000, 2000)
const discountCodesCache = new SimpleCache<ShopifyDiscountCode[]>(5 * 60 * 1000, 2000)

/**
 * Normalize discount code: trim whitespace and convert to uppercase
 */
function normalizeCode(code: string): string {
  return code.trim().toUpperCase()
}

/**
 * Fetch all price rules with pagination
 */
async function fetchAllPriceRules(
  storeUrl: string,
  apiVersion: string,
  headers: Record<string, string>
): Promise<ShopifyPriceRule[]> {
  const cacheKey = 'all_price_rules'
  const cached = priceRuleCache.get(cacheKey)
  if (cached) {
    console.log('📦 Using cached price rules')
    return cached as any
  }

  console.log('🔍 Fetching all price rules with pagination...')
  const allRules: ShopifyPriceRule[] = []
  let pageInfo: string | null = null
  let page = 1
  const limit = 250 // Shopify max per page

  do {
    let url = `https://${storeUrl}/admin/api/${apiVersion}/price_rules.json?limit=${limit}`
    if (pageInfo) {
      url += `&page_info=${encodeURIComponent(pageInfo)}`
    }

    console.log(`📄 Fetching price rules page ${page}...`)
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch price rules page ${page}:`, errorText)
      break
    }

    const data = await response.json()
    const rules = data.price_rules || []
    allRules.push(...rules)

    // Check for pagination
    const linkHeader = response.headers.get('link')
    pageInfo = null
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]+page_info=([^>]+)>[^<]*rel="next"/)
      if (nextMatch) {
        pageInfo = decodeURIComponent(nextMatch[1])
        page++
      }
    }

    // If no link header but we got less than limit, we're done
    if (!pageInfo && rules.length < limit) {
      break
    }

    // Safety limit: don't fetch more than 100 pages
    if (page > 100) {
      console.warn('⚠️ Reached safety limit of 100 pages for price rules')
      break
    }
  } while (pageInfo)

  console.log(`✅ Fetched ${allRules.length} price rules total`)
  
  // Cache the results
  priceRuleCache.set(cacheKey, allRules as any)
  
  return allRules
}

/**
 * Fetch all discount codes for a specific price rule with pagination
 */
async function fetchDiscountCodesForPriceRule(
  storeUrl: string,
  apiVersion: string,
  headers: Record<string, string>,
  priceRuleId: number
): Promise<ShopifyDiscountCode[]> {
  const cacheKey = `discount_codes:${priceRuleId}`
  const cached = discountCodesCache.get(cacheKey)
  if (cached) {
    console.log(`📦 Using cached discount codes for price rule ${priceRuleId}`)
    return cached
  }

  console.log(`🔍 Fetching discount codes for price rule ${priceRuleId}...`)
  const allCodes: ShopifyDiscountCode[] = []
  let pageInfo: string | null = null
  let page = 1
  const limit = 250

  do {
    let url = `https://${storeUrl}/admin/api/${apiVersion}/price_rules/${priceRuleId}/discount_codes.json?limit=${limit}`
    if (pageInfo) {
      url += `&page_info=${encodeURIComponent(pageInfo)}`
    }

    console.log(`📄 Fetching discount codes page ${page} for rule ${priceRuleId}...`)
    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Failed to fetch discount codes page ${page}:`, errorText)
      break
    }

    const data = await response.json()
    const codes = data.discount_codes || []
    allCodes.push(...codes)

    // Check for pagination
    const linkHeader = response.headers.get('link')
    pageInfo = null
    if (linkHeader) {
      const nextMatch = linkHeader.match(/<[^>]+page_info=([^>]+)>[^<]*rel="next"/)
      if (nextMatch) {
        pageInfo = decodeURIComponent(nextMatch[1])
        page++
      }
    }

    // If no link header but we got less than limit, we're done
    if (!pageInfo && codes.length < limit) {
      break
    }

    // Safety limit
    if (page > 100) {
      console.warn(`⚠️ Reached safety limit of 100 pages for discount codes (rule ${priceRuleId})`)
      break
    }
  } while (pageInfo)

  console.log(`✅ Fetched ${allCodes.length} discount codes for price rule ${priceRuleId}`)
  
  // Cache the results
  discountCodesCache.set(cacheKey, allCodes)
  
  return allCodes
}

/**
 * Search for discount code by iterating through all price rules
 * This is the fallback when lookup endpoint fails
 */
async function searchDiscountCodeInPriceRules(
  storeUrl: string,
  apiVersion: string,
  headers: Record<string, string>,
  normalizedCode: string
): Promise<{ discountCode: ShopifyDiscountCode; priceRule: ShopifyPriceRule } | null> {
  console.log('🔍 Fallback: Searching discount code in all price rules...')
  
  // Fetch all price rules
  const priceRules = await fetchAllPriceRules(storeUrl, apiVersion, headers)
  
  // Search through each price rule's discount codes
  for (const priceRule of priceRules) {
    // Skip disabled price rules early
    if (priceRule.status === 'disabled') {
      continue
    }

    try {
      const discountCodes = await fetchDiscountCodesForPriceRule(
        storeUrl,
        apiVersion,
        headers,
        priceRule.id
      )

      // Search for matching code (case-insensitive, trimmed)
      const matchedCode = discountCodes.find(
        (dc) => normalizeCode(dc.code) === normalizedCode
      )

      if (matchedCode) {
        console.log(`✅ Found discount code in price rule ${priceRule.id}`)
        return {
          discountCode: matchedCode,
          priceRule: priceRule,
        }
      }
    } catch (error) {
      console.error(`❌ Error fetching discount codes for rule ${priceRule.id}:`, error)
      // Continue searching other rules
      continue
    }
  }

  console.log('❌ Discount code not found in any price rule')
  return null
}

/**
 * Validate price rule conditions
 */
function validatePriceRule(
  priceRule: ShopifyPriceRule,
  cartTotal: number,
  cartItems: CartItem[]
): { valid: boolean; error?: string } {
  const now = new Date()

  // Check start date
  if (priceRule.starts_at) {
    const startDate = new Date(priceRule.starts_at)
    if (startDate > now) {
      return {
        valid: false,
        error: 'This discount code is not yet active',
      }
    }
  }

  // Check end date
  if (priceRule.ends_at) {
    const endDate = new Date(priceRule.ends_at)
    if (endDate < now) {
      return {
        valid: false,
        error: 'This discount code has expired',
      }
    }
  }

  // Check usage limit
  if (priceRule.usage_limit !== null && priceRule.usage_limit !== undefined) {
    const usageCount = priceRule.usage_count || 0
    if (usageCount >= priceRule.usage_limit) {
      return {
        valid: false,
        error: 'This discount code has reached its usage limit',
      }
    }
  }

  // Check minimum purchase requirement
  if (priceRule.prerequisite_subtotal_range?.greater_than_or_equal_to) {
    const minAmount = parseFloat(priceRule.prerequisite_subtotal_range.greater_than_or_equal_to)
    if (!isNaN(minAmount) && cartTotal < minAmount) {
      return {
        valid: false,
        error: `Minimum purchase of ₹${minAmount.toFixed(2)} required for this coupon`,
      }
    }
  }

  // Check item eligibility (if target_selection is 'specific')
  if (priceRule.target_selection === 'specific') {
    const hasEligibleItems = cartItems.some((item) => {
      const variantId = item.variantId ? Number(item.variantId) : null
      const productId = item.id ? Number(item.id) : null

      return (
        (variantId && priceRule.entitled_variant_ids?.includes(variantId)) ||
        (productId && priceRule.entitled_product_ids?.includes(productId))
      )
    })

    if (!hasEligibleItems) {
      return {
        valid: false,
        error: 'This discount code is not applicable to items in your cart',
      }
    }
  }

  return { valid: true }
}

/**
 * Calculate discount amount based on price rule
 */
function calculateDiscount(
  priceRule: ShopifyPriceRule,
  cartTotal: number,
  cartItems: CartItem[]
): number {
  let discountAmount = 0
  const valueType = priceRule.value_type
  const rawValue = priceRule.value || '0'

  if (valueType === 'fixed_amount') {
    const fixedAmount = Math.abs(parseFloat(rawValue))
    
    // If specific items are targeted, calculate discount only on eligible items
    if (priceRule.target_selection === 'specific' && priceRule.entitled_variant_ids?.length) {
      const eligibleSubtotal = cartItems.reduce((sum, item) => {
        const variantId = item.variantId ? Number(item.variantId) : null
        const productId = item.id ? Number(item.id) : null
        const isEligible =
          (variantId && priceRule.entitled_variant_ids?.includes(variantId)) ||
          (productId && priceRule.entitled_product_ids?.includes(productId))
        
        if (isEligible) {
          return sum + item.price * item.quantity
        }
        return sum
      }, 0)
      
      discountAmount = Math.min(fixedAmount, eligibleSubtotal)
    } else {
      discountAmount = Math.min(fixedAmount, cartTotal)
    }
  } else if (valueType === 'percentage') {
    const percentage = Math.abs(parseFloat(rawValue))
    
    // If specific items are targeted, calculate percentage only on eligible items
    if (priceRule.target_selection === 'specific' && priceRule.entitled_variant_ids?.length) {
      const eligibleSubtotal = cartItems.reduce((sum, item) => {
        const variantId = item.variantId ? Number(item.variantId) : null
        const productId = item.id ? Number(item.id) : null
        const isEligible =
          (variantId && priceRule.entitled_variant_ids?.includes(variantId)) ||
          (productId && priceRule.entitled_product_ids?.includes(productId))
        
        if (isEligible) {
          return sum + item.price * item.quantity
        }
        return sum
      }, 0)
      
      discountAmount = (eligibleSubtotal * percentage) / 100
    } else {
      discountAmount = (cartTotal * percentage) / 100
    }
  }

  // Ensure discount doesn't exceed cart total
  discountAmount = Math.min(discountAmount, cartTotal)
  
  // Ensure discount is not negative
  if (!Number.isFinite(discountAmount) || discountAmount < 0) {
    discountAmount = 0
  }

  return discountAmount
}

/**
 * Main discount validation endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body: DiscountValidationRequest = await request.json()
    const { code, cartItems = [], cartTotal = 0 } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📥 DISCOUNT VALIDATION REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 Code:', code)
    console.log('💰 Cart Total:', cartTotal)
    console.log('🛒 Cart Items:', cartItems.length)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Validate input
    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: 'Discount code is required' },
        { status: 400 }
      )
    }

    // Check Shopify credentials
    const rawStoreUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01'

    if (!rawStoreUrl || !adminToken) {
      console.error('❌ Shopify credentials missing')
      return NextResponse.json(
        { success: false, valid: false, error: 'Shopify not configured' },
        { status: 500 }
      )
    }

    const storeUrl = rawStoreUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': adminToken,
    }

    // Normalize the discount code
    const normalizedCode = normalizeCode(code)
    console.log('🔤 Normalized code:', normalizedCode)

    let discountCode: ShopifyDiscountCode | null = null
    let priceRule: ShopifyPriceRule | null = null

    // STEP 1: Try lookup endpoint first (fastest)
    const lookupCacheKey = `lookup:${normalizedCode}`
    let lookupData = lookupCache.get(lookupCacheKey)

    if (!lookupData) {
      const lookupUrl = `https://${storeUrl}/admin/api/${apiVersion}/discount_codes/lookup.json?code=${encodeURIComponent(normalizedCode)}`
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔍 STEP 1: TRYING LOOKUP ENDPOINT')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📍 Lookup URL:', lookupUrl)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      try {
        const lookupResponse = await fetch(lookupUrl, {
          method: 'GET',
          headers,
          cache: 'no-store',
        })

        console.log('📊 Lookup Status:', lookupResponse.status, lookupResponse.statusText)

        if (lookupResponse.status === 404) {
          console.log('❌ Lookup returned 404 - code not found via lookup endpoint')
          // Will fallback to price rules search
        } else if (!lookupResponse.ok) {
          const errorText = await lookupResponse.text()
          console.error('❌ Lookup API error:', errorText)
          // Will fallback to price rules search
        } else {
          lookupData = await lookupResponse.json()
          lookupCache.set(lookupCacheKey, lookupData)
          console.log('✅ Lookup successful')
        }
      } catch (error: any) {
        console.error('❌ Lookup request failed:', error?.message || error)
        // Will fallback to price rules search
      }
    } else {
      console.log('📦 Using cached lookup result')
    }

    // If lookup succeeded, extract discount code and fetch price rule
    if (lookupData?.discount_code) {
      discountCode = lookupData.discount_code
      console.log('✅ Discount code found via lookup')
      console.log('📋 Discount Code ID:', discountCode.id)
      console.log('📋 Price Rule ID:', discountCode.price_rule_id)
      console.log('📋 Code:', discountCode.code)
      // NOTE: We do NOT check discountCode.status - it's often null/empty/inherited

      // Fetch price rule
      const priceRuleCacheKey = `price_rule:${discountCode.price_rule_id}`
      const cachedPriceRule = priceRuleCache.get(priceRuleCacheKey)
      
      if (cachedPriceRule) {
        priceRule = cachedPriceRule
        console.log('📦 Using cached price rule')
      } else {
        const priceRuleUrl = `https://${storeUrl}/admin/api/${apiVersion}/price_rules/${discountCode.price_rule_id}.json`
        
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('🔍 STEP 2: FETCHING PRICE RULE')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📍 Price Rule URL:', priceRuleUrl)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        const priceRuleResponse = await fetch(priceRuleUrl, {
          method: 'GET',
          headers,
          cache: 'no-store',
        })

        if (!priceRuleResponse.ok) {
          const errorText = await priceRuleResponse.text()
          console.error('❌ Price Rule API error:', errorText)
          return NextResponse.json(
            { success: false, valid: false, error: 'Failed to fetch discount details' },
            { status: 500 }
          )
        }

        const priceRuleData = await priceRuleResponse.json()
        priceRule = priceRuleData.price_rule
        
        if (priceRule) {
          priceRuleCache.set(priceRuleCacheKey, priceRule)
          console.log('✅ Price rule fetched')
        }
      }
    }

    // STEP 2: Fallback to searching through price rules if lookup failed
    if (!discountCode || !priceRule) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔍 STEP 2: FALLBACK TO PRICE RULES SEARCH')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const searchResult = await searchDiscountCodeInPriceRules(
        storeUrl,
        apiVersion,
        headers,
        normalizedCode
      )

      if (!searchResult) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: 'Invalid discount code',
        })
      }

      discountCode = searchResult.discountCode
      priceRule = searchResult.priceRule

      console.log('✅ Discount code found via price rules search')
      console.log('📋 Discount Code ID:', discountCode.id)
      console.log('📋 Price Rule ID:', priceRule.id)
      console.log('📋 Code:', discountCode.code)
    }

    // Validate that we have both discount code and price rule
    if (!discountCode || !priceRule) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Discount code configuration not found',
      })
    }

    // STEP 3: Validate price rule (NOT discount code status)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 STEP 3: VALIDATING PRICE RULE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 Rule ID:', priceRule.id)
    console.log('📋 Rule Title:', priceRule.title)
    console.log('📋 Value Type:', priceRule.value_type)
    console.log('📋 Value:', priceRule.value)
    console.log('📋 Starts At:', priceRule.starts_at)
    console.log('📋 Ends At:', priceRule.ends_at)
    console.log('📋 Status:', priceRule.status)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const validation = validatePriceRule(priceRule, cartTotal, cartItems)
    if (!validation.valid) {
      console.log('❌ Price rule validation failed:', validation.error)
      return NextResponse.json({
        success: false,
        valid: false,
        error: validation.error || 'Discount code is not valid',
      })
    }

    // STEP 4: Calculate discount amount
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 STEP 4: CALCULATING DISCOUNT')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    const discountAmount = calculateDiscount(priceRule, cartTotal, cartItems)

    console.log('✅ COUPON VALIDATION SUCCESS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`💰 Discount Amount: ₹${discountAmount.toFixed(2)}`)
    console.log(`📊 Discount Type: ${priceRule.value_type}`)
    console.log(`📈 Discount Value: ${priceRule.value}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Return success response
    return NextResponse.json({
      success: true,
      valid: true,
      discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
      discountType: priceRule.value_type,
      discountValue: priceRule.value,
      code: discountCode.code,
      priceRuleId: priceRule.id,
      ruleTitle: priceRule.title,
    })
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('❌ DISCOUNT VALIDATION ERROR')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('Error:', error)
    console.error('Message:', error?.message || 'Unknown error')
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    return NextResponse.json(
      {
        success: false,
        valid: false,
        error: error?.message || 'Failed to validate discount code. Please try again.',
      },
      { status: 500 }
    )
  }
}
