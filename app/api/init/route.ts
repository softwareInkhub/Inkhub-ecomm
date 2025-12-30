import { NextResponse } from 'next/server'
import redis from '@/lib/redis'

export async function GET() {
  try {
    await redis.ping()
    return NextResponse.json({ status: 'Redis initialized' })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
