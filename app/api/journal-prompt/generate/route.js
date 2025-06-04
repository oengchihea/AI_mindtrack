import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const MODEL_NAME = "gemini-1.5-flash-latest" // Or your preferred working model
const API_KEY = process.env.GEMINI_API_KEY_V2 // Ensure this is the correct key

async function generatePromptsForAI(promptInstruction) {
  if (API_KEY && API_KEY.length > 10) {
    console.log(
      `generatePromptsForAI: GEMINI_API_KEY_V2 found (partially hidden for security: ${API_KEY.substring(0, 4)}...${API_KEY.slice(-4)})`,
    )
  } else if (API_KEY) {
    console.warn("generatePromptsForAI: GEMINI_API_KEY_V2 found, but it seems very short. Please verify it.")
  } else {
    console.error(
      "CRITICAL ERROR in generatePromptsForAI: GEMINI_API_KEY_V2 is NOT SET or is EMPTY in the server environment.",
    )
    return {
      error: "API key not configured on the server. Please check Vercel environment variables for GEMINI_API_KEY_V2.",
    }
  }

  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const generationConfig = {
    temperature: 0.8, // Maintained for creativity
    topK: 40, // Maintained for diverse word choice
    topP: 0.9,
    maxOutputTokens: 350, // Slightly increased to allow more complex thought for diverse prompts
  }

  const safetySettings = [
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
  ]

  const parts = [{ text: promptInstruction }]

  try {
    console.log(`generatePromptsForAI: Attempting to call Gemini API with model: ${MODEL_NAME}...`)
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    })

    const response = await result.response
    const jsonString = response.text()
    console.log("generatePromptsForAI: Received response from Gemini API. Attempting to parse JSON.")

    try {
      const parsedJson = JSON.parse(jsonString)
      console.log("generatePromptsForAI: Successfully parsed JSON from AI.")
      return parsedJson
    } catch (parseError) {
      console.error("generatePromptsForAI: Error parsing JSON from AI:", parseError)
      console.error("generatePromptsForAI: AI JSON string was:", jsonString)
      if (jsonString && typeof jsonString === "string" && jsonString.includes('"prompts":')) {
        const promptArrayMatch = jsonString.match(/"prompts":\s*(\[.*?\])/)
        if (promptArrayMatch && promptArrayMatch[1]) {
          try {
            console.log("generatePromptsForAI: Attempting fallback JSON parsing for prompts array.")
            return { prompts: JSON.parse(promptArrayMatch[1]) }
          } catch (e) {
            console.error("generatePromptsForAI: Fallback parsing failed:", e)
          }
        }
      }
      return { error: "Failed to parse JSON from AI response. Response: " + jsonString }
    }
  } catch (apiError) {
    console.error("generatePromptsForAI: Gemini API call error:", apiError)
    const errorMessage = apiError.message || "Failed to generate prompts due to AI API error."
    return { error: errorMessage, details: apiError.toString() }
  }
}

