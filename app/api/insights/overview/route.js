import { NextResponse } from "next/server"

// Get API key from environment variable or use a fallback for development
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM"

export async function POST(request) {
  try {
    const { moodData, journalData } = await request.json()

    if (!moodData && !journalData) {
      return NextResponse.json({ error: "Missing mood or journal data" }, { status: 400 })
    }

    // Calculate overall statistics
    const overallStats = {
      totalMoodEntries: moodData.length,
      totalJournalEntries: journalData.length,
      averageMood:
        moodData.length > 0 ? moodData.reduce((sum, entry) => sum + (entry.score || 0), 0) / moodData.length : null,
      highestMood: moodData.length > 0 ? Math.max(...moodData.map((entry) => entry.score || 0)) : null,
      lowestMood: moodData.length > 0 ? Math.min(...moodData.map((entry) => entry.score || 0)) : null,
    }

    // Extract mood words for analysis
    const moodWords = moodData
      .map((entry) => entry.moodWord || entry.mood)
      .filter((word) => word && typeof word === "string")

    // Extract journal themes (using titles or first few words)
    const journalThemes = journalData.map((entry) => {
      if (entry.title) return entry.title
      if (entry.content) {
        // Get first 5 words of content as a pseudo-title
        return entry.content.split(" ").slice(0, 5).join(" ") + "..."
      }
      return "Untitled entry"
    })

    // Create prompt for Gemini API
    const prompt = `Analyze the following mood tracking and journal data to identify patterns, trends, and insights.
                   Focus on overall mood patterns and correlations with journal entries.
                   
                   Mood Data: ${JSON.stringify(moodData)}
                   Journal Data: ${JSON.stringify(journalData)}
                   Overall Statistics: ${JSON.stringify(overallStats)}
                   Mood Words Used: ${JSON.stringify(moodWords)}
                   Journal Themes: ${JSON.stringify(journalThemes)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. summary: A brief summary of the overall mood and journal patterns
                   2. patterns: Array of identified patterns (at least 3-5 patterns if data permits)
                   3. insights: Key insights about the user's mood trends
                   4. moodTrend: Description of the overall mood trajectory
                   5. journalThemes: Common themes identified in journal entries
                   6. correlations: Any correlations between mood scores and journal content
                   
                   If there's not enough data for a particular field, provide a message indicating more data is needed.
                   DO NOT include any text before or after the JSON.`

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
            temperature: 0.2,
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
    let analysisResult
    try {
      // Try to extract JSON from the text (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      const jsonText = jsonMatch ? jsonMatch[0] : text

      analysisResult = JSON.parse(jsonText)

      // Add the overall stats to the response
      analysisResult.stats = overallStats
    } catch (e) {
      console.error("Error parsing Gemini response as JSON:", e)

      // If parsing fails, create a basic analysis result
      analysisResult = {
        summary: "We analyzed your mood and journal data.",
        patterns: ["No clear patterns could be identified with the available data."],
        insights: "Continue tracking your mood and journaling to get more detailed insights.",
        moodTrend: "Not enough data to determine a trend.",
        journalThemes: "More journal entries needed to identify themes.",
        correlations: "More data needed to identify correlations.",
        stats: overallStats,
      }
    }

    return NextResponse.json({ analysis: analysisResult })
  } catch (error) {
    console.error("Error analyzing overview data:", error)
    return NextResponse.json({ error: "Failed to analyze overview data" }, { status: 500 })
  }
}
