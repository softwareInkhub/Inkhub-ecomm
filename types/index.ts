// Common Types for the Application

export interface Product {
  id: string
  title: string
  name?: string
  handle?: string
  price: number
  originalPrice?: number
  image: string
  images?: string[]
  description?: string
  desc?: string
  category: string
  tags?: string
  inStock?: boolean
  rating?: number
  reviews?: number
  fabric?: string
  pattern?: string
  fit?: string
  occasion?: string
  quantity?: number
}

export interface CartItem extends Product {
  quantity: number
  variantId?: string
}

export interface Address {
  id: string
  fullName?: string
  name?: string
  phone?: string
  phoneNumber?: string
  addressLine1: string
  addressLine2?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  type?: string
  latitude?: number
  longitude?: number
  isDefault?: boolean
}

export interface Customer {
  id?: string
  name: string
  email?: string
  phone: string
}

export interface Order {
  id: string
  orderId: string
  customer: Customer
  items: CartItem[]
  total: number
  subtotal: number
  discount?: number
  couponDiscount?: number
  appliedCoupon?: string
  shippingAddress?: Address
  address?: Address
  orderDate: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'processing'
  paymentMethod: string
  paymentStatus: 'pending' | 'completed' | 'failed'
  razorpayOrderId?: string
  razorpayPaymentId?: string
}

export interface DiscountCode {
  code: string
  valid: boolean
  discountAmount?: number
  discountType?: 'percentage' | 'fixed_amount'
  discountValue?: number
  title?: string
  error?: string
  priceRuleId?: string
  fallback?: boolean
}

export interface RazorpayOrderResponse {
  id: string
  entity: string
  amount: number
  currency: string
  receipt: string
  status: string
}

export interface PaymentDetails {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export interface ShopifyOrderData {
  customer: Customer
  items: CartItem[]
  shippingAddress: Address
  total: number
  orderId: string
  paymentDetails?: PaymentDetails
}

