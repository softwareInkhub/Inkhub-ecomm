// simulate_draft_order_test.js
// Usage: `node scripts/simulate_draft_order_test.js`
// Optional env vars:
//  - MODE=print (default) | post-local | post-shopify
//  - SHOPIFY_STORE (e.g. your-store.myshopify.com)
//  - SHOPIFY_ADMIN_TOKEN (admin API token) - required for post-shopify
//  - SHOPIFY_TAXES_INCLUDED (true|false)

(async () => {
  // Test parameters: subtotal 333 -> final 3.33 using a 99% coupon
  const subtotal = 333.00
  const coupon = {
    code: 'INK99',
    type: 'percentage', // 'percentage' or 'fixed_amount'
    value: 99.0, // percentage value when type is 'percentage'
    title: '99% Off (test)'
  }

  const taxesIncluded = process.env.SHOPIFY_TAXES_INCLUDED === 'true'
  const mode = process.env.MODE || 'print'
  const store = process.env.SHOPIFY_STORE || ''
  const adminToken = process.env.SHOPIFY_ADMIN_TOKEN || ''

  // Line items
  const lineItems = [
    {
      title: 'Test Product',
      price: subtotal.toFixed(2),
      quantity: 1,
      sku: 'TEST-333'
    }
  ]

  // Compute discount amount
  let appliedDiscount = null
  if (coupon.type === 'fixed_amount') {
    const amount = Math.min(parseFloat(String(coupon.value || 0)), subtotal)
    appliedDiscount = {
      description: coupon.title || coupon.code,
      value: amount.toFixed(2),
      value_type: 'fixed_amount',
      amount: amount.toFixed(2)
    }
  } else if (coupon.type === 'percentage') {
    const percentage = Math.max(0, parseFloat(String(coupon.value || 0)))
    const discountAmount = Math.min((subtotal * percentage) / 100, subtotal)
    appliedDiscount = {
      description: coupon.title || coupon.code,
      value: percentage.toFixed(2), // percentage value
      value_type: 'percentage',
      amount: discountAmount.toFixed(2) // computed absolute rupee amount
    }
  }

  // Draft order payload
  const draftOrderPayload = {
    draft_order: {
      line_items: lineItems,
      customer: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      },
      shipping_address: {
        first_name: 'Test',
        last_name: 'User',
        address1: '123 Test Lane',
        city: 'Mumbai',
        province: 'MH',
        zip: '400001',
        country: 'IN'
      },
      billing_address: {
        first_name: 'Test',
        last_name: 'User',
        address1: '123 Test Lane',
        city: 'Mumbai',
        province: 'MH',
        zip: '400001',
        country: 'IN'
      },
      note: 'Simulate ₹333 -> ₹3.33 coupon test',
      note_attributes: [
        { name: 'Test', value: 'simulate_draft_order_test' }
      ],
      tags: 'test,draft-order',
      applied_discount: appliedDiscount,
      taxes_included: taxesIncluded
    }
  }

  // Compute expected final totals locally for verification
  const expected = {
    subtotal: subtotal.toFixed(2),
    discount_amount: parseFloat(appliedDiscount.amount).toFixed(2),
    total_after_discount: (subtotal - parseFloat(appliedDiscount.amount)).toFixed(2)
  }

  console.log('\n=== Draft Order Payload (JSON) ===\n')
  console.log(JSON.stringify(draftOrderPayload, null, 2))

  console.log('\n=== Expected Totals (local) ===\n')
  console.log(expected)

  // Show curl example for posting to local API or Shopify Admin API
  console.log('\n=== Example: curl to local Next.js API (dev) ===\n')
  console.log("curl -X POST http://localhost:3000/api/create-shopify-draft-order -H 'Content-Type: application/json' -d '" + JSON.stringify({
    customer: draftOrderPayload.draft_order.customer,
    items: lineItems,
    shippingAddress: draftOrderPayload.draft_order.shipping_address,
    total: parseFloat(expected.total_after_discount),
    orderId: 'TESTORD' + Date.now(),
    paymentDetails: { razorpay_payment_id: 'simulated' },
    appliedDiscount: {
      code: coupon.code,
      type: coupon.type === 'percentage' ? 'percentage' : 'fixed_amount',
      value: coupon.value,
      title: coupon.title
    }
  }) + "'\n")

  console.log('\n=== Example: curl directly to Shopify Admin API ===\n')
  console.log('NOTE: replace SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN')
  console.log("curl -X POST https://SHOPIFY_STORE/admin/api/2024-01/draft_orders.json -H 'Content-Type: application/json' -H 'X-Shopify-Access-Token: SHOPIFY_ADMIN_TOKEN' -d '" + JSON.stringify(draftOrderPayload) + "'\n")

  if (mode === 'post-local') {
    // Attempt to POST to local API
    try {
      const res = await fetch('http://localhost:3000/api/create-shopify-draft-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Create `customer.name` to match API expectations (some routes expect `customer.name` string)
          customer: {
            name: `${draftOrderPayload.draft_order.customer.first_name} ${draftOrderPayload.draft_order.customer.last_name}`,
            email: draftOrderPayload.draft_order.customer.email
          },
          items: lineItems,
          shippingAddress: draftOrderPayload.draft_order.shipping_address,
          total: parseFloat(expected.total_after_discount),
          orderId: 'TESTORD' + Date.now(),
          paymentDetails: { razorpay_payment_id: 'simulated' },
          appliedDiscount: {
            code: coupon.code,
            type: coupon.type === 'percentage' ? 'percentage' : 'fixed_amount',
            value: coupon.value,
            title: coupon.title
          }
        })
      })
      const body = await res.text()
      console.log('\n=== Local API Response ===\n', res.status, res.statusText, '\n', body)
    } catch (err) {
      console.error('\nError posting to local API:', err)
    }
  }

  if (mode === 'post-shopify') {
    if (!store || !adminToken) {
      console.error('SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN must be set for post-shopify mode')
      process.exit(1)
    }
    try {
      const url = `https://${store}/admin/api/2024-01/draft_orders.json`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': adminToken },
        body: JSON.stringify(draftOrderPayload)
      })
      const body = await res.text()
      console.log('\n=== Shopify Admin Response ===\n', res.status, res.statusText, '\n', body)
    } catch (err) {
      console.error('\nError posting to Shopify Admin API:', err)
    }
  }

})()
