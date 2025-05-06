"use client"

import { useState, useEffect } from "react"
import styles from "../styles/insights.module.css"

export default function WeeklyAnalysis({ moodData, journalData }) {
  const [weeklyInsights, setWeeklyInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekStart())
  const [availableWeeks, setAvailableWeeks] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState(null)
  const [weeklySuggestions, setWeeklySuggestions] = useState([])

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Generate list of available weeks from data
    if (moodData.length > 0 || journalData.length > 0) {
      generateAvailableWeeks()
    }
  }, [moodData, journalData])

  useEffect(() => {
    if (selectedWeek && (moodData.length > 0 || journalData.length > 0)) {
      getWeeklyInsights()
    }
  }, [selectedWeek])

  useEffect(() => {
    // Generate support suggestions based on weekly insights
    if (weeklyInsights) {
      generateWeeklySuggestions()
    }
  }, [weeklyInsights])

  function getCurrentWeekStart() {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = now.getDate() - dayOfWeek
    const weekStart = new Date(now)
    weekStart.setDate(diff)
    weekStart.setHours(0, 0, 0, 0)
    return weekStart
  }

  function generateAvailableWeeks() {
    // Combine timestamps from both data sources
    const allDates = [
      ...moodData.map((entry) => new Date(entry.timestamp || entry.date)),
      ...journalData.map((entry) => new Date(entry.timestamp || entry.date)),
    ].filter((date) => !isNaN(date.getTime())) // Filter out invalid dates

    if (allDates.length === 0) return []

    // Sort dates from oldest to newest
    allDates.sort((a, b) => a - b)

    const weeks = []
    const oldestDate = allDates[0]
    const newestDate = allDates[allDates.length - 1]

    // Start from the beginning of the week of the oldest entry
    const currentWeekStart = new Date(oldestDate)
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay())
    currentWeekStart.setHours(0, 0, 0, 0)

    // Generate all weeks until the newest entry
    while (currentWeekStart <= newestDate) {
      weeks.push(new Date(currentWeekStart))
      currentWeekStart.setDate(currentWeekStart.getDate() + 7)
    }

    setAvailableWeeks(weeks)

    // Set the most recent week as default
    if (weeks.length > 0) {
      setSelectedWeek(weeks[weeks.length - 1])
    }
  }

  function formatWeekRange(weekStart) {
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  const getWeeklyInsights = async () => {
    setIsLoading(true)
    setError(null)

    // Calculate week end date
    const weekEnd = new Date(selectedWeek)
    weekEnd.setDate(selectedWeek.getDate() + 7)

    try {
      const response = await fetch("/api/insights/weekly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodData,
          journalData,
          weekStart: selectedWeek.toISOString(),
          weekEnd: weekEnd.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch weekly insights")
      }

      const data = await response.json()
      setWeeklyInsights(data.analysis)
    } catch (err) {
      console.error("Error fetching weekly insights:", err)
      setError("Failed to analyze weekly data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateWeeklySuggestions = () => {
    const suggestions = []

    if (!weeklyInsights) return []

    // Get the day breakdown to analyze the week
    const dayBreakdown = weeklyInsights.dayBreakdown || []

    // Find days with mood entries to analyze patterns
    const daysWithMoods = dayBreakdown.filter((day) => day.averageMood !== null)

    // Identify the peak and low days if available from the API response
    const peakDay = weeklyInsights.peakDay
    const lowDay = weeklyInsights.lowDay

    // Add specific day-based suggestions
    if (peakDay && typeof peakDay === "string") {
      suggestions.push({
        title: "Peak Day",
        content: `Best day: ${peakDay}`,
        type: "peak-day",
      })
    }

    if (lowDay && typeof lowDay === "string") {
      suggestions.push({
        title: "Challenge Day",
        content: `Challenging: ${lowDay}`,
        type: "low-day",
      })
    }

    // Look for patterns in the week
    if (weeklyInsights.patterns && Array.isArray(weeklyInsights.patterns) && weeklyInsights.patterns.length > 0) {
      const significantPattern = weeklyInsights.patterns[0]
      suggestions.push({
        title: "Weekly Pattern",
        content: `${typeof significantPattern === "string" ? significantPattern : "Mood fluctuations"}`,
        type: "pattern",
      })
    }

    // Add mood trend suggestion
    if (weeklyInsights.moodTrend && typeof weeklyInsights.moodTrend === "string") {
      suggestions.push({
        title: "Mood Trajectory",
        content: `${weeklyInsights.moodTrend}`,
        type: "trend",
      })
    }

    // Add a general suggestion if we don't have enough specific ones
    if (suggestions.length < 2) {
      // Calculate average mood for the week to determine general suggestion
      const moodValues = daysWithMoods.map((day) => day.averageMood)
      const avgWeeklyMood =
        moodValues.length > 0 ? moodValues.reduce((sum, mood) => sum + mood, 0) / moodValues.length : null

      if (avgWeeklyMood !== null) {
        if (avgWeeklyMood < 2.5) {
          suggestions.push({
            title: "Self-Compassion",
            content: "Focus on self-care. This is temporary.",
            type: "general-low",
          })
        } else if (avgWeeklyMood >= 3.5) {
          suggestions.push({
            title: "Positive Momentum",
            content: "Continue what worked well.",
            type: "general-high",
          })
        } else {
          suggestions.push({
            title: "Balance & Awareness",
            content: "Maintain what keeps you balanced.",
            type: "general-neutral",
          })
        }
      }
    }

    setWeeklySuggestions(suggestions)
  }

  function getDayData(dayIndex) {
    // Get the date for this day of the week
    const dayDate = new Date(selectedWeek)
    dayDate.setDate(selectedWeek.getDate() + dayIndex)

    // Set time to beginning of day
    const startOfDay = new Date(dayDate)
    startOfDay.setHours(0, 0, 0, 0)

    // Set time to end of day
    const endOfDay = new Date(dayDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Find mood entries for this day
    const dayMoods = moodData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= startOfDay && entryDate <= endOfDay
    })

    // Find journal entries for this day
    const dayJournals = journalData.filter((entry) => {
      const entryDate = new Date(entry.timestamp || entry.date)
      return entryDate >= startOfDay && entryDate <= endOfDay
    })

    // Calculate average mood score for the day
    const avgMood =
      dayMoods.length > 0 ? dayMoods.reduce((sum, entry) => sum + (entry.score || 0), 0) / dayMoods.length : null

    return {
      date: dayDate,
      moodEntries: dayMoods,
      journalEntries: dayJournals,
      averageMood: avgMood,
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Analyzing your weekly data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.errorMessage} ${darkMode ? styles.darkErrorMessage : ""}`}>
        <p>{error}</p>
        <button
          onClick={getWeeklyInsights}
          className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""} mt-4`}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className={styles.weeklyContainer}>
      <div className={`${styles.weekSelector} ${darkMode ? styles.darkWeekSelector : ""}`}>
        <h2 className={styles.sectionTitle}>Weekly Mood Analysis</h2>

        <div className={styles.weekPickerContainer}>
          <label htmlFor="week-select">Select Week:</label>
          <select
            id="week-select"
            className={`${styles.weekSelect} ${darkMode ? styles.darkWeekSelect : ""}`}
            value={selectedWeek ? selectedWeek.toISOString() : ""}
            onChange={(e) => setSelectedWeek(new Date(e.target.value))}
          >
            {availableWeeks.map((week, index) => (
              <option key={index} value={week.toISOString()}>
                {formatWeekRange(week)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Weekly Calendar View */}
      <div className={`${styles.weekCalendar} ${darkMode ? styles.darkWeekCalendar : ""}`}>
        {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => {
          const dayData = getDayData(index)
          const hasMood = dayData.moodEntries.length > 0
          const hasJournal = dayData.journalEntries.length > 0

          return (
            <div
              key={index}
              className={`${styles.dayCard} ${darkMode ? styles.darkDayCard : ""} ${
                !hasMood && !hasJournal ? styles.emptyDay : ""
              }`}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayName}>{day}</span>
                <span className={styles.dayDate}>
                  {dayData.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className={styles.dayContent}>
                {hasMood && (
                  <div className={styles.moodIndicator}>
                    <span className={styles.moodLabel}>Mood:</span>
                    <span className={styles.moodScore}>
                      {dayData.averageMood ? dayData.averageMood.toFixed(1) : ""}/5
                    </span>
                    {dayData.moodEntries.length > 1 && (
                      <span className={styles.entryCount}>({dayData.moodEntries.length})</span>
                    )}
                  </div>
                )}

                {hasJournal && (
                  <div className={styles.journalIndicator}>
                    <span className={styles.journalIcon}>📝</span>
                    <span className={styles.journalCount}>
                      {dayData.journalEntries.length} journal{" "}
                      {dayData.journalEntries.length === 1 ? "entry" : "entries"}
                    </span>
                  </div>
                )}

                {!hasMood && !hasJournal && <div className={styles.noData}>No entries</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly Insights */}
      {weeklyInsights && (
        <div className={`${styles.weeklyInsights} ${darkMode ? styles.darkWeeklyInsights : ""}`}>
          <h3 className={styles.insightTitle}>Weekly Insights</h3>

          {weeklyInsights.summary && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Summary</h4>
              <p>{weeklyInsights.summary}</p>
            </div>
          )}

          {/* Support Suggestions Section */}
          {weeklySuggestions.length > 0 && (
            <div className={`${styles.insightCard} ${styles.supportCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Suggestions & Support</h4>
              <div className={styles.supportGrid}>
                {weeklySuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`${styles.supportItem} ${darkMode ? styles.darkSupportItem : ""}`}
                    data-type={suggestion.type || "general"}
                  >
                    <h5>{suggestion.title}</h5>
                    <p>{suggestion.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {weeklyInsights.patterns && Array.isArray(weeklyInsights.patterns) && weeklyInsights.patterns.length > 0 && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Patterns This Week</h4>
              <ul className={styles.patternsList}>
                {weeklyInsights.patterns.map((pattern, index) => (
                  <li key={index}>
                    {typeof pattern === "object" ? pattern.description || JSON.stringify(pattern) : pattern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {weeklyInsights.insights && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Key Insights</h4>
              <p>{weeklyInsights.insights}</p>
            </div>
          )}

          {weeklyInsights.moodTrend && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Mood Trend</h4>
              <p>{weeklyInsights.moodTrend}</p>
            </div>
          )}

          {weeklyInsights.peakDay && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Peak Day</h4>
              <p>
                {typeof weeklyInsights.peakDay === "object"
                  ? JSON.stringify(weeklyInsights.peakDay)
                  : weeklyInsights.peakDay}
              </p>
            </div>
          )}

          {weeklyInsights.lowDay && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Low Day</h4>
              <p>
                {typeof weeklyInsights.lowDay === "object"
                  ? JSON.stringify(weeklyInsights.lowDay)
                  : weeklyInsights.lowDay}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
  