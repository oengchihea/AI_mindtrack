import { NextResponse } from "next/server"

// Get API key from environment variable or use a fallback for development
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM"

export async function POST(request) {
  try {
    const { moodData, journalData, weekStart, weekEnd } = await request.json()

    if (!moodData && !journalData) {
      return NextResponse.json({ error: "Missing mood or journal data" }, { status: 400 })
    }

    // Filter data for the selected week
    const weekStartDate = new Date(weekStart)
    const weekEndDate = new Date(weekEnd)

    const weeklyMoodData = moodData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= weekStartDate && entryDate < weekEndDate
    })

    const weeklyJournalData = journalData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= weekStartDate && entryDate < weekEndDate
    })

    // Create a day-by-day breakdown of the week
    const dayBreakdown = []
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStartDate)
      currentDay.setDate(weekStartDate.getDate() + i)

      // Get entries for this day
      const dayMoods = weeklyMoodData.filter((entry) => {
        const entryDate = new Date(entry.timestamp || entry.date)
        return (
          entryDate.getDate() === currentDay.getDate() &&
          entryDate.getMonth() === currentDay.getMonth() &&
          entryDate.getFullYear() === currentDay.getFullYear()
        )
      })

      const dayJournals = weeklyJournalData.filter((entry) => {
        const entryDate = new Date(entry.timestamp || entry.date)
        return (
          entryDate.getDate() === currentDay.getDate() &&
          entryDate.getMonth() === currentDay.getMonth() &&
          entryDate.getFullYear() === currentDay.getFullYear()
        )
      })

      // Calculate average mood for the day
      const avgMood =
        dayMoods.length > 0 ? dayMoods.reduce((sum, entry) => sum + (entry.score || 0), 0) / dayMoods.length : null

      dayBreakdown.push({
        date: currentDay.toISOString(),
        dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][currentDay.getDay()],
        moodEntries: dayMoods.length,
        journalEntries: dayJournals.length,
        averageMood: avgMood,
      })
    }

    // Create prompt for Gemini API
    const prompt = `Analyze the following weekly mood tracking and journal data to identify patterns, trends, and insights.
                   Focus on mood fluctuations throughout the week and potential triggers.
                   
                   Week: ${weekStartDate.toLocaleDateString()} to ${weekEndDate.toLocaleDateString()}
                   
                   Mood Data: ${JSON.stringify(weeklyMoodData)}
                   Journal Data: ${JSON.stringify(weeklyJournalData)}
                   Day-by-Day Breakdown: ${JSON.stringify(dayBreakdown)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. summary: A brief summary of the week's mood and journal patterns
                   2. patterns: Array of identified patterns for this week (at least 2-3 patterns if data permits)
                   3. insights: Key insights about the user's mood trends this week
                   4. moodTrend: Description of how the mood changed throughout the week
                   5. peakDay: The day with the highest mood score
                   6. lowDay: The day with the lowest mood score
                   
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

      // Add the day breakdown to the response
      analysisResult.dayBreakdown = dayBreakdown
    } catch (e) {
      console.error("Error parsing Gemini response as JSON:", e)

      // If parsing fails, create a basic analysis result
      analysisResult = {
        summary: "We analyzed your mood and journal data for the week.",
        patterns: ["No clear patterns could be identified with the available data."],
        insights: "Continue tracking your mood and journaling to get more detailed insights.",
        moodTrend: "Not enough data to determine a trend.",
        dayBreakdown: dayBreakdown,
      }
    }

    return NextResponse.json({ analysis: analysisResult })
  } catch (error) {
    console.error("Error analyzing weekly data:", error)
    return NextResponse.json({ error: "Failed to analyze weekly data" }, { status: 500 })
  }
}
