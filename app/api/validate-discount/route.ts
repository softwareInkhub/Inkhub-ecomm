import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { code, cartTotal } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, valid: false, error: "Discount code is required" },
        { status: 400 }
      );
    }

    const storeUrl = process.env.NEXT_PUBLIC_SHOPIFY_STORE_URL?.replace(/^https?:\/\//, "");
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const apiVersion = process.env.SHOPIFY_API_VERSION || "2024-01";

    if (!storeUrl || !adminToken) {
      return NextResponse.json(
        { success: false, valid: false, error: "Shopify credentials missing" },
        { status: 500 }
      );
    }

    // ----------------------------
    // STEP 1 — LOOKUP DISCOUNT CODE
    // ----------------------------

    const lookupUrl = `https://${storeUrl}/admin/api/${apiVersion}/discount_codes/lookup.json?code=${encodeURIComponent(
      code
    )}`;

    const lookupRes = await fetch(lookupUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
    });

    if (lookupRes.status === 404) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Invalid discount code",
      });
    }

    if (!lookupRes.ok) {
      return NextResponse.json(
        { success: false, valid: false, error: "Failed to check discount code" },
        { status: 500 }
      );
    }

    const lookupData = await lookupRes.json();
    const discountCode = lookupData.discount_code;

    if (!discountCode || !discountCode.price_rule_id) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Invalid discount code",
      });
    }

    // ❗ IMPORTANT: Do NOT check discountCode.status — REST API often returns null.
    // Only price rule determines validity.

    // --------------------------------------
    // STEP 2 — FETCH PRICE RULE FOR THE CODE
    // --------------------------------------

    const priceRuleUrl = `https://${storeUrl}/admin/api/${apiVersion}/price_rules/${discountCode.price_rule_id}.json`;

    const prRes = await fetch(priceRuleUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": adminToken,
      },
    });

    if (!prRes.ok) {
      return NextResponse.json(
        { success: false, valid: false, error: "Failed to fetch discount details" },
        { status: 500 }
      );
    }

    const prData = await prRes.json();
    const rule = prData.price_rule;

    if (!rule) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "Discount rule not found",
      });
    }

    // ----------------------------
    // VALIDATE PRICE RULE ONLY
    // ----------------------------

    const now = new Date();

    if (new Date(rule.starts_at) > now) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This discount code is not active yet",
      });
    }

    if (rule.ends_at && new Date(rule.ends_at) < now) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This discount code has expired",
      });
    }

    if (rule.usage_limit && rule.usage_count >= rule.usage_limit) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: "This discount code has reached its usage limit",
      });
    }

    // Minimum purchase
    if (rule.prerequisite_subtotal_range?.greater_than_or_equal_to) {
      const min = parseFloat(rule.prerequisite_subtotal_range.greater_than_or_equal_to);
      if (cartTotal < min) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: `Minimum order of ₹${min} required`,
        });
      }
    }

    // ----------------------------
    // CALCULATE DISCOUNT
    // ----------------------------

    let discountAmount = 0;

    if (rule.value_type === "fixed_amount") {
      discountAmount = Math.abs(parseFloat(rule.value));
    } else if (rule.value_type === "percentage") {
      const pct = Math.abs(parseFloat(rule.value));
      discountAmount = (cartTotal * pct) / 100;
    }

    discountAmount = Math.min(discountAmount, cartTotal);

    // ----------------------------
    // SUCCESS RESPONSE
    // ----------------------------

    return NextResponse.json({
      success: true,
      valid: true,
      code: discountCode.code,
      discountAmount,
      discountType: rule.value_type,
      discountValue: rule.value,
      priceRuleId: rule.id,
      title: rule.title,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, valid: false, error: error.message },
      { status: 500 }
    );
  }
}
