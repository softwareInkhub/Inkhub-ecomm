import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Inkhub Next.js Server is running',
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

