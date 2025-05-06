import { NextResponse } from "next/server"

export async function GET() {
  const apiKeyExists = !!process.env.GEMINI_API_KEY

  return NextResponse.json({
    apiKeyConfigured: apiKeyExists,
    apiKeyLength: apiKeyExists ? process.env.GEMINI_API_KEY.length : 0,
    // Don't include the actual key for security reasons
  })
}

