/**
 * Shopify Integration Service
 * 
 * This service handles order creation in Shopify
 */

'use server'

import type { ShopifyOrderData, DiscountCode } from '@/types'
import { getCachedCoupon, setCachedCoupon } from './couponCache'
import { logResponse, logErrorResponse } from './responseLogger'

interface ShopifyOrderResponse {
  id: number
  order_number: number
  total_price: string
}

class ShopifyService {
  private storeUrl: string
  private storefrontAccessToken: string
  private adminAccessToken: string
  private apiVersion: string

  constructor() {
    // Clean up store URL - remove protocol if present
    let storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || ''
    storeUrl = storeUrl.replace(/^https?:\/\//, '') // Remove http:// or https://
    this.storeUrl = storeUrl
    
    this.storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || ''
    this.adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ''
    this.apiVersion = '2024-01'
  }

  /**
   * Get Shopify Admin API headers
   */
  getAdminHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': this.adminAccessToken,
    }
  }

  /**
   * Get Shopify Storefront API headers
   */
  getStorefrontHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': this.storefrontAccessToken,
    }
  }

  /**
   * Create an order in Shopify via backend API
   * @param orderData - Order details
   * @returns Created order
   */
  async createOrder(orderData: ShopifyOrderData): Promise<ShopifyOrderResponse | null> {
    try {
      // Use Next.js API route (client-side) or backend URL (server-side)
      const apiUrl = typeof window !== 'undefined' 
        ? '/api/create-shopify-order' 
        : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') + '/api/create-shopify-order'
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🛍️ CREATING SHOPIFY ORDER')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📍 API URL:', apiUrl)

      const {
        customer,
        items,
        shippingAddress,
        total,
        orderId,
        paymentDetails
      } = orderData

      const requestBody = {
        customer,
        items,
        shippingAddress,
        total,
        orderId,
        paymentDetails
      }

      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Call API to create Shopify order
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📡 SHOPIFY ORDER CREATION RESPONSE')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Status:', response.status, response.statusText)
      console.log('✅ Response OK:', response.ok)

      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Log response to file
      await logResponse('create-shopify-order', data, requestBody)

      if (!response.ok || !data.success) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ SHOPIFY ORDER CREATION FAILED')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Error:', data.error)
        console.error('Details:', data.details)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw new Error(data.error || 'Failed to create order in Shopify')
      }

      console.log('✅ Shopify order created:', data.shopify_order.id)
      return {
        id: data.shopify_order.id,
        order_number: data.shopify_order.order_number,
        total_price: data.shopify_order.total_price
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY CREATE ORDER ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      // Log error to file
      await logErrorResponse('create-shopify-order', error, orderData)
      
      // Don't throw error - allow order to complete even if Shopify fails
      console.warn('⚠️ Order processed but Shopify sync failed. Manual sync may be required.')
      return null
    }
  }

  /**
   * Create a draft order in Shopify with discount support
   * @param orderData - Order details including applied discount
   * @returns Created draft order
   */
  async createDraftOrder(orderData: ShopifyOrderData): Promise<any | null> {
    try {
      const apiUrl = typeof window !== 'undefined' 
        ? '/api/create-shopify-draft-order' 
        : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') + '/api/create-shopify-draft-order'
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📋 CREATING SHOPIFY DRAFT ORDER')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📍 API URL:', apiUrl)

      const {
        customer,
        items,
        shippingAddress,
        total,
        orderId,
        paymentDetails,
        appliedDiscount
      } = orderData

      const requestBody = {
        customer,
        items,
        shippingAddress,
        total,
        orderId,
        paymentDetails,
        appliedDiscount
      }

      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📡 SHOPIFY DRAFT ORDER CREATION RESPONSE')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Status:', response.status, response.statusText)
      console.log('✅ Response OK:', response.ok)

      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      await logResponse('create-shopify-draft-order', data, requestBody)

      if (!response.ok || !data.success) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('❌ SHOPIFY DRAFT ORDER CREATION FAILED')
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.error('Error:', data.error)
        console.error('Details:', data.details)
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        throw new Error(data.error || 'Failed to create draft order in Shopify')
      }

      console.log('✅ Shopify draft order created:', data.draft_order.id)
      return data.draft_order
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY CREATE DRAFT ORDER ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      await logErrorResponse('create-shopify-draft-order', error, orderData)
      
      console.warn('⚠️ Draft order creation failed. May fall back to regular order.')
      return null
    }
  }

  /**
   * Complete a draft order in Shopify (converts to actual order)
   * @param draftOrderId - The draft order ID to complete
   * @param paymentDetails - Payment details for order metadata
   * @returns Completed order
   */
  async completeDraftOrder(draftOrderId: string, paymentDetails?: any): Promise<any | null> {
    try {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('✅ COMPLETING DRAFT ORDER')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Draft Order ID:', draftOrderId)

      const storeUrl = this.storeUrl
      const apiUrl = `https://${storeUrl}/admin/api/${this.apiVersion}/draft_orders/${draftOrderId}/complete.json`

      const payload = {
        draft_order: {
          payment_pending: false,
          payment_terms: {
            payment_terms_type: 'net',
            payment_terms_net_days: 0
          }
        }
      }

      console.log('📡 API URL:', apiUrl)
      console.log('📦 Payload:', JSON.stringify(payload, null, 2))

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAdminHeaders(),
        body: JSON.stringify(payload),
      })

      console.log('📊 Status:', response.status, response.statusText)

      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      await logResponse('complete-draft-order', data, { draftOrderId, paymentDetails })

      if (!response.ok) {
        console.error('❌ Failed to complete draft order')
        console.error('Errors:', data.errors)
        throw new Error('Failed to complete draft order in Shopify')
      }

      const order = data.draft_order.order
      console.log('✅ Draft order completed to Shopify order:', order.id)
      
      return {
        id: order.id,
        order_number: order.order_number,
        total_price: order.total_price,
        total_discounts: order.total_discounts,
        discount_codes: order.discount_codes
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY COMPLETE DRAFT ORDER ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Error:', error)
      
      await logErrorResponse('complete-draft-order', error, { draftOrderId })
      
      return null
    }
  }

  /**
   * Get product details from Shopify
   * @param productId - Shopify product ID
   * @returns Product details
   */
  async getProduct(productId: string): Promise<any> {
    try {
      const response = await fetch(
        `https://${this.storeUrl}/admin/api/${this.apiVersion}/products/${productId}.json`,
        {
          method: 'GET',
          headers: this.getAdminHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch product from Shopify')
      }

      const data = await response.json()

      // Log response to file
      await logResponse('get-product', data, { productId })

      return data.product
    } catch (error) {
      console.error('Shopify Get Product Error:', error)
      
      // Log error to file
      await logErrorResponse('get-product', error, { productId })
      
      throw error
    }
  }

  /**
   * Update order status in Shopify
   * @param shopifyOrderId - Shopify order ID
   * @param updates - Order updates
   * @returns Updated order
   */
  async updateOrder(shopifyOrderId: string, updates: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(
        `https://${this.storeUrl}/admin/api/${this.apiVersion}/orders/${shopifyOrderId}.json`,
        {
          method: 'PUT',
          headers: this.getAdminHeaders(),
          body: JSON.stringify({ order: updates }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update order in Shopify')
      }

      const data = await response.json()

      // Log response to file
      await logResponse('update-order', data, { shopifyOrderId, updates })

      return data.order
    } catch (error) {
      console.error('Shopify Update Order Error:', error)
      
      // Log error to file
      await logErrorResponse('update-order', error, { shopifyOrderId, updates })
      
      throw error
    }
  }

  /**
   * Validate a discount code from Shopify via backend API
   * @param discountCode - The discount code to validate
   * @param cartTotal - The cart total amount
   * @returns Validation result with discount details
   */
  async validateDiscountCode(discountCode: string, cartTotal: number) {
    const code = discountCode.toUpperCase()

    try {
      /* 1️⃣ CHECK REDIS */
      const cached = await getCachedCoupon(code, cartTotal)
      if (cached) {
        console.log('⚡ Coupon cache HIT:', code)
        return cached
      }

      console.log('🐢 Coupon cache MISS:', code)

      /* 2️⃣ BACKEND CALL */
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'

      const response = await fetch(`${backendUrl}/api/validate-discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, cartTotal }),
      })

      const data = await response.json()

      // Log response to file
      await logResponse('validate-discount', data, { code, cartTotal })

      const result =
        response.ok && data.success && data.valid
          ? {
              valid: true,
              code: data.code,
              discountAmount: data.discountAmount,
              discountType: data.discountType,
              discountValue: data.discountValue,
              priceRuleId: data.priceRuleId,
              title: data.title,
            }
          : {
              valid: false,
              code,
              error: data.error || 'Invalid discount code',
            }

      /* 3️⃣ SAVE IN REDIS */
      await setCachedCoupon(code, cartTotal, result)

      return result
    } catch (err) {
      console.error('❌ Coupon validation failed:', err)
      
      // Log error to file
      await logErrorResponse('validate-discount', err, { code, cartTotal })
      
      return this.fallbackValidation(code, cartTotal)
    }
  }


  /**
   * Fallback validation when Shopify API is not available
   * @param discountCode - The discount code to validate
   * @param cartTotal - The cart total amount
   * @returns Validation result
   */
  fallbackValidation(discountCode: string, cartTotal: number): DiscountCode {
    const code = discountCode.toUpperCase()
    
    // Hardcoded fallback coupons for testing
    const fallbackCoupons: Record<string, { type: 'fixed_amount' | 'percentage', value: number, title: string }> = {
      'FREE100': { type: 'fixed_amount', value: cartTotal, title: 'Free Order' },
      'Bagicha100': { type: 'fixed_amount', value: 100, title: '₹100 Off' },
      'SAVE50': { type: 'fixed_amount', value: 50, title: '₹50 Off' },
      'WELCOME10': { type: 'percentage', value: 10, title: '10% Off' },
      'SAVE20': { type: 'percentage', value: 20, title: '20% Off' },
    }

    if (fallbackCoupons[code]) {
      const coupon = fallbackCoupons[code]
      let discountAmount = 0

      if (coupon.type === 'fixed_amount') {
        discountAmount = Math.min(coupon.value, cartTotal)
      } else if (coupon.type === 'percentage') {
        discountAmount = (cartTotal * coupon.value) / 100
      }

      return {
        valid: true,
        code: code,
        discountAmount: discountAmount,
        discountType: coupon.type,
        discountValue: coupon.value,
        title: coupon.title,
        fallback: true, // Indicates this is fallback validation
      }
    }

    return {
      valid: false,
      code: discountCode,
      error: 'Invalid discount code',
    }
  }
}

// Export singleton instance
const shopifyService = new ShopifyService()
export default shopifyService

