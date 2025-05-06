import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const { prompt, model = "gemini-1.5-pro", temperature = 0.2, maxTokens = 1024 } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 })
    }

    // Use the selected model or default to gemini-1.5-pro
    let modelToUse = model || "gemini-1.5-pro"

    // Fix model name format - remove "models/" prefix if present
    if (modelToUse.startsWith("models/")) {
      modelToUse = modelToUse.replace("models/", "")
    }

    // List of supported models
    const supportedModels = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.0-flash"]

    // Check if the model is in our supported list
    if (!supportedModels.includes(modelToUse)) {
      return NextResponse.json(
        {
          error: `Model ${modelToUse} is not supported. Please use one of: ${supportedModels.join(", ")}`,
        },
        { status: 400 },
      )
    }

    // Determine API version based on model name
    const apiVersion = modelToUse.includes("gemini-2.0") ? "v1" : "v1beta"

    // Choose the appropriate API key based on the model using environment variables
    const apiKey = modelToUse.includes("gemini-2.0") ? process.env.GEMINI_API_KEY_V2 : process.env.GEMINI_API_KEY_V1

    // Check if the API key exists
    if (!apiKey) {
      console.error(`Missing API key for model: ${modelToUse}`)
      return NextResponse.json(
        {
          error: `Configuration error: Missing API key for ${modelToUse}. Please check your environment variables.`,
        },
        { status: 500 },
      )
    }

    console.log(`Using model: ${modelToUse} with API version: ${apiVersion}`)
    console.log(`Parameters: temperature=${temperature}, maxTokens=${maxTokens}`)
    console.log(`Prompt: "${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}"`)

    // Modify the prompt to request JSON data
    const jsonPrompt = `${prompt}\n\nPlease provide your response as a valid JSON object. Format your response as a JSON object without any explanatory text.`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelToUse}:generateContent?key=${apiKey}`,
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
                  text: jsonPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: Number.parseFloat(temperature),
            topK: 40,
            topP: 0.95,
            maxOutputTokens: Number.parseInt(maxTokens),
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      },
    )

    // Handle non-OK responses
    if (!response.ok) {
      const responseText = await response.text()
      let errorMessage = `Gemini API error: HTTP ${response.status}`

      try {
        const errorData = JSON.parse(responseText)
        errorMessage = `Gemini API error: ${JSON.stringify(errorData)}`
      } catch (e) {
        // If we can't parse the error as JSON, just use the text
        errorMessage = `Gemini API error: ${responseText.substring(0, 200)}`
      }

      console.error(errorMessage)
      return NextResponse.json({ error: errorMessage }, { status: 500 })
    }

    // Safely parse the response
    let data
    try {
      const responseText = await response.text()
      data = JSON.parse(responseText)
    } catch (error) {
      return NextResponse.json(
        {
          error: `Error parsing response: ${error.message}`,
        },
        { status: 500 },
      )
    }

    // Handle the response structure correctly
    let generatedText = ""
    if (
      data.candidates &&
      data.candidates.length > 0 &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.length > 0
    ) {
      generatedText = data.candidates[0].content.parts[0].text
    } else {
      console.error("Unexpected response structure:", JSON.stringify(data))
      generatedText = "The API returned a response in an unexpected format."
      return NextResponse.json({ error: generatedText }, { status: 500 })
    }

    // Try to parse the generated text as JSON
    try {
      // Extract JSON from the text (in case the model includes explanatory text)
      const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) ||
        generatedText.match(/```\s*([\s\S]*?)\s*```/) || [null, generatedText]

      const jsonText = jsonMatch[1].trim()
      const jsonData = JSON.parse(jsonText)

      // Log the JSON data to the terminal
      console.log("\n=== GENERATED JSON DATA ===")
      console.log(JSON.stringify(jsonData, null, 2))
      console.log("===========================\n")

      // Return the parsed JSON data
      return NextResponse.json({ data: jsonData })
    } catch (error) {
      console.error("Error parsing JSON from model response:", error)
      console.log("Raw text received:", generatedText)

      // Return the raw text if JSON parsing fails
      return NextResponse.json(
        {
          error: "Failed to parse JSON from model response",
          rawText: generatedText,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error generating data:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to generate data",
      },
      { status: 500 },
    )
  }
}

