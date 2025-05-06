import { NextResponse } from "next/server"

// Get API key from environment variable or use a fallback for development
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM"

export async function POST(request) {
  try {
    const { moodData, journalData, monthStart, monthEnd } = await request.json()

    if (!moodData && !journalData) {
      return NextResponse.json({ error: "Missing mood or journal data" }, { status: 400 })
    }

    // Filter data for the selected month
    const monthStartDate = new Date(monthStart)
    const monthEndDate = new Date(monthEnd)

    const monthlyMoodData = moodData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= monthStartDate && entryDate < monthEndDate
    })

    const monthlyJournalData = journalData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= monthStartDate && entryDate < monthEndDate
    })

    // Create weekly breakdown for the month
    const weeklyBreakdown = []

    // Get the first Sunday of the month (or the month start if it's a Sunday)
    let currentWeekStart = new Date(monthStartDate)
    if (currentWeekStart.getDay() !== 0) {
      // If not Sunday
      // Go back to the previous Sunday
      currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())
    }

    // Generate weekly data until we reach the end of the month
    while (currentWeekStart < monthEndDate) {
      const weekEnd = new Date(currentWeekStart)
      weekEnd.setDate(currentWeekStart.getDate() + 7)

      // Get entries for this week
      const weekMoods = monthlyMoodData.filter((entry) => {
        const entryDate = new Date(entry.timestamp || entry.date)
        return entryDate >= currentWeekStart && entryDate < weekEnd
      })

      const weekJournals = monthlyJournalData.filter((entry) => {
        const entryDate = new Date(entry.timestamp || entry.date)
        return entryDate >= currentWeekStart && entryDate < weekEnd
      })

      // Calculate average mood for the week
      const avgMood =
        weekMoods.length > 0 ? weekMoods.reduce((sum, entry) => sum + (entry.score || 0), 0) / weekMoods.length : null

      weeklyBreakdown.push({
        weekStart: currentWeekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        moodEntries: weekMoods.length,
        journalEntries: weekJournals.length,
        averageMood: avgMood,
      })

      // Move to next week
      currentWeekStart = new Date(weekEnd)
    }

    // Calculate overall monthly statistics
    const monthlyStats = {
      totalMoodEntries: monthlyMoodData.length,
      totalJournalEntries: monthlyJournalData.length,
      averageMood:
        monthlyMoodData.length > 0
          ? monthlyMoodData.reduce((sum, entry) => sum + (entry.score || 0), 0) / monthlyMoodData.length
          : null,
      highestMood: monthlyMoodData.length > 0 ? Math.max(...monthlyMoodData.map((entry) => entry.score || 0)) : null,
      lowestMood: monthlyMoodData.length > 0 ? Math.min(...monthlyMoodData.map((entry) => entry.score || 0)) : null,
    }

    // Create prompt for Gemini API
    const prompt = `Analyze the following monthly mood tracking and journal data to identify patterns, trends, and insights.
                   Focus on longer-term mood fluctuations and recurring themes.
                   
                   Month: ${monthStartDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                   
                   Mood Data: ${JSON.stringify(monthlyMoodData)}
                   Journal Data: ${JSON.stringify(monthlyJournalData)}
                   Weekly Breakdown: ${JSON.stringify(weeklyBreakdown)}
                   Monthly Statistics: ${JSON.stringify(monthlyStats)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. summary: A brief summary of the month's mood and journal patterns
                   2. patterns: Array of identified patterns for this month (at least 2-3 patterns if data permits)
                   3. insights: Key insights about the user's mood trends this month
                   4. progressMetrics: Assessment of progress compared to previous periods
                   5. trajectory: Overall direction of mood and wellbeing
                   6. peakWeek: The week with the highest average mood
                   7. lowWeek: The week with the lowest average mood
                   
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

      // Add the weekly breakdown and monthly stats to the response
      analysisResult.weeklyBreakdown = weeklyBreakdown
      analysisResult.monthlyStats = monthlyStats
    } catch (e) {
      console.error("Error parsing Gemini response as JSON:", e)

      // If parsing fails, create a basic analysis result
      analysisResult = {
        summary: "We analyzed your mood and journal data for the month.",
        patterns: ["No clear patterns could be identified with the available data."],
        insights: "Continue tracking your mood and journaling to get more detailed insights.",
        progressMetrics: "Not enough data to assess progress.",
        trajectory: "More data needed to determine trajectory.",
        weeklyBreakdown: weeklyBreakdown,
        monthlyStats: monthlyStats,
      }
    }

    return NextResponse.json({ analysis: analysisResult })
  } catch (error) {
    console.error("Error analyzing monthly data:", error)
    return NextResponse.json({ error: "Failed to analyze monthly data" }, { status: 500 })
  }
}
