/**
 * Razorpay Payment Gateway Service
 * 
 * This service handles all interactions with the Razorpay payment gateway
 */

import type { RazorpayOrderResponse } from '@/types'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  image?: string
  order_id?: string
  prefill: {
    name: string
    email?: string
    contact: string
  }
  notes: {
    customer_name: string
    customer_email?: string
  }
  theme: {
    color: string
  }
  handler: (response: any) => void
  modal: {
    ondismiss: () => void
    escape: boolean
    backdropclose: boolean
  }
}

interface CustomerDetails {
  name: string
  email?: string
  phone: string
}

interface OrderData {
  amount: number
  orderId: string
  customerDetails: CustomerDetails
  razorpayOrderId?: string
  onSuccess?: (response: any) => void
  onFailure?: (error: any) => void
  onClose?: () => void
}

class RazorpayService {
  private keyId: string

  constructor() {
    // Get key from environment variable (client-side)
    if (typeof window !== 'undefined') {
      // Client-side: use NEXT_PUBLIC_ prefix
      this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
    } else {
      // Server-side: can use either prefix
      this.keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ''
    }
    this.validateKeyFormat()
  }

  /**
   * Validate Razorpay key format
   */
  validateKeyFormat(): boolean {
    if (!this.keyId) {
      console.error('❌ Razorpay Key ID is missing from .env file')
      return false
    }

    // Check for malformed key (double prefix)
    if (this.keyId.includes('rzp_test_rzp_live') || this.keyId.includes('rzp_live_rzp_test')) {
      console.error('❌ INVALID Razorpay Key Format!')
      console.error(`Current key: ${this.keyId}`)
      console.error('Your key has BOTH test and live prefixes!')
      console.error('Fix: Use either rzp_test_XXX OR rzp_live_XXX (not both)')
      return false
    }

    // Check if it's test or live
    if (this.keyId.startsWith('rzp_test_')) {
      console.log('✅ Razorpay Test Mode - Safe for development')
      return true
    } else if (this.keyId.startsWith('rzp_live_')) {
      console.warn('⚠️ Razorpay Live Mode - Real money will be charged!')
      console.warn('Make sure your account is activated and KYC is complete')
      return true
    } else if (this.keyId === 'YOUR_RAZORPAY_KEY_ID') {
      console.error('❌ Razorpay Key not configured in .env file')
      return false
    } else {
      console.error('❌ Invalid Razorpay Key format:', this.keyId)
      console.error('Key should start with rzp_test_ or rzp_live_')
      return false
    }
  }

  /**
   * Load Razorpay script dynamically
   * @returns Promise<boolean>
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if already loaded
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true)
        return
      }

      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  /**
   * Create Razorpay order via backend
   * @param orderData
   * @returns Promise<RazorpayOrderResponse>
   */
  async createOrder(orderData: OrderData): Promise<RazorpayOrderResponse | null> {
    const { amount, orderId, customerDetails } = orderData
    
    console.log('Creating Razorpay order via API...')
    
    // Try Next.js API route first, fallback to backend URL
    const apiUrl = typeof window !== 'undefined' 
      ? '/api/create-razorpay-order' 
      : (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') + '/api/create-razorpay-order'
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'INR',
          receipt: orderId,
          notes: {
            customer_name: customerDetails.name,
            customer_email: customerDetails.email,
            customer_phone: customerDetails.phone,
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create order')
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Order creation failed')
      }

      console.log('✅ Razorpay order created:', data.order.id)
      
      return data.order
    } catch (error) {
      console.error('Order creation failed:', error)
      
      // Fallback: Try to proceed without order_id (less secure but works for testing)
      console.warn('⚠️ Proceeding without order creation (NOT recommended for production)')
      
      return null // Will proceed without order_id
    }
  }

  /**
   * Create Razorpay order options
   * @param orderData - Order details
   * @returns Razorpay options
   */
  createOrderOptions(orderData: OrderData): RazorpayOptions {
    const {
      amount,
      razorpayOrderId,
      customerDetails,
      onSuccess,
      onFailure,
      onClose
    } = orderData

    const options: RazorpayOptions = {
      key: this.keyId,
      amount: Math.round(amount * 100), // Amount in paise
      currency: 'INR',
      name: 'Inkhub',
      description: 'Tattoos Purchase',
      image: 'https://your-logo-url.com/logo.png', // Optional: Add your logo URL
      prefill: {
        name: customerDetails.name,
        email: customerDetails.email,
        contact: customerDetails.phone,
      },
      notes: {
        customer_name: customerDetails.name,
        customer_email: customerDetails.email,
      },
      theme: {
        color: '#3b82f6'
      },
      handler: function (response: any) {
        console.log('Payment Success:', response)
        if (onSuccess) {
          onSuccess(response)
        }
      },
      modal: {
        ondismiss: function () {
          console.log('Payment cancelled by user')
          if (onClose) {
            onClose()
          }
        },
        escape: true,
        backdropclose: false
      }
    }

    // Only add order_id if we have a valid Razorpay order
    if (razorpayOrderId && razorpayOrderId.startsWith('order_')) {
      options.order_id = razorpayOrderId
    }

    return options
  }

  /**
   * Initialize Razorpay checkout
   * @param orderData - Order details
   */
  async initializeCheckout(orderData: OrderData): Promise<any> {
    try {
      // Validate key format first
      if (!this.validateKeyFormat()) {
        throw new Error('Invalid Razorpay configuration. Please check console for details.')
      }

      // Load Razorpay script if not already loaded
      const scriptLoaded = await this.loadRazorpayScript()
      
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay SDK')
      }

      // Create Razorpay order first (should be done on backend in production)
      let razorpayOrder: RazorpayOrderResponse | null = null
      try {
        razorpayOrder = await this.createOrder(orderData)
      } catch (error) {
        console.warn('Order creation skipped (using direct payment):', error)
      }

      // Create options with or without order_id
      const options = this.createOrderOptions({
        ...orderData,
        razorpayOrderId: razorpayOrder?.id
      })

      console.log('Razorpay Options:', { 
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        has_order_id: !!options.order_id
      })

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options)
      
      // Handle payment failure
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment Failed:', response.error)
        if (orderData.onFailure) {
          orderData.onFailure(response.error)
        }
      })

      // Open Razorpay checkout
      razorpay.open()

      return razorpay
    } catch (error) {
      console.error('Razorpay Initialize Error:', error)
      throw error
    }
  }

  /**
   * Verify payment signature (should be done on backend)
   * @param paymentData
   * @returns boolean
   */
  verifyPaymentSignature(paymentData: any): boolean {
    // This should be implemented on your backend for security
    // Frontend verification shown for reference only
    console.warn('Payment signature verification should be done on backend')
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData
    
    // In production, send this to your backend for verification
    return true
  }
}

// Export singleton instance
const razorpayService = new RazorpayService()
export default razorpayService

