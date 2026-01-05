/**
 * Authentication Logout Utility
 * Clears all user credentials and authentication data from localStorage
 */

/**
 * Complete logout - clears all authentication and user data from localStorage
 */
export function clearAllAuthData(): void {
  // Authentication tokens - both snake_case and camelCase versions
  localStorage.removeItem('Inkhubuthenticated')
  localStorage.removeItem('access_token')
  localStorage.removeItem('accessToken')
  localStorage.removeItem('idToken')
  localStorage.removeItem('id_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('refresh_token_expiry')

  // User profile data
  localStorage.removeItem('bagichaUserName')
  localStorage.removeItem('bagichaUserFirstName')
  localStorage.removeItem('bagichaUserLastName')
  localStorage.removeItem('bagichaUserPhone')
  localStorage.removeItem('bagichaPhoneNumber')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user_email')
  localStorage.removeItem('verification_email')

  // Address data
  localStorage.removeItem('Inkhubddress')
  localStorage.removeItem('bagichaSavedAddresses')

  // Cart and orders
  localStorage.removeItem('bagichaCart')
  localStorage.removeItem('bagichaOrders')
  localStorage.removeItem('appliedCoupon')

  // Recently viewed and wishlist
  localStorage.removeItem('bagichaRecentlyViewed')

  // Password reset related
  localStorage.removeItem('reset_password_email')
  localStorage.removeItem('reset_password_identifier')
  localStorage.removeItem('reset_password_type')

  // Remember me
  localStorage.removeItem('rememberMe')

  // Razorpay related
  localStorage.removeItem('rzp_checkout_anon_id')
  localStorage.removeItem('rzp_device_id')
  localStorage.removeItem('rzp_stored_checkout_id')

  // Payment checkout
  localStorage.removeItem('rzp_checkout_anon_id')

  // Cache/browser related
  localStorage.removeItem('ally-supports-cache')

  // Avatar
  localStorage.removeItem('Inkhubvatar')

  // Scheduled delivery
  localStorage.removeItem('scheduledDelivery')

  console.log('✅ All authentication data cleared from localStorage')
}

/**
 * Get list of all stored keys for debugging
 */
export function getAllStoredKeys(): string[] {
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      keys.push(key)
    }
  }
  return keys
}

/**
 * Log all remaining localStorage data (for debugging after logout)
 */
export function logRemainingData(): void {
  const keys = getAllStoredKeys()
  console.log('📋 Remaining localStorage keys:', keys)
  
  keys.forEach((key) => {
    const value = localStorage.getItem(key)
    console.log(`  - ${key}: ${value?.substring(0, 50)}...`)
  })
}
