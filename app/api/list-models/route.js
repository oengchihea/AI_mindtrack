import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKeyV1 = process.env.GEMINI_API_KEY_V1
    const apiKeyV2 = process.env.GEMINI_API_KEY_V2

    // Define the reliable models we know work well for text generation
    const reliableModels = [
      {
        name: "gemini-1.5-pro",
        version: "v1beta",
        displayName: "Gemini 1.5 Pro",
        supportedMethods: ["generateContent"],
      },
      {
        name: "gemini-1.5-flash",
        version: "v1beta",
        displayName: "Gemini 1.5 Flash",
        supportedMethods: ["generateContent"],
      },
      {
        name: "gemini-2.0-flash",
        version: "v1",
        displayName: "Gemini 2.0 Flash",
        supportedMethods: ["generateContent"],
      },
      // Removed gemini-2.0-pro as it's not available or supported
    ]

    // Only try to fetch additional models if we have API keys
    if (apiKeyV1 || apiKeyV2) {
      try {
        // Fetch models from v1beta endpoint (for gemini-1.5)
        if (apiKeyV1) {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKeyV1}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          if (response.ok) {
            const data = await response.json()
            const models = data.models || []

            // Filter for only the most reliable text generation models
            const filteredModels = models.filter((model) => {
              const modelName = model.name.toLowerCase()

              // Include only core Gemini 1.5 models
              return (
                (modelName === "gemini-1.5-pro" || modelName === "gemini-1.5-flash") &&
                model.supportedGenerationMethods?.includes("generateContent")
              )
            })

            // Map to our standard format
            filteredModels.forEach((model) => {
              // Only add if not already in our reliable models list
              if (!reliableModels.some((m) => m.name === model.name)) {
                reliableModels.push({
                  name: model.name,
                  version: "v1beta",
                  displayName: model.displayName || model.name,
                  supportedMethods: model.supportedGenerationMethods || [],
                })
              }
            })
          }
        }

        // Fetch models from v1 endpoint (for gemini-2.0)
        if (apiKeyV2) {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKeyV2}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          })

          if (response.ok) {
            const data = await response.json()
            const models = data.models || []

            // Filter for only gemini-2.0-flash which is known to work
            const filteredModels = models.filter((model) => {
              const modelName = model.name.toLowerCase()

              // Include only gemini-2.0-flash
              return modelName === "gemini-2.0-flash" && model.supportedGenerationMethods?.includes("generateContent")
            })

            // Map to our standard format
            filteredModels.forEach((model) => {
              // Only add if not already in our reliable models list
              if (!reliableModels.some((m) => m.name === model.name)) {
                reliableModels.push({
                  name: model.name,
                  version: "v1",
                  displayName: model.displayName || model.name,
                  supportedMethods: model.supportedGenerationMethods || [],
                })
              }
            })
          }
        }
      } catch (error) {
        console.error("Error fetching models:", error)
        // Continue with our reliable models list even if API calls fail
      }
    }

    return NextResponse.json({
      status: "success",
      message: "Successfully retrieved models",
      models: reliableModels,
    })
  } catch (error) {
    console.error("Error in list-models:", error)
    return NextResponse.json({
      status: "error",
      message: `Error listing models: ${error.message}`,
    })
  }
}

