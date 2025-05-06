import { NextResponse } from "next/server"

// Get API key from environment variable or use a fallback for development
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyAjF5pPXz6SmdQ5QG8IgsIetsmPY1v0VPM"

export async function POST(request) {
  try {
    const { userData, analysisType } = await request.json()

    if (!userData || !analysisType) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    // If it's immediate mood analysis, we'll do some pre-processing to ensure accurate results
    if (analysisType === "immediate-mood") {
      // Perform our own analysis first to ensure logical results
      const score = calculateMoodScore(userData)

      // Create a more explicit prompt for mood analysis
      // UPDATED: Removed suggestions from the prompt
      const prompt = `You are an AI mood analyzer. Analyze these questionnaire responses and determine the user's mood.

User responses:
- Feeling (1-10 scale): ${userData.feeling}
- Mood word: ${userData.moodWord}
- Positive experience: ${userData.positiveExperience || "None provided"}
- Affecting factors: ${userData.affectingFactor || "None provided"}

I've calculated a preliminary mood score of ${score} on a scale of 1-5, where:
1 = Very negative/distressed
2 = Somewhat negative/sad
3 = Neutral
4 = Somewhat positive/good
5 = Very positive/excellent

Based on these responses, provide a JSON object with:
{
  "score": ${score},
  "emoji": "${getEmojiForScore(score)}",
  "insights": "Detailed analysis of their mood based on all factors"
}

IMPORTANT: The score MUST be ${score} based on my calculation. Do not change this value.
The emoji MUST match the score I provided.
Focus on providing insightful analysis only.

DO NOT include any text before or after the JSON.`

      // Call the Gemini API with our pre-calculated score
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

        // Ensure the score matches our calculation
        analysisResult.score = score
        analysisResult.emoji = getEmojiForScore(score)

        // UPDATED: Remove suggestions if they exist in the response
        if (analysisResult.suggestions) {
          delete analysisResult.suggestions
        }
      } catch (e) {
        console.error("Error parsing Gemini response as JSON:", e)
        // If parsing fails, create a basic analysis result with our calculated score
        analysisResult = {
          score: score,
          emoji: getEmojiForScore(score),
          insights: "Based on your responses, I've analyzed your mood.",
          // UPDATED: No suggestions field
        }
      }

      return NextResponse.json({ analysis: analysisResult })
    } else {
      // For other analysis types, use the original approach
      let prompt = ""

      switch (analysisType) {
        case "mood-patterns":
          // UPDATED: Removed suggestions from the prompt
          prompt = `Analyze the following mood tracking data and identify patterns, trends, and insights. 
                   Focus on mood fluctuations and potential triggers.
                   Data: ${JSON.stringify(userData)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. patterns: Array of identified patterns
                   2. insights: Key insights about the user's mood trends
                   3. summary: A brief summary of the analysis`
          break

        case "activity-impact":
          // UPDATED: Removed suggestions from the prompt
          prompt = `Analyze how different activities impact the user's mood and mental wellbeing.
                   Identify which activities have positive or negative correlations with mood scores.
                   Data: ${JSON.stringify(userData)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. positiveActivities: Activities with positive impact on mood
                   2. negativeActivities: Activities with negative impact on mood
                   3. neutralActivities: Activities with no clear impact
                   4. summary: A brief summary of the findings`
          break

        case "progress-tracking":
          // UPDATED: Removed suggestions from the prompt
          prompt = `Analyze the user's progress over time based on their mental wellbeing metrics.
                   Identify improvements, setbacks, and overall trajectory.
                   Data: ${JSON.stringify(userData)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. progressMetrics: Quantified progress on key metrics
                   2. improvements: Areas showing positive change
                   3. challenges: Areas needing attention
                   4. trajectory: Overall direction of progress
                   5. summary: A brief summary of the user's journey`
          break

        default:
          // UPDATED: Removed suggestions from the prompt
          prompt = `Analyze the following mental wellbeing data and provide insights.
                   Data: ${JSON.stringify(userData)}
                   
                   Return the analysis as a JSON object with these properties:
                   1. insights: Key insights from the data
                   2. summary: A brief summary of the analysis`
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

        // UPDATED: Remove suggestions if they exist in the response
        if (analysisResult.suggestions || analysisResult.recommendations) {
          delete analysisResult.suggestions
          delete analysisResult.recommendations
        }
      } catch (e) {
        console.error("Error parsing Gemini response as JSON:", e)
        // If parsing fails, return the text as is
        analysisResult = { rawAnalysis: text }
      }

      return NextResponse.json({ analysis: analysisResult })
    }
  } catch (error) {
    console.error("Error analyzing data:", error)
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 })
  }
}

