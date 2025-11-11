/**
 * Shopify Integration Service
 * 
 * This service handles order creation in Shopify
 */

import type { ShopifyOrderData, DiscountCode } from '@/types'

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
      console.error('Error:', error)
      console.error('Message:', (error as Error).message)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      // Don't throw error - allow order to complete even if Shopify fails
      console.warn('⚠️ Order processed but Shopify sync failed. Manual sync may be required.')
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
      return data.product
    } catch (error) {
      console.error('Shopify Get Product Error:', error)
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
      return data.order
    } catch (error) {
      console.error('Shopify Update Order Error:', error)
      throw error
    }
  }

  /**
   * Validate a discount code from Shopify via backend API
   * @param discountCode - The discount code to validate
   * @param cartTotal - The cart total amount
   * @returns Validation result with discount details
   */
  async validateDiscountCode(discountCode: string, cartTotal: number): Promise<DiscountCode> {
    try {
      // Get backend API URL
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🌐 SHOPIFY SERVICE: Validating via Backend')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('🔗 Backend URL:', backendUrl)
      console.log('📝 Code:', discountCode)
      console.log('💰 Cart Total:', cartTotal)

      const requestBody = {
        code: discountCode,
        cartTotal: cartTotal,
      }
      
      console.log('📦 Request Body:', JSON.stringify(requestBody, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      // Call backend API to validate discount
      const response = await fetch(`${backendUrl}/api/validate-discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📡 SHOPIFY SERVICE: Backend Response')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 Status:', response.status, response.statusText)
      console.log('✅ Response OK:', response.ok)

      const data = await response.json()
      console.log('📦 Response Data:', JSON.stringify(data, null, 2))
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

      if (response.ok && data.success && data.valid) {
        console.log('✅ Discount code validated from Shopify:', data.code)
        return {
          valid: true,
          code: data.code,
          discountAmount: data.discountAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          priceRuleId: data.priceRuleId,
          title: data.title,
        }
      } else if (data.valid === false) {
        console.log('❌ Invalid discount code:', data.error)
        return {
          valid: false,
          code: discountCode,
          error: data.error || 'Invalid discount code',
        }
      } else {
        throw new Error(data.error || 'Failed to validate discount code')
      }
    } catch (error) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY SERVICE: Error')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Error:', error)
      console.error('Message:', (error as Error).message)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.warn('⚠️ Using fallback validation')
      // Use fallback validation when backend is not available
      return this.fallbackValidation(discountCode, cartTotal)
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
      'Inkhub100': { type: 'fixed_amount', value: 100, title: '₹100 Off' },
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

