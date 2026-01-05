import { NextResponse } from "next/server";

const API_URL =
  "https://brmh.in/cache/data?project=my-app&table=shopify-inkhub-get-products&key=chunk:0";

// PERF: Cache products in memory to avoid repeated fetches
let cachedAllProducts: any[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const category = searchParams.get("category");
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 12);

  try {
    // PERF: Use cached data if available and fresh
    const now = Date.now();
    if (cachedAllProducts && (now - cacheTimestamp) < CACHE_TTL) {
      const filtered =
        !category || category === "All Tattoos"
          ? cachedAllProducts
          : cachedAllProducts.filter((p: any) => p.category === category);

      // PERF: Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return NextResponse.json(
        {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

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

      // PERF: Cache the fetched products
      cachedAllProducts = allProducts;
      cacheTimestamp = now;

      const filtered =
        !category || category === "All Tattoos"
          ? allProducts
          : allProducts.filter((p: any) => p.category === category);

      // PERF: Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return NextResponse.json(
        {
          data: paginatedData,
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
          },
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: any) {
    console.error("Server fetch error:", error?.message || error);
    // Return empty data array to prevent client-side crashes
    return NextResponse.json({ data: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } }, { status: 200 });
  }
}
