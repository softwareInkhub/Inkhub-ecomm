import { NextResponse } from "next/server";

const API_URL =
  "https://brmh.in/cache/data?project=my-app&table=shopify-inkhub-get-products&key=chunk:0";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);

  try {
    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const res = await fetch(API_URL, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      const allProducts = Array.isArray(json?.data) ? json.data : [];

      const filtered =
        !category || category === "All Tattoos"
          ? allProducts
          : allProducts.filter((p: any) => p.category === category);

      // Ensure we always return { data: [] } format
      if (json && json.data && Array.isArray(json.data)) {
        return NextResponse.json(json);
      }

      // Return empty data array if format is invalid
      console.warn("Products API returned invalid format");
      return NextResponse.json({ data: [] }, { status: 200 });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Server fetch error:", error?.message || error);
    // Return empty data array to prevent client-side crashes
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