// Function to calculate mood score based on user responses
function calculateMoodScore(userData) {
  let score = 3 // Start with neutral

  // Factor 1: Feeling score (1-10)
  const feelingScore = Number.parseInt(userData.feeling, 10)
  if (!isNaN(feelingScore)) {
    if (feelingScore <= 3) {
      score -= 1.5 // Very negative feeling
    } else if (feelingScore <= 5) {
      score -= 0.5 // Somewhat negative feeling
    } else if (feelingScore >= 8) {
      score += 0.5 // Positive feeling
    }
  }

  // Factor 2: Mood word (most important factor)
  const moodWord = (userData.moodWord || "").toLowerCase()
  const veryNegativeWords = [
    "very sad",
    "depressed",
    "devastated",
    "miserable",
    "hopeless",
    "overwhelmed",
    "suicidal",
    "terrible",
  ]
  const negativeWords = ["sad", "unhappy", "down", "blue", "upset", "anxious", "worried", "stressed"]
  const positiveWords = ["happy", "good", "great", "excellent", "joyful", "content", "peaceful", "relaxed"]

  let foundNegativeWord = false

  // Check for very negative words (strongest impact)
  for (const word of veryNegativeWords) {
    if (moodWord.includes(word)) {
      score -= 2 // Strong negative impact
      foundNegativeWord = true
      break
    }
  }

  // If no very negative word was found, check for regular negative words
  if (!foundNegativeWord) {
    for (const word of negativeWords) {
      if (moodWord.includes(word)) {
        score -= 1 // Moderate negative impact
        foundNegativeWord = true
        break
      }
    }
  }

  // If no negative word was found, check for positive words
  if (!foundNegativeWord) {
    for (const word of positiveWords) {
      if (moodWord.includes(word)) {
        score += 1 // Positive impact
        break
      }
    }
  }

  // Factor 3: Affecting factors
  const affectingFactors = (userData.affectingFactor || "").toLowerCase()
  const negativeFactors = [
    "stress",
    "anxiety",
    "depression",
    "loss",
    "death",
    "breakup",
    "divorce",
    "fired",
    "unemployment",
    "debt",
    "illness",
    "pain",
    "conflict",
    "argument",
    "fight",
    "cheating",
    "betrayal",
    "trauma",
  ]

  let negativeFactorCount = 0
  for (const factor of negativeFactors) {
    if (affectingFactors.includes(factor)) {
      negativeFactorCount++
    }
  }

  // Adjust score based on number of negative factors mentioned
  if (negativeFactorCount >= 3) {
    score -= 1 // Multiple serious issues
  } else if (negativeFactorCount > 0) {
    score -= 0.5 // Some issues
  }

  // Ensure score is between 1-5
  score = Math.max(1, Math.min(5, Math.round(score)))

  return score
}

// Function to get emoji text based on score
function getEmojiForScore(score) {
  switch (score) {
    case 1:
      return "sad"
    case 2:
      return "slightly_sad"
    case 3:
      return "neutral"
    case 4:
      return "slightly_happy"
    case 5:
      return "happy"
    default:
      return "neutral"
  }
}
