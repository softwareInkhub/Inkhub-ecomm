'use server'

import redis from './redis'
import type { DiscountCode } from '@/types'

const VALID_TTL = 300  // 5 min
const INVALID_TTL = 60 // 1 min

export const getCachedCoupon = async (
  code: string,
  cartTotal: number
): Promise<DiscountCode | null> => {
  const key = `coupon:${code}:${cartTotal}`
  const cached = await redis.get(key)
  return cached ? JSON.parse(cached) : null
}

export const setCachedCoupon = async (
  code: string,
  cartTotal: number,
  data: DiscountCode
) => {
  const key = `coupon:${code}:${cartTotal}`
  const ttl = data.valid ? VALID_TTL : INVALID_TTL

  await redis.set(key, JSON.stringify(data), 'EX', ttl)
}
