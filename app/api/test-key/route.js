import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY

  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "GEMINI_API_KEY is not set",
    })
  }

  // Check API key format (Gemini API keys typically start with "AI" and are long)
  const isValidFormat = apiKey.startsWith("AI") && apiKey.length > 20

  return NextResponse.json({
    status: isValidFormat ? "valid_format" : "invalid_format",
    message: isValidFormat
      ? "API key has the correct format"
      : "API key does not match the expected format for Gemini API keys",
    keyLength: apiKey.length,
    keyPrefix: apiKey.substring(0, 2) + "...",
  })
}

