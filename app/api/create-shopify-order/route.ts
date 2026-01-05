import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Deprecated: This endpoint used the Orders API which doesn't support applied discounts reliably.
  // Use /api/create-shopify-draft-order instead. Returning 410 Gone to prevent accidental use.
  console.warn('Deprecated endpoint /api/create-shopify-order called. Use draft order flow.')
  return NextResponse.json(
    { success: false, error: 'Deprecated. Use /api/create-shopify-draft-order' },
    { status: 410 }
  )
}

