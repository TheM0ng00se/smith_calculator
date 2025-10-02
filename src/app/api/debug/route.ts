import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const debugData = await request.json()
    
    const logData = {
      timestamp: new Date().toISOString(),
      ...debugData
    }
    
    const logPath = path.join(process.cwd(), 'smithy-debug.log')
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2))
    
    return NextResponse.json({ success: true, path: logPath })
  } catch (error) {
    console.error('Failed to write debug log:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
