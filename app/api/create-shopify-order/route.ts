import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, shippingAddress, total, orderId, paymentDetails } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🛍️ SHOPIFY ORDER CREATION REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📦 Request Body:', JSON.stringify(body, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Validate required fields
    if (!customer || !items || !shippingAddress || !total) {
      console.error('❌ Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: customer, items, shippingAddress, or total' },
        { status: 400 }
      )
    }

    // Format line items
    const lineItems = items.map((item: any) => ({
      title: item.name || item.title,
      price: parseFloat(item.price).toFixed(2),
      quantity: item.quantity || 1,
      sku: item.id,
    }))

    // Split customer name - handle single name case
    const nameParts = customer.name.trim().split(' ')
    const firstName = nameParts[0] || customer.name
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] // Use first name if no last name

    // Format phone number for Shopify (E.164 format: +[country code][number])
    // Remove all non-digit characters and ensure it starts with country code
    let formattedPhone = (customer.phone || '').replace(/\D/g, '') // Remove non-digits
    if (formattedPhone && formattedPhone.length === 10) {
      // If it's a 10-digit Indian number, add +91 prefix
      formattedPhone = `+91${formattedPhone}`
    } else if (formattedPhone && !formattedPhone.startsWith('+')) {
      // If it doesn't start with +, add +91 for India
      formattedPhone = `+91${formattedPhone}`
    }
    // If phone is empty or invalid, use a placeholder or skip it
    const phoneForShopify = formattedPhone || undefined

    console.log('📝 Customer name split:', { original: customer.name, firstName, lastName })
    console.log('📞 Phone formatting:', { original: customer.phone, formatted: phoneForShopify })
    console.log('📦 Line Items:', JSON.stringify(lineItems, null, 2))

    // Create order payload
    const orderPayload: any = {
      order: {
        line_items: lineItems,
        customer: {
          first_name: firstName,
          last_name: lastName,
          email: customer.email || undefined,
        },
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: shippingAddress.addressLine1,
          address2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          province: shippingAddress.state,
          zip: shippingAddress.pincode,
          country: 'IN',
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address1: shippingAddress.addressLine1,
          address2: shippingAddress.addressLine2 || '',
          city: shippingAddress.city,
          province: shippingAddress.state,
          zip: shippingAddress.pincode,
          country: 'IN',
        },
        financial_status: 'paid',
        fulfillment_status: null,
        note: `Razorpay Order ID: ${orderId} | Payment ID: ${paymentDetails?.razorpay_payment_id || 'N/A'}`,
        note_attributes: [
          {
            name: 'Payment Gateway',
            value: 'Razorpay',
          },
          {
            name: 'Payment ID',
            value: paymentDetails?.razorpay_payment_id || orderId,
          },
          {
            name: 'Order ID',
            value: orderId,
          },
        ],
        tags: 'razorpay, web-order',
        total_price: total.toFixed(2),
      },
    }

    // Add phone number only if it's valid and formatted
    if (phoneForShopify) {
      orderPayload.order.customer.phone = phoneForShopify
      orderPayload.order.shipping_address.phone = phoneForShopify
      orderPayload.order.billing_address.phone = phoneForShopify
    }

    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL?.replace(/^https?:\/\//, '') || ''
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01'
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || ''

    if (!storeUrl || !adminToken) {
      console.error('❌ Shopify credentials missing')
      console.error('Store URL:', storeUrl ? 'Set' : 'MISSING')
      console.error('Admin Token:', adminToken ? 'Set' : 'MISSING')
      return NextResponse.json(
        { success: false, error: 'Shopify not configured. Missing store URL or admin token.' },
        { status: 500 }
      )
    }

    const shopifyApiUrl = `https://${storeUrl}/admin/api/${apiVersion}/orders.json`

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 CALLING SHOPIFY API')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 API URL:', shopifyApiUrl)
    console.log('🏪 Store:', storeUrl)
    console.log('📋 API Version:', apiVersion)
    console.log('🔑 Token:', adminToken ? `${adminToken.substring(0, 10)}...` : 'MISSING')
    console.log('📦 Order Payload:', JSON.stringify(orderPayload, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Create order in Shopify
    const response = await fetch(shopifyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(orderPayload),
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 SHOPIFY API RESPONSE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Status:', response.status, response.statusText)
    console.log('✅ Response OK:', response.ok)
    console.log('📋 Response Headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('📦 Response Data:', JSON.stringify(data, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!response.ok) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY API ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      console.error('Errors:', JSON.stringify(data.errors || data, null, 2))
      console.error('Full Response:', JSON.stringify(data, null, 2))
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create order in Shopify',
          details: data.errors || data,
          status: response.status,
        },
        { status: 500 }
      )
    }

    console.log('✅ Shopify order created:', data.order.id)

    return NextResponse.json({
      success: true,
      shopify_order: {
        id: data.order.id,
        order_number: data.order.order_number,
        total_price: data.order.total_price,
      },
    })
  } catch (error: any) {
    console.error('Create Shopify order error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create Shopify order' },
      { status: 500 }
    )
  }
}

