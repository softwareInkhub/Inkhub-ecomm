import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { round2 } from '@/utils/round'

// Initialize Razorpay with environment variables
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || ''
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || ''

if (!razorpayKeyId || !razorpayKeySecret) {
  console.error('❌ Razorpay credentials missing!')
  console.error('Required: NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET')
}

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
})

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error('❌ Razorpay credentials missing in request!')
      console.error('Key ID:', razorpayKeyId ? '✅' : '❌ Missing')
      console.error('Key Secret:', razorpayKeySecret ? '✅' : '❌ Missing')
      return NextResponse.json(
        { success: false, error: 'Razorpay is not configured. Please check environment variables.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { amount, currency, receipt, notes } = body

    // Validate input
    if (typeof amount !== 'number' || Number.isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Round amount to 2 decimals to avoid floating point leaks then convert to paise
    const amountRounded = round2(amount)
    const options = {
      amount: Math.round(amountRounded * 100), // Convert to paise
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    }

    console.log('Creating Razorpay order:', options)

    // Create order
    const order = await razorpay.orders.create(options)

    console.log('Razorpay order created:', order.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    })
  } catch (error: any) {
    console.error('❌ Create order error:', error.message || error)
    console.error('Error details:', error.response?.data || error.statusCode || 'Unknown')
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

