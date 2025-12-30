import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET() {
  let redis_connected = false
  let redis_error = null

  try {
    // Test Redis connection
    await redis.ping()
    redis_connected = true
  } catch (err) {
    redis_error = err instanceof Error ? err.message : 'Unknown error'
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Inkhub Next.js Server is running',
    redis: {
      connected: redis_connected,
      error: redis_error,
    },
    razorpay_configured: !!(
      process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && 
      process.env.RAZORPAY_KEY_SECRET
    ),
    shopify_configured: !!(
      process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL && 
      process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
    ),
  })
}

