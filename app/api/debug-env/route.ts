import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || "MISSING",
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? "SET" : "MISSING",
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "MISSING",
  });
}
