import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { code, cartTotal } = body

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📥 DISCOUNT VALIDATION REQUEST')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📝 Code:', code)
    console.log('💰 Cart Total:', cartTotal)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Discount code is required' },
        { status: 400 }
      )
    }

    if (!process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL || !process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
      console.error('❌ Shopify credentials missing')
      return NextResponse.json(
        { success: false, error: 'Shopify not configured' },
        { status: 500 }
      )
    }

    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL.replace(/^https?:\/\//, '')
    const apiVersion = process.env.SHOPIFY_API_VERSION || '2024-01'
    const shopifyUrl = `https://${storeUrl}/admin/api/${apiVersion}/price_rules.json`

    const requestHeaders = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔍 FETCHING PRICE RULES FROM SHOPIFY')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📍 Request URL:', shopifyUrl)
    console.log('🏪 Store:', storeUrl)
    console.log('📋 API Version:', apiVersion)
    console.log('🔑 Token:', process.env.SHOPIFY_ADMIN_ACCESS_TOKEN ? `${process.env.SHOPIFY_ADMIN_ACCESS_TOKEN.substring(0, 10)}...` : 'MISSING')
    console.log('📦 Method: GET')
    console.log('📋 Headers:', {
      'Content-Type': requestHeaders['Content-Type'],
      'X-Shopify-Access-Token': requestHeaders['X-Shopify-Access-Token'] ? `${requestHeaders['X-Shopify-Access-Token'].substring(0, 10)}...` : 'MISSING'
    })
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Fetch price rules from Shopify
    const priceRulesResponse = await fetch(shopifyUrl, {
      method: 'GET',
      headers: requestHeaders,
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📡 SHOPIFY PRICE RULES RESPONSE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Status:', priceRulesResponse.status, priceRulesResponse.statusText)
    console.log('✅ Response OK:', priceRulesResponse.ok)
    console.log('📋 Response Headers:', Object.fromEntries(priceRulesResponse.headers.entries()))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (!priceRulesResponse.ok) {
      const errorText = await priceRulesResponse.text()
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('❌ SHOPIFY API ERROR')
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.error('📊 Status:', priceRulesResponse.status)
      console.error('📝 Response Body:', errorText)
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      throw new Error(`Shopify API returned ${priceRulesResponse.status}: ${errorText}`)
    }

    const priceRulesData = await priceRulesResponse.json()
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ PRICE RULES RESPONSE DATA')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 Total Price Rules:', priceRulesData.price_rules?.length || 0)
    console.log('📦 Response Data (first 3 rules):', JSON.stringify(
      priceRulesData.price_rules?.slice(0, 3).map((rule: any) => ({
        id: rule.id,
        title: rule.title,
        value_type: rule.value_type,
        value: rule.value,
        starts_at: rule.starts_at,
        ends_at: rule.ends_at,
        status: rule.status
      })),
      null,
      2
    ))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Find active price rules
    const now = new Date()
    const activePriceRules = priceRulesData.price_rules?.filter((rule: any) => {
      const startDate = new Date(rule.starts_at)
      const endDate = rule.ends_at ? new Date(rule.ends_at) : null
      return startDate <= now && (!endDate || endDate >= now)
    }) || []

    console.log(`🔍 Found ${activePriceRules.length} active price rules`)

    // Fetch all discount codes in parallel for better performance
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('⚡ FETCHING ALL DISCOUNT CODES IN PARALLEL')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📊 Fetching discount codes for ${activePriceRules.length} price rules...`)

    const discountCodePromises = activePriceRules.map(async (priceRule: any) => {
      const discountCodesUrl = `https://${storeUrl}/admin/api/${apiVersion}/price_rules/${priceRule.id}/discount_codes.json`
      
      try {
        const discountCodesResponse = await fetch(discountCodesUrl, {
          method: 'GET',
          headers: requestHeaders,
        })

        if (!discountCodesResponse.ok) {
          const errorText = await discountCodesResponse.text()
          console.error(`❌ Failed to fetch discount codes for price rule ${priceRule.id} (${priceRule.title}):`, errorText)
          return { priceRule, discountCodes: [], error: true }
        }

        const discountCodesData = await discountCodesResponse.json()
        const codes = discountCodesData.discount_codes || []
        
        console.log(`✅ Price Rule ${priceRule.id} (${priceRule.title}): Found ${codes.length} codes - [${codes.map((dc: any) => dc.code).join(', ') || 'None'}]`)

        return { priceRule, discountCodes: codes, error: false }
      } catch (error: any) {
        console.error(`❌ Error fetching discount codes for price rule ${priceRule.id}:`, error.message)
        return { priceRule, discountCodes: [], error: true }
      }
    })

    // Wait for all requests to complete in parallel
    const discountCodeResults = await Promise.all(discountCodePromises)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✅ ALL DISCOUNT CODES FETCHED')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Search for matching code across all results
    const searchCodeUpper = code.toUpperCase()
    for (const result of discountCodeResults) {
      if (result.error) continue

      const matchingCode = result.discountCodes.find(
        (dc: any) => dc.code.toUpperCase() === searchCodeUpper
      )

      if (matchingCode) {
        const priceRule = result.priceRule
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ MATCH FOUND!')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log(`📋 Price Rule: ${priceRule.title} (ID: ${priceRule.id})`)
        console.log(`📝 Discount Code: ${matchingCode.code}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        // Calculate discount amount
        let discountAmount = 0

        if (priceRule.value_type === 'fixed_amount') {
          discountAmount = Math.abs(parseFloat(priceRule.value))
        } else if (priceRule.value_type === 'percentage') {
          const percentage = Math.abs(parseFloat(priceRule.value))
          discountAmount = (cartTotal * percentage) / 100
        }

        // Check minimum purchase requirement
        if (priceRule.prerequisite_subtotal_range?.greater_than_or_equal_to) {
          const minAmount = parseFloat(priceRule.prerequisite_subtotal_range.greater_than_or_equal_to)
          if (cartTotal < minAmount) {
            console.log(`❌ Cart total (₹${cartTotal}) is less than minimum (₹${minAmount})`)
            return NextResponse.json({
              success: false,
              valid: false,
              error: `Minimum purchase of ₹${minAmount} required for this coupon`,
            })
          }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('✅ COUPON VALIDATION SUCCESS')
        console.log(`💰 Discount Amount: ₹${discountAmount}`)
        console.log(`📊 Discount Type: ${priceRule.value_type}`)
        console.log(`📈 Discount Value: ${priceRule.value}`)
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

        return NextResponse.json({
          success: true,
          valid: true,
          code: matchingCode.code,
          discountAmount: Math.min(discountAmount, cartTotal),
          discountType: priceRule.value_type,
          discountValue: priceRule.value,
          priceRuleId: priceRule.id,
          title: priceRule.title,
        })
      }
    }

    // Code not found
    console.log('❌ Discount code not found')
    return NextResponse.json({
      success: false,
      valid: false,
      error: 'Invalid discount code',
    })
  } catch (error: any) {
    console.error('Validate discount error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to validate discount code' },
      { status: 500 }
    )
  }
}

