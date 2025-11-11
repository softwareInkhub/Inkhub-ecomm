/**
 * Payment Helper Utilities
 * Helper functions for payment processing
 */

/**
 * Format amount for display
 */
export const formatAmount = (amount: number): string => {
  return `₹${amount.toFixed(0)}`
}

/**
 * Get customer details from localStorage
 */
export const getCustomerDetails = () => {
  // Check new key first, fallback to old key for backward compatibility
  const userPhone = localStorage.getItem('bagichaUserPhone') || localStorage.getItem('bagichaPhoneNumber') || ''
  const userEmail = localStorage.getItem('bagichaUserEmail') || ''
  
  // Try to get first and last name separately (new format)
  const firstName = localStorage.getItem('bagichaUserFirstName') || ''
  const lastName = localStorage.getItem('bagichaUserLastName') || ''
  
  // Build full name - prefer new format, fallback to old format
  let userName = ''
  if (firstName || lastName) {
    userName = `${firstName} ${lastName}`.trim()
  } else {
    userName = localStorage.getItem('bagichaUserName') || 'Guest User'
  }
  
  return {
    name: userName,
    email: userEmail || `${userPhone}@Inkhub.com`, // Fallback email
    phone: userPhone,
  }
}

/**
 * Get shipping address from localStorage
 */
export const getShippingAddress = () => {
  const address = JSON.parse(localStorage.getItem('Inkhubddress') || '{}')
  
  if (Object.keys(address).length === 0) {
    return null
  }
  
  return {
    fullName: address.fullName || '',
    addressLine1: address.addressLine1 || '',
    addressLine2: address.addressLine2 || '',
    landmark: address.landmark || '',
    city: address.city || '',
    state: address.state || '',
    pincode: address.pincode || '',
    phoneNumber: address.phoneNumber || '',
  }
}

/**
 * Get cart items from localStorage
 */
export const getCartItems = () => {
  return JSON.parse(localStorage.getItem('bagichaCart') || '[]')
}

/**
 * Calculate coupon discount
 */
export const calculateCouponDiscount = (): number => {
  const appliedCoupon = localStorage.getItem('appliedCoupon')
  
  if (!appliedCoupon) {
    return 0
  }
  
  try {
    // Parse the coupon data (new format with Shopify validation)
    const couponData = JSON.parse(appliedCoupon)
    if (couponData && couponData.discountAmount) {
      return parseFloat(String(couponData.discountAmount))
    }
  } catch (e) {
    // Handle old format (just string) - backward compatibility
    if (appliedCoupon === 'Inkhub100') {
      return 100
    }
  }
  
  return 0
}

/**
 * Calculate order total
 */
export const calculateOrderTotal = (cartItems: any[]) => {
  const subtotal = cartItems.reduce((sum, item) => {
    const qty = item.quantity || 1
    return sum + (parseFloat(String(item.price || 0)) * qty)
  }, 0)
  
  const couponDiscount = calculateCouponDiscount()
  const deliveryFee = 0 // Free delivery
  const total = subtotal - couponDiscount + deliveryFee
  
  return {
    subtotal,
    couponDiscount,
    deliveryFee,
    total,
  }
}

/**
 * Generate unique order ID
 */
export const generateOrderId = (): string => {
  return `ORD${Date.now()}`
}

/**
 * Save order to history
 */
export const saveOrderToHistory = (orderDetails: any) => {
  const orderHistory = JSON.parse(localStorage.getItem('bagichaOrders') || '[]')
  orderHistory.unshift(orderDetails)
  localStorage.setItem('bagichaOrders', JSON.stringify(orderHistory))
}

/**
 * Clear cart after successful order
 */
export const clearCart = () => {
  localStorage.removeItem('bagichaCart')
  localStorage.removeItem('appliedCoupon')
  window.dispatchEvent(new Event('cartUpdated'))
}

/**
 * Get payment method display name
 */
export const getPaymentMethodName = (method: string): string => {
  const methods: Record<string, string> = {
    'upi': 'UPI',
    'card': 'Credit/Debit Card',
    'netbanking': 'Net Banking',
    'wallet': 'Wallet',
    'cod': 'Cash on Delivery',
    'gokwik': 'GoKwik Payment',
    'razorpay': 'Razorpay Payment',
  }
  return methods[method] || method
}

/**
 * Validate payment data before processing
 */
export const validatePaymentData = (data: {
  customerDetails?: any
  shippingAddress?: any
  items?: any[]
  amount?: number
}) => {
  const errors: string[] = []
  
  if (!data.customerDetails || !data.customerDetails.phone) {
    errors.push('Customer phone number is required')
  }
  
  if (!data.shippingAddress) {
    errors.push('Shipping address is required')
  }
  
  if (!data.items || data.items.length === 0) {
    errors.push('Cart is empty')
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push('Invalid order amount')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Handle payment error
 */
export const handlePaymentError = (error: any): string => {
  console.error('Payment Error:', error)
  
  const errorMessage = error?.message || String(error) || ''
  
  if (errorMessage.includes('configuration')) {
    return 'Payment gateway is not configured properly. Please contact support.'
  }
  
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.'
  }
  
  if (errorMessage.includes('timeout')) {
    return 'Payment request timed out. Please try again.'
  }
  
  return errorMessage || 'Payment failed. Please try again or contact support.'
}

/**
 * Log payment event for analytics
 */
export const logPaymentEvent = (event: string, data: any) => {
  // This can be integrated with your analytics service
  console.log('Payment Event:', event, data)
  
  // Example: Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data)
  }
  
  // Example: Facebook Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, data)
  }
}
