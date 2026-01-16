import { NextRequest, NextResponse } from 'next/server'
import { getUser, createOrUpdateUser } from '@/lib/dynamodb'

/**
 * GET /api/users?id=<userId>
 * Fetch user by ID (Firebase UID)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }

    const user = await getUser(userId)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/users
 * Create or update user in DynamoDB
 * Body: { id, phone, name?, email? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, phone, name, email } = body

    if (!id || !phone) {
      return NextResponse.json(
        { success: false, error: 'User ID and phone number are required' },
        { status: 400 }
      )
    }

    const user = await createOrUpdateUser({
      id,
      phone,
      name,
      email,
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create/update user' },
      { status: 500 }
    )
  }
}
