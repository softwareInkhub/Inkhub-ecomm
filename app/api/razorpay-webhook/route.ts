import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-razorpay-signature')
    
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || ''

    const shasum = crypto.createHmac('sha256', secret)
    shasum.update(JSON.stringify(body))
    const digest = shasum.digest('hex')

    if (digest === signature) {
      console.log('✅ Webhook verified:', body.event)

      // Handle different webhook events
      if (body.event === 'payment.captured') {
        console.log('Payment captured:', body.payload.payment.entity.id)
      }

      return NextResponse.json({ status: 'ok' })
    } else {
      console.error('❌ Webhook verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

