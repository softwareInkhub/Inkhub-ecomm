import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const CONFIG_PATH = path.join(process.cwd(), '..', 'config.json')

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params
    
    if (!section) {
      return NextResponse.json(
        { error: 'Section parameter is required' },
        { status: 400 }
      )
    }
    
    let config: any = {}
    try {
      const fileContent = await fs.readFile(CONFIG_PATH, 'utf-8')
      config = JSON.parse(fileContent)
    } catch (error: any) {
      console.error('Error reading config file:', CONFIG_PATH, error)
      return NextResponse.json(
        { error: 'Failed to read config file', message: error.message },
        { status: 500 }
      )
    }
    
    const sectionData = config[section] || {}
    
    // Always return an object, never null
    return NextResponse.json(sectionData)
  } catch (error: any) {
    console.error('Error fetching config:', error?.message || error)
    // Return empty object instead of error to prevent UI crashes
    return NextResponse.json({}, { status: 200 })
  }
}



