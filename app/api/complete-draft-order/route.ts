import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { draftOrderId, paymentDetails } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ COMPLETING DRAFT ORDER REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Draft Order ID:', draftOrderId)
    console.log('Payment Details:', paymentDetails)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!draftOrderId) {
      console.error('❌ Missing draft order ID')
      return NextResponse.json(
        { success: false, error: 'Missing draft order ID' },
        { status: 400 }
      )
    }

    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL?.replace(/^https?:\/\//, '') || ''
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01'
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ''

    if (!storeUrl || !adminToken) {
      console.error('❌ Shopify credentials missing')
      return NextResponse.json(
        { success: false, error: 'Shopify not configured. Missing store URL or admin token.' },
        { status: 500 }
      )
    }

    const shopifyApiUrl = `https://${storeUrl}/admin/api/${apiVersion}/draft_orders/${draftOrderId}/complete.json`

    const payload = {
      draft_order: {
        payment_pending: false,
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 CALLING SHOPIFY COMPLETE DRAFT ORDER API')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 API URL:', shopifyApiUrl)
    console.log('📦 Payload:', JSON.stringify(payload, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Complete draft order in Shopify
    const response = await fetch(shopifyApiUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(payload),
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 SHOPIFY API RESPONSE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Status:', response.status, response.statusText)
    console.log('✅ Response OK:', response.ok)

    const data = await response.json()
    console.log('📦 Response Data:', JSON.stringify(data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!response.ok) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY API ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Status:', response.status)
      console.error('Errors:', JSON.stringify(data.errors || data, null, 2))
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to complete draft order in Shopify',
          details: data.errors || data,
          status: response.status,
        },
        { status: 500 }
      )
    }

    const draftOrderData = data.draft_order

    // Shopify may return the created order in draft_order.order or only provide draft_order.order_id.
    // Handle both: prefer returned order object, otherwise fetch the order by ID.
    let order: any = draftOrderData.order
    if (!order && draftOrderData.order_id) {
      try {
        const orderId = draftOrderData.order_id
        const ordersUrl = `https://${storeUrl}/admin/api/${apiVersion}/orders/${orderId}.json`
        const orderResp = await fetch(ordersUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': adminToken,
          },
        })
        if (orderResp.ok) {
          const orderData = await orderResp.json()
          order = orderData.order
        } else {
          console.warn('⚠️ Could not fetch order by ID after draft completion', orderResp.status)
        }
      } catch (err) {
        console.error('⚠️ Error fetching completed order by ID:', err)
      }
    }

    if (!order) {
      console.error('❌ No order returned from draft order completion')
      return NextResponse.json(
        {
          success: false,
          error: 'Draft order completed but no order returned',
          details: data,
        },
        { status: 500 }
      )
    }
    console.log('✅ Draft order completed successfully')
    console.log('📋 Final Shopify Order ID:', order.id)
    console.log('📊 Order Number:', order.order_number)
    console.log('💵 Total Price:', order.total_price)
    console.log('💰 Total Discounts:', order.total_discounts)
    console.log('💳 Discount Codes:', order.discount_codes)
    
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
        total_price: order.total_price,
        total_discounts: order.total_discounts,
        discount_codes: order.discount_codes,
        financial_status: order.financial_status,
        fulfillment_status: order.fulfillment_status,
      },
    })
  } catch (error: any) {
    console.error('Complete draft order error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to complete draft order' },
      { status: 500 }
    )
  }
}