export async function POST(req) {
  console.log("API Route /api/journal-prompt/generate: Received POST request.")
  try {
    const { promptType = "guided", count = 3, topic, mood } = await req.json()
    console.log(
      `API Route: Request body parsed. promptType: ${promptType}, count: ${count}, topic: ${topic}, mood: ${mood}`,
    )

    let instructionToAI = ""

    // STRONGLY ENHANCED INSTRUCTIONS FOR MAXIMAL VARIETY IN MEANING, DIMENSION, AND MOOD SPECIFICITY
    const commonInstructions = `
You are an insightful and creative journaling coach for the "Mindtrack" app. Your primary goal is to help users explore their moods and feelings from genuinely new and different angles with each set of questions.

The ${count} prompts you generate MUST adhere to these strict principles:
1.  **Radical Semantic Diversity & Dimensional Exploration:** Each question in the set of ${count} MUST explore a *fundamentally different dimension* of the user's current emotional state. Do NOT generate questions that are merely rephrased versions of each other or that probe the same underlying idea.
    *   Consider these distinct dimensions for inspiration (ensure each question in a set taps into a *different* dimension):
        *   **Causation/Triggers:** What events, thoughts, or interactions might have led to this feeling?
        *   **Physical Sensations:** How does this mood manifest in the body?
        *   **Cognitive Patterns:** What specific thoughts or beliefs are accompanying this mood?
        *   **Intensity & Duration:** How strong is this feeling, and has it changed over time?
        *   **Behavioral Impact:** How is this mood influencing actions or desires to act?
        *   **Needs & Desires:** What might this mood indicate about unmet needs or current desires?
        *   **Coping & Response:** What has helped in the past, or what might help now with this feeling?
        *   **Learning & Growth:** What can be learned from experiencing this mood?
        *   **Relational Aspect:** How does this mood affect or relate to interactions with others?
        *   **Future Outlook:** How does this mood color perception of the near future?
2.  **Guaranteed Novelty Over Time:** Each new set of prompts must feel entirely fresh. Avoid repeating question *themes, dimensions, or specific phrasings* that might have been used in recent (hypothetical) previous sessions, even if the user's stated mood is the same.
3.  **Concise yet Profound:** Questions should be relatively short and easy to understand, but crafted to provoke deep, insightful, and specific reflection about their mood and feelings.
4.  **Hyper-Specific to Mood (if provided):** If a mood (e.g., "${mood || "the user's current mood"}") is specified, every question must be intricately and uniquely tailored to exploring varied facets of *that specific mood*.
5.  **Concrete & Actionable Reflection:** Absolutely avoid abstract or vague metaphorical questions (e.g., "What color is your mood?"). Focus on tangible feelings, thoughts, experiences, and potential insights.
6.  **Empathetic Tone:** Maintain a supportive, understanding, and non-judgmental tone.
7.  **Effective for "Mindtrack" Logging:** Frame questions to elicit thoughtful yet concise responses (a sentence or two is ideal) that clearly articulate the user's mood for effective logging.

Return the prompts as a JSON array of strings in this format: {"prompts": ["prompt1", "prompt2", "prompt3"]}. DO NOT include any text before or after the JSON.`

    switch (promptType) {
      case "guided":
        instructionToAI = `Generate ${count} radically distinct and deeply insightful journal questions for the "Mindtrack" app. Each question must offer a unique dimensional exploration of the user's current emotional landscape, ensuring maximum variety in meaning and focus with every new set of prompts. ${commonInstructions}`
        break
      case "topic":
        instructionToAI = `Generate ${count} radically distinct and deeply insightful journal questions about "${topic}" for the "Mindtrack" app. Each question must encourage focused reflection on how this topic uniquely influences the user's current mood, thoughts, and feelings from a different dimensional perspective each time, ensuring maximum variety in meaning and focus. ${commonInstructions}`
        break
      case "mood":
        instructionToAI = `Generate ${count} empathetic, radically distinct, and deeply insightful journal questions for someone feeling "${mood}", for the "Mindtrack" app. Each question must help them explore this specific mood "${mood}" from a genuinely unique dimensional perspective (e.g., its specific causes, its unique physical sensations, associated thought patterns, or constructive responses to it). Ensure maximum variety in meaning and focus with every new set of prompts, even if the mood "${mood}" is requested multiple times. ${commonInstructions}`
        break
      default: // General prompts
        instructionToAI = `Generate ${count} radically distinct and deeply insightful general journal questions for the "Mindtrack" app. Each question must invite focused reflection about the user's current mood, thoughts, and significant experiences from a unique dimensional angle each time, aiming for clarity and depth in understanding their emotional state with brief but meaningful responses. Ensure maximum variety in meaning and focus with every new set of prompts. ${commonInstructions}`
    }

    console.log("API Route: Instruction to AI prepared. Calling generatePromptsForAI...")
    const result = await generatePromptsForAI(instructionToAI)

    if (result.error) {
      console.error(
        "API Route: Error received from generatePromptsForAI:",
        result.error,
        "Details:",
        result.details || "No additional details.",
      )
      return NextResponse.json(
        { error: result.error, details: result.details || "Error occurred in API route while generating prompts." },
        { status: 500 },
      )
    }
    if (!result.prompts || result.prompts.length === 0) {
      console.warn("API Route: No prompts generated or invalid format from AI. Result:", JSON.stringify(result))
      return NextResponse.json(
        {
          error: "No prompts generated or invalid format from AI.",
          details: "AI might have returned an empty or malformed prompt list.",
        },
        { status: 500 },
      )
    }

    console.log("API Route: Successfully generated prompts. Sending response to client.")
    return NextResponse.json(result)
  } catch (error) {
    console.error("API Route: Unhandled exception in POST handler:", error.message, error.stack)
    return NextResponse.json(
      { error: "An unexpected server error occurred in POST handler.", details: error.message },
      { status: 500 },
    )
  }
}
