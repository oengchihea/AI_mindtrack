import { NextResponse } from "next/server"

// Get API key from environment variable or use a fallback for development
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM"

export async function POST(request) {
  try {
    const { promptType, count = 3, mood, topic } = await request.json()

    if (!promptType) {
      return NextResponse.json({ error: "Missing prompt type" }, { status: 400 })
    }

    let prompt = ""

    if (promptType === "guided") {
      // Generate guided journal prompts
      prompt = `Generate ${count} thoughtful and introspective journal prompts that encourage self-reflection and emotional awareness. 
      
      The prompts should:
      1. Be phrased as questions
      2. Be different from each other and cover different aspects of the day or emotions
      3. Encourage detailed responses rather than yes/no answers
      4. Be supportive and non-judgmental
      5. Focus on feelings, experiences, gratitude, challenges, and growth
      
      Return the prompts as a JSON array of strings in this format:
      {
        "prompts": ["prompt1", "prompt2", "prompt3"]
      }
      
      DO NOT include any text before or after the JSON.`
    } else if (promptType === "topic") {
      // Generate prompts based on a specific topic
      prompt = `Generate ${count} thoughtful journal prompts about "${topic}".
      
      The prompts should:
      1. Be phrased as questions
      2. Be different from each other and cover different aspects of the topic
      3. Encourage detailed responses rather than yes/no answers
      4. Be supportive and non-judgmental
      
      Return the prompts as a JSON array of strings in this format:
      {
        "prompts": ["prompt1", "prompt2", "prompt3"]
      }
      
      DO NOT include any text before or after the JSON.`
    } else if (promptType === "mood") {
      // Generate prompts based on the user's current mood
      prompt = `Generate ${count} thoughtful journal prompts for someone who is feeling "${mood}".
      
      The prompts should:
      1. Be phrased as questions
      2. Be different from each other
      3. Be appropriate for the mood "${mood}"
      4. Encourage detailed responses rather than yes/no answers
      5. Be supportive and non-judgmental
      
      Return the prompts as a JSON array of strings in this format:
      {
        "prompts": ["prompt1", "prompt2", "prompt3"]
      }
      
      DO NOT include any text before or after the JSON.`
    } else {
      // Default to general prompts
      prompt = `Generate ${count} general journal prompts that encourage self-reflection.
      
      The prompts should:
      1. Be phrased as questions
      2. Be different from each other
      3. Encourage detailed responses rather than yes/no answers
      
      Return the prompts as a JSON array of strings in this format:
      {
        "prompts": ["prompt1", "prompt2", "prompt3"]
      }
      
      DO NOT include any text before or after the JSON.`
    }

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
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
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Gemini API error:", errorData)
      return NextResponse.json(
        {
          error: `Gemini API error: ${JSON.stringify(errorData)}`,
        },
        { status: 500 },
      )
    }

    const data = await response.json()

    // Extract the text from the Gemini response
    let text = ""
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts
      if (parts && parts.length > 0) {
        text = parts[0].text
      }
    }

    if (!text) {
      return NextResponse.json({ error: "Empty response from Gemini API" }, { status: 500 })
    }

    // Parse the response as JSON
    let promptsResult
    try {
      // Try to extract JSON from the text (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      promptsResult = JSON.parse(jsonText)
    } catch (e) {
      console.error("Error parsing Gemini response as JSON:", e)

      // If parsing fails, create a fallback response with default prompts
      promptsResult = {
        prompts: [
          "How did you feel overall today, and what influenced your mood the most?",
          "What was the most challenging part of your day, and how did you handle it?",
          "What is one small win or positive moment you can appreciate from today?",
        ],
      }
    }

    return NextResponse.json(promptsResult)
  } catch (error) {
    console.error("Error generating journal prompts:", error)
    return NextResponse.json({ error: "Failed to generate journal prompts" }, { status: 500 })
  }
}

