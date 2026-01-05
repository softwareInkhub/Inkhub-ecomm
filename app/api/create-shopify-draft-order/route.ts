import { NextRequest, NextResponse } from 'next/server'
import type { AppliedDiscountForShopify } from '@/types'
import { round2 } from '@/utils/round'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, shippingAddress, total, orderId, paymentDetails, appliedDiscount } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 SHOPIFY DRAFT ORDER CREATION REQUEST')
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
      price: String(parseFloat(item.price).toFixed(2)),
      quantity: item.quantity || 1,
      sku: item.id,
    }))

    // Split customer name
    const nameParts = customer.name.trim().split(' ')
    const firstName = nameParts[0] || customer.name
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]

    // Format phone number
    let phoneInput = customer.phone
    if (Array.isArray(phoneInput)) {
      phoneInput = phoneInput[0] || ''
    }
    if (typeof phoneInput !== 'string') {
      phoneInput = String(phoneInput || '')
    }
    
    let formattedPhone = phoneInput.replace(/\D/g, '')
    if (formattedPhone && formattedPhone.length === 10) {
      formattedPhone = `+91${formattedPhone}`
    } else if (formattedPhone && !formattedPhone.startsWith('+')) {
      formattedPhone = `+91${formattedPhone}`
    }
    const phoneForShopify = formattedPhone || undefined

    console.log('📝 Customer name split:', { original: customer.name, firstName, lastName })
    console.log('📞 Phone formatting:', { 
      original: customer.phone, 
      phoneInput: phoneInput,
      formatted: phoneForShopify,
    })
    console.log('📦 Line Items:', JSON.stringify(lineItems, null, 2))

    // Create draft order payload with discount support
    const draftOrderPayload: any = {
      draft_order: {
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
      },
    }

    // Add phone if valid
    if (phoneForShopify && typeof phoneForShopify === 'string') {
      draftOrderPayload.draft_order.customer.phone_number = phoneForShopify
      draftOrderPayload.draft_order.shipping_address.phone = phoneForShopify
      draftOrderPayload.draft_order.billing_address.phone = phoneForShopify
    }

    // Calculate subtotal from line items for discount calculation
    const subtotal = lineItems.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.price) * item.quantity)
    }, 0)
    const subtotalRounded = round2(subtotal)

    // Apply discount if provided - ensure value and value_type match Shopify expectations
    if (appliedDiscount) {
      const discount: AppliedDiscountForShopify = appliedDiscount
      const applied: any = {
        description: discount.title || discount.code,
      }

      if (discount.type === 'fixed_amount') {
        // Fixed amount - pass amount as value and set value_type to fixed_amount
        const discountAmount = Math.min(parseFloat(String(discount.value || 0)), subtotalRounded)
        const discountAmountRounded = round2(discountAmount)
        applied.value = discountAmountRounded.toFixed(2)
        applied.value_type = 'fixed_amount'
        applied.amount = discountAmountRounded.toFixed(2)
      } else if (discount.type === 'percentage') {
        // Percentage - pass the percentage as value and set value_type to percentage
        const percentage = Math.max(0, parseFloat(String(discount.value || 0)))
        const discountAmount = Math.min((subtotalRounded * percentage) / 100, subtotalRounded)
        const discountAmountRounded = round2(discountAmount)
        applied.value = percentage.toFixed(2) // Shopify expects percentage here when value_type is 'percentage'
        applied.value_type = 'percentage'
        applied.amount = discountAmountRounded.toFixed(2) // absolute amount for reference
      }

      draftOrderPayload.draft_order.applied_discount = applied

      console.log('💰 DISCOUNT DETAILS')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('Code:', discount.code)
      console.log('Type:', discount.type)
      console.log('Value (sent):', applied.value)
      console.log('Title:', discount.title)
      console.log('Subtotal:', subtotalRounded.toFixed(2))
      console.log('Applied Discount Amount (computed):', applied.amount)
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    }

    console.log('💰 PRICE FORMATTING')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const totalRounded = round2(Number(total || 0))
    console.log('📥 Input total:', totalRounded, '(type:', typeof totalRounded, ')')
    console.log('📊 Line items prices:')
    lineItems.forEach((item: any, idx: number) => {
      console.log(`  [${idx}] ${item.title}: ₹${item.price} x ${item.quantity}`)
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

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

    const shopifyApiUrl = `https://${storeUrl}/admin/api/${apiVersion}/draft_orders.json`

    // Tax handling: honour environment flag. If taxes are included in the prices we send,
    // set taxes_included to true so Shopify does not double-calc tax. Otherwise let Shopify calculate taxes.
    const taxesIncluded = process.env.SHOPIFY_TAXES_INCLUDED === 'true'
    draftOrderPayload.draft_order.taxes_included = taxesIncluded

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 CALLING SHOPIFY DRAFT ORDERS API')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 API URL:', shopifyApiUrl)
    console.log('🏪 Store:', storeUrl)
    console.log('📋 API Version:', apiVersion)
    console.log('📦 Draft Order Payload:', JSON.stringify(draftOrderPayload, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Create draft order in Shopify
    const response = await fetch(shopifyApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminToken,
      },
      body: JSON.stringify(draftOrderPayload),
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
          error: 'Failed to create draft order in Shopify',
          details: data.errors || data,
          status: response.status,
        },
        { status: 500 }
      )
    }

    const draftOrder = data.draft_order
    console.log('✅ Draft order created:', draftOrder.id)
    console.log('📋 Invoice URL:', draftOrder.invoice_url)
    
    return NextResponse.json({
      success: true,
      draft_order: {
        id: draftOrder.id,
        invoice_url: draftOrder.invoice_url,
        total_price: draftOrder.total_price,
        tax: draftOrder.tax,
        line_items: draftOrder.line_items,
        applied_discount: draftOrder.applied_discount,
      },
    })
  } catch (error: any) {
    console.error('Create draft order error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create draft order' },
      { status: 500 }
    )
  }
}
