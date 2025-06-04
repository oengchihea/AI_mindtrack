import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const MODEL_NAME = "gemini-1.0-pro"
const API_KEY = process.env.GOOGLE_API_KEY // Ensure this is set in your Vercel environment variables

async function generatePrompts(prompt) {
  if (!API_KEY) {
    console.error("GOOGLE_API_KEY is not set.")
    return { error: "API key not configured." }
  }
  const genAI = new GoogleGenerativeAI(API_KEY)
  const model = genAI.getModel({ model: MODEL_NAME })

  const generationConfig = {
    temperature: 0.7,
    topK: 20,
    topP: 0.9,
    maxOutputTokens: 250, // Slightly increased for potentially more detailed instructions
  }

  const safetySettings = [
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
  ]

  const parts = [{ text: prompt }]

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    })

    const response = await result.response
    const jsonString = response.text()

    try {
      const parsedJson = JSON.parse(jsonString)
      return parsedJson
    } catch (error) {
      console.error("Error parsing JSON:", error)
      console.error("JSON string was:", jsonString)
      if (jsonString && typeof jsonString === "string" && jsonString.toLowerCase().includes("prompt")) {
        const lines = jsonString
          .split("\n")
          .filter((line) => line.trim().startsWith('"') || line.trim().startsWith("prompt"))
        if (lines.length > 0) {
          return { prompts: lines.map((line) => line.replace(/["-,]/g, "").trim()).filter((p) => p.length > 5) }
        }
      }
      return { error: "Failed to parse JSON from the response. Response was: " + jsonString }
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return { error: "Failed to generate prompts due to API error." }
  }
}

export async function POST(req) {
  const { promptType, count = 3, topic, mood } = await req.json()

  let prompt = ""

  switch (promptType) {
    case "guided":
      prompt = `Generate ${count} short, simple, and engaging journal questions for a mind-tracking app called "Mindtrack". Each question should be easy to understand and answer quickly. Focus on clarity and brevity.
  
  The prompts should:
  1. Be phrased as very short, clear questions.
  2. Be distinct and easy to grasp.
  3. Be supportive and non-judgmental.
  4. Encourage brief reflection on current thoughts or feelings, suitable for tracking one's mental state in the "Mindtrack" app.
  5. Gently guide towards identifying one key insight or a small positive aspect from their current experience for their "Mindtrack" log.
  6. Be framed to naturally elicit concise, thoughtful responses suitable for quick entries in the "Mindtrack" app.
  
  Return the prompts as a JSON array of strings in this format:
  {
    "prompts": ["prompt1", "prompt2", "prompt3"]
  }
  
  DO NOT include any text before or after the JSON.`
      break
    case "topic":
      prompt = `Generate ${count} short, simple, and engaging journal questions about "${topic}" for a mind-tracking app called "Mindtrack". Each question should be easy to understand and answer quickly. Focus on clarity and brevity.
  
  The prompts should:
  1. Be phrased as very short, clear questions related to "${topic}".
  2. Be distinct and easy to grasp.
  3. Be supportive and non-judgmental.
  4. If the topic allows, subtly guide towards self-reflection relevant to tracking one's mindset on "${topic}" within the "Mindtrack" app.
  5. For the topic "${topic}", encourage identifying one key feeling or takeaway to note in their "Mindtrack" log.
  6. Be framed to elicit focused, concise answers about "${topic}" for quick "Mindtrack" entries.
  
  Return the prompts as a JSON array of strings in this format:
  {
    "prompts": ["prompt1", "prompt2", "prompt3"]
  }
  
  DO NOT include any text before or after the JSON.`
      break
    case "mood":
      prompt = `Generate ${count} short, simple, and engaging journal questions for someone feeling "${mood}", to be used in a mind-tracking app called "Mindtrack". Each question should be easy to understand and answer quickly. Focus on clarity and brevity.
  
  The prompts should:
  1. Be phrased as very short, clear questions suitable for the mood "${mood}".
  2. Be distinct and easy to grasp.
  3. Be supportive and non-judgmental.
  4. For the mood "${mood}", offer a gentle prompt to observe or understand the feeling, helping the user track their emotional state in the "Mindtrack" app.
  5. If the mood "${mood}" is challenging, gently suggest identifying a single point of comfort or a simple coping thought for their "Mindtrack" entry. If the mood is positive, encourage savoring one specific detail.
  6. Be framed for the mood "${mood}" to encourage brief, honest reflections for quick "Mindtrack" entries.
  
  Return the prompts as a JSON array of strings in this format:
  {
    "prompts": ["prompt1", "prompt2", "prompt3"]
  }
  
  DO NOT include any text before or after the JSON.`
      break
    default: // General prompts
      prompt = `Generate ${count} short, simple, and engaging general journal questions for a mind-tracking app called "Mindtrack". Each question should be easy to understand and answer quickly. Focus on clarity and brevity.
  
  The prompts should:
  1. Be phrased as very short, clear questions.
  2. Be distinct and easy to grasp.
  3. Be supportive and non-judgmental.
  4. Encourage a moment of self-awareness, fitting for tracking daily thoughts or feelings in the "Mindtrack" app.
  5. Gently guide towards identifying one specific thought or feeling from the day to note in their "Mindtrack" log.
  6. Be framed to naturally elicit concise, thoughtful responses suitable for quick entries in the "Mindtrack" app.
  
  Return the prompts as a JSON array of strings in this format:
  {
    "prompts": ["prompt1", "prompt2", "prompt3"]
  }
  
  DO NOT include any text before or after the JSON.`
  }

  const resultPrompts = await generatePrompts(prompt)

  if (resultPrompts.error) {
    return NextResponse.json({ error: resultPrompts.error }, { status: 500 })
  }

  return NextResponse.json(resultPrompts)
}
