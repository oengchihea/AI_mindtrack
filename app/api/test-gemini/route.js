import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get your actual API key
    const apiKey = "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM" // Your API key

    // Updated endpoint with the correct model name format
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Hello, can you respond with just the word 'working' to confirm the API is functioning?",
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({
        status: "error",
        message: `API test failed: ${JSON.stringify(errorData)}`,
        details: errorData,
      })
    }

    const data = await response.json()
    return NextResponse.json({
      status: "success",
      message: "API test successful",
      response: data,
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: `Error testing API: ${error.message}`,
    })
  }
}

