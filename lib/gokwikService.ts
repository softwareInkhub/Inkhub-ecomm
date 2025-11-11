/**
 * GoKwik Payment Gateway Service
 * 
 * This service handles all interactions with the GoKwik payment gateway API
 */

import type { CartItem, Address, Customer } from '@/types'

interface GoKwikConfig {
  merchantId: string
  apiKey: string
  secretKey: string
  environment: 'staging' | 'production'
  apiUrl: string
  callbackUrls: {
    success: string
    cancel: string
    webhook: string
  }
  paymentConfig: {
    currency: string
    enabledMethods: string[]
  }
  theme: {
    color: string
    logo?: string
  }
}

interface PaymentOrderData {
  orderId: string
  amount: number
  customerDetails: Customer
  items: CartItem[]
  shippingAddress: Address
  billingAddress?: Address
}

interface PaymentCallbacks {
  onSuccess?: (response: any) => void
  onFailure?: (error: any) => void
  onClose?: () => void
}

class GoKwikService {
  private config: GoKwikConfig
  private apiUrl: string
  private currentCheckout: any = null

  constructor() {
    this.config = {
      merchantId: process.env.NEXT_PUBLIC_GOKWIK_MID || '',
      apiKey: process.env.NEXT_PUBLIC_GOKWIK_API_KEY || '',
      secretKey: process.env.GOKWIK_SECRET_KEY || '',
      environment: (process.env.NEXT_PUBLIC_GOKWIK_ENV as 'staging' | 'production') || 'staging',
      apiUrl: process.env.NEXT_PUBLIC_GOKWIK_ENV === 'production' 
        ? 'https://api.gokwik.co' 
        : 'https://api-staging.gokwik.co',
      callbackUrls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || ''}/order-success`,
        cancel: `${process.env.NEXT_PUBLIC_APP_URL || ''}/checkout`,
        webhook: `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/gokwik-webhook`,
      },
      paymentConfig: {
        currency: 'INR',
        enabledMethods: ['card', 'upi', 'netbanking', 'wallet'],
      },
      theme: {
        color: '#3b82f6',
      },
    }
    this.apiUrl = this.config.apiUrl
  }

  /**
   * Validate configuration
   */
  validateConfig(): boolean {
    if (!this.config.merchantId) {
      console.error('GoKwik Merchant ID is missing')
      return false
    }
    if (!this.config.apiKey) {
      console.error('GoKwik API Key is missing')
      return false
    }
    return true
  }

  /**
   * Generate authentication headers for API requests
   */
  getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-Merchant-Id': this.config.merchantId,
      'X-API-Key': this.config.apiKey,
      'Authorization': `Bearer ${this.config.apiKey}`,
    }
  }

  /**
   * Create a payment order with GoKwik
   * @param orderData - Order details
   * @returns Payment order response
   */
  async createPaymentOrder(orderData: PaymentOrderData): Promise<any> {
    try {
      // Validate configuration before making API call
      if (!this.validateConfig()) {
        throw new Error('GoKwik configuration is incomplete. Please check your config file.')
      }

      const {
        orderId,
        amount,
        customerDetails,
        items,
        shippingAddress,
        billingAddress,
      } = orderData

      const payload = {
        merchant_id: this.config.merchantId,
        order_id: orderId,
        amount: Math.round(amount * 100), // Convert to paise
        currency: this.config.paymentConfig.currency,
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
        },
        shipping_address: {
          line1: shippingAddress.addressLine1,
          line2: shippingAddress.addressLine2,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: 'IN',
        },
        billing_address: billingAddress || shippingAddress,
        items: items.map(item => ({
          name: item.title,
          quantity: item.quantity || 1,
          price: Math.round(item.price * 100),
          sku: item.id,
        })),
        callback_url: this.config.callbackUrls.success,
        cancel_url: this.config.callbackUrls.cancel,
        webhook_url: this.config.callbackUrls.webhook,
        metadata: {
          platform: 'web',
          source: 'Inkhub-app',
        },
      }

      const response = await fetch(`${this.apiUrl}/orders`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create payment order')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('GoKwik Create Order Error:', error)
      throw error
    }
  }

  /**
   * Initialize GoKwik checkout
   * @param paymentOrder - Payment order details from createPaymentOrder
   * @param callbacks - Success, failure and close callbacks
   */
  async initializeCheckout(paymentOrder: any, callbacks: PaymentCallbacks = {}): Promise<any> {
    try {
      const { onSuccess, onFailure, onClose } = callbacks

      // Check if GoKwik SDK is loaded
      if (typeof window === 'undefined' || typeof (window as any).GoKwik === 'undefined') {
        throw new Error('GoKwik SDK not loaded. Please ensure the script is included in your HTML.')
      }

      const checkoutOptions = {
        payment_session_id: paymentOrder.payment_session_id,
        order_id: paymentOrder.order_id,
        amount: paymentOrder.amount,
        currency: this.config.paymentConfig.currency,
        merchant_id: this.config.merchantId,
        
        // Payment preferences
        payment_methods: this.config.paymentConfig.enabledMethods,
        
        // Theme customization
        theme: this.config.theme,
        
        // Callbacks
        handler: function (response: any) {
          console.log('Payment Success:', response)
          if (onSuccess) {
            onSuccess(response)
          }
        },
        
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed')
            if (onClose) {
              onClose()
            }
          },
          
          // Escape key closes modal
          escape: true,
          
          // Clicking outside doesn't close modal
          backdropclose: false,
        },
      }

      // Initialize GoKwik checkout
      const gokwik = new (window as any).GoKwik(checkoutOptions)
      
      // Open the checkout modal
      gokwik.open()

      // Store reference for later use
      this.currentCheckout = gokwik

      return gokwik
    } catch (error) {
      console.error('GoKwik Initialize Checkout Error:', error)
      throw error
    }
  }

  /**
   * Verify payment status
   * @param paymentId - Payment ID to verify
   * @returns Payment status
   */
  async verifyPayment(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}/verify`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to verify payment')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('GoKwik Verify Payment Error:', error)
      throw error
    }
  }

  /**
   * Get payment details
   * @param paymentId - Payment ID
   * @returns Payment details
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    try {
      const response = await fetch(`${this.apiUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch payment details')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('GoKwik Get Payment Details Error:', error)
      throw error
    }
  }

  /**
   * Refund a payment
   * @param paymentId - Payment ID to refund
   * @param amount - Amount to refund (optional, full refund if not specified)
   * @param reason - Reason for refund
   * @returns Refund response
   */
  async refundPayment(paymentId: string, amount: number | null = null, reason: string = ''): Promise<any> {
    try {
      const payload: any = {
        payment_id: paymentId,
        reason: reason,
      }

      if (amount) {
        payload.amount = Math.round(amount * 100) // Convert to paise
      }

      const response = await fetch(`${this.apiUrl}/refunds`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to process refund')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('GoKwik Refund Error:', error)
      throw error
    }
  }

  /**
   * Close the checkout modal
   */
  closeCheckout(): void {
    if (this.currentCheckout) {
      this.currentCheckout.close()
      this.currentCheckout = null
    }
  }
}

// Export singleton instance
const gokwikService = new GoKwikService()
export default gokwikService

