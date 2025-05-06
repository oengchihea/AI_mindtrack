import { NextResponse } from "next/server"

// This is a mock API endpoint that would normally fetch data from your database
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const timeRange = searchParams.get("timeRange") || "30days"

  // In a real application, you would fetch this data from your database
  // based on the authenticated user and the requested time range
  const mockUserData = generateMockData(timeRange)

  return NextResponse.json(mockUserData)
}

function generateMockData(timeRange) {
  // Calculate the number of days to generate data for
  let days = 30
  switch (timeRange) {
    case "7days":
      days = 7
      break
    case "30days":
      days = 30
      break
    case "90days":
      days = 90
      break
    case "all":
      days = 180 // For demo purposes, "all" is 6 months
      break
  }

  const today = new Date()
  const data = []

  // Activities that might impact mood
  const activities = [
    "meditation",
    "exercise",
    "reading",
    "socializing",
    "work",
    "studying",
    "creative_activity",
    "outdoor_time",
    "screen_time",
    "poor_sleep",
    "healthy_eating",
    "journaling",
  ]

  // Generate data for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Generate random mood score (1-10)
    const moodScore = Math.floor(Math.random() * 10) + 1

    // Generate random anxiety level (1-10)
    const anxietyLevel = Math.floor(Math.random() * 10) + 1

    // Generate random energy level (1-10)
    const energyLevel = Math.floor(Math.random() * 10) + 1

    // Generate random sleep hours (4-10)
    const sleepHours = Math.floor(Math.random() * 6) + 4

    // Select 2-4 random activities for the day
    const dailyActivities = []
    const numActivities = Math.floor(Math.random() * 3) + 2

    for (let j = 0; j < numActivities; j++) {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      if (!dailyActivities.includes(randomActivity)) {
        dailyActivities.push(randomActivity)
      }
    }

    // Add some patterns to make the data more realistic
    let adjustedMoodScore = moodScore

    // Exercise tends to improve mood
    if (dailyActivities.includes("exercise")) {
      adjustedMoodScore = Math.min(10, adjustedMoodScore + 1)
    }

    // Poor sleep tends to decrease mood
    if (dailyActivities.includes("poor_sleep")) {
      adjustedMoodScore = Math.max(1, adjustedMoodScore - 1)
    }

    // Add the day's data
    data.push({
      date: date.toISOString().split("T")[0],
      mood_score: adjustedMoodScore,
      anxiety_level: anxietyLevel,
      energy_level: energyLevel,
      sleep_hours: sleepHours,
      activities: dailyActivities,
      notes: generateRandomNote(adjustedMoodScore, dailyActivities),
    })
  }

  return data
}

function generateRandomNote(moodScore, activities) {
  // Generate a realistic note based on mood and activities
  if (moodScore >= 8) {
    if (activities.includes("exercise")) {
      return "Felt great after my workout today. Energy levels were high all day."
    } else if (activities.includes("socializing")) {
      return "Had a wonderful time with friends. Feeling connected and happy."
    } else {
      return "Today was a really good day overall. Feeling positive."
    }
  } else if (moodScore >= 5) {
    if (activities.includes("work")) {
      return "Busy workday but managed to stay on top of things. Feeling okay."
    } else {
      return "Average day, nothing special but no complaints either."
    }
  } else {
    if (activities.includes("poor_sleep")) {
      return "Didn't sleep well last night and it affected my whole day. Feeling tired."
    } else if (activities.includes("work")) {
      return "Stressful day at work. Feeling drained and a bit low."
    } else {
      return "Not feeling my best today. Hope tomorrow is better."
    }
  }
}

