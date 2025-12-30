/**
 * Discount Engine
 * Applies discounts to cart items and calculates totals
 */

import type { CartItem } from '@/types'

export interface PriceRule {
  id: number
  title: string
  valueType: 'fixed_amount' | 'percentage'
  value: string | number
  startsAt: string
  endsAt?: string | null
  usageLimit?: number | null
  usageCount?: number | null
  prerequisiteSubtotalRange?: {
    greater_than_or_equal_to?: string
  } | null
  targetSelection?: 'all' | 'specific'
  targets?: Array<{ variant_id?: number; product_id?: number }>
  customerSelection?: 'all' | 'specific'
}

export interface AppliedDiscount {
  code: string
  discountAmount: number
  discountType: 'fixed_amount' | 'percentage'
  discountValue: number
  priceRuleId: number
  title: string
  priceRule?: PriceRule
}

export interface CartTotals {
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  savings: number
}

/**
 * Apply discount to cart and calculate new totals
 */
export function applyDiscountToCart(
  cartItems: CartItem[],
  quantities: Record<string, number>,
  appliedDiscount: AppliedDiscount | null,
  deliveryFee: number = 0
): CartTotals {
  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => {
    const qty = quantities[item.id] || item.quantity || 1
    const itemPrice = parseFloat(String(item.price || 0))
    const itemTotal = itemPrice * qty
    return sum + itemTotal
  }, 0)
  
  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🛒 Discount Engine Calculation:', {
      cartItemsCount: cartItems.length,
      subtotal,
      appliedDiscount: appliedDiscount ? {
        code: appliedDiscount.code,
        discountAmount: appliedDiscount.discountAmount,
        discountType: appliedDiscount.discountType,
        discountValue: appliedDiscount.discountValue,
      } : null,
      deliveryFee,
    })
  }

  // Calculate discount
  let discount = 0
  if (appliedDiscount) {
    if (appliedDiscount.discountType === 'fixed_amount') {
      // Fixed amount discount - use the amount from API (already calculated correctly)
      discount = Math.abs(parseFloat(String(appliedDiscount.discountAmount || 0)))
      discount = Math.min(discount, subtotal)
    } else if (appliedDiscount.discountType === 'percentage') {
      // Percentage discount - recalculate based on current subtotal
      const percentage = Math.abs(parseFloat(String(appliedDiscount.discountValue || 0)))
      discount = (subtotal * percentage) / 100
      discount = Math.min(discount, subtotal)
    }
  }

  // Ensure discount is never negative and doesn't exceed subtotal
  discount = Math.max(0, Math.min(discount, subtotal))

  // Calculate total: subtotal - discount + delivery fee
  const total = Math.max(0, subtotal - discount + deliveryFee)

  // Calculate savings (same as discount for now)
  const savings = discount

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('💰 Final Totals:', {
      subtotal: subtotal.toFixed(2),
      discount: discount.toFixed(2),
      deliveryFee: deliveryFee.toFixed(2),
      total: total.toFixed(2),
      calculation: `${subtotal} - ${discount} + ${deliveryFee} = ${total}`,
    })
  }

  return {
    subtotal,
    discount,
    deliveryFee,
    total,
    savings,
  }
}

/**
 * Recalculate discount when cart changes
 * This ensures discounts are recalculated when quantities change
 */
export function recalculateDiscount(
  cartItems: CartItem[],
  quantities: Record<string, number>,
  appliedDiscount: AppliedDiscount | null,
  deliveryFee: number = 0
): AppliedDiscount | null {
  if (!appliedDiscount) {
    return null
  }

  // Recalculate discount amount based on new cart total
  const subtotal = cartItems.reduce((sum, item) => {
    const qty = quantities[item.id] || item.quantity || 1
    return sum + (parseFloat(String(item.price || 0)) * qty)
  }, 0)

  let newDiscountAmount = 0

  if (appliedDiscount.discountType === 'fixed_amount') {
    // For fixed amount, use the original discount amount (capped at subtotal)
    newDiscountAmount = Math.abs(parseFloat(String(appliedDiscount.discountAmount || 0)))
    newDiscountAmount = Math.min(newDiscountAmount, subtotal)
  } else if (appliedDiscount.discountType === 'percentage') {
    // For percentage, recalculate based on current subtotal
    const percentage = Math.abs(parseFloat(String(appliedDiscount.discountValue || 0)))
    newDiscountAmount = (subtotal * percentage) / 100
    newDiscountAmount = Math.min(newDiscountAmount, subtotal)
  }

  // Ensure discount is never negative
  newDiscountAmount = Math.max(0, newDiscountAmount)

  // Check minimum purchase requirement if exists
  if (appliedDiscount.priceRule?.prerequisiteSubtotalRange?.greater_than_or_equal_to) {
    const minAmount = parseFloat(
      appliedDiscount.priceRule.prerequisiteSubtotalRange.greater_than_or_equal_to
    )
    if (subtotal < minAmount) {
      // Discount no longer valid - minimum not met
      return null
    }
  }

  return {
    ...appliedDiscount,
    discountAmount: newDiscountAmount,
  }
}

/**
 * Format discount message for UI
 */
export function formatDiscountMessage(discount: AppliedDiscount): string {
  if (discount.discountType === 'fixed_amount') {
    return `₹${discount.discountAmount.toFixed(0)} off`
  } else if (discount.discountType === 'percentage') {
    return `${discount.discountValue}% off`
  }
  return discount.title || 'Discount applied'
}


