"use client"

import { useState, useEffect } from "react"
import styles from "../styles/insights.module.css"

export default function MonthlyAnalysis({ moodData, journalData }) {
  const [monthlyInsights, setMonthlyInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthStart())
  const [availableMonths, setAvailableMonths] = useState([])
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState(null)
  const [monthlySuggestions, setMonthlySuggestions] = useState([])

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Generate list of available months from data
    if (moodData.length > 0 || journalData.length > 0) {
      generateAvailableMonths()
    }
  }, [moodData, journalData])

  useEffect(() => {
    if (selectedMonth && (moodData.length > 0 || journalData.length > 0)) {
      getMonthlyInsights()
    }
  }, [selectedMonth])

  useEffect(() => {
    // Generate support suggestions based on monthly insights
    if (monthlyInsights) {
      generateMonthlySuggestions()
    }
  }, [monthlyInsights])

  function getCurrentMonthStart() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  }

  function generateAvailableMonths() {
    // Combine timestamps from both data sources
    const allDates = [
      ...moodData.map((entry) => new Date(entry.timestamp || entry.date)),
      ...journalData.map((entry) => new Date(entry.timestamp || entry.date)),
    ].filter((date) => !isNaN(date.getTime())) // Filter out invalid dates

    if (allDates.length === 0) return []

    // Sort dates from oldest to newest
    allDates.sort((a, b) => a - b)

    const months = []
    const oldestDate = allDates[0]
    const newestDate = allDates[allDates.length - 1]

    // Start from the beginning of the month of the oldest entry
    const currentMonthStart = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1)

    // Generate all months until the newest entry
    while (currentMonthStart <= newestDate) {
      months.push(new Date(currentMonthStart))
      currentMonthStart.setMonth(currentMonthStart.getMonth() + 1)
    }

    setAvailableMonths(months)

    // Set the most recent month as default
    if (months.length > 0) {
      setSelectedMonth(months[months.length - 1])
    }
  }

  function formatMonth(date) {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  const getMonthlyInsights = async () => {
    setIsLoading(true)
    setError(null)

    // Calculate month end date
    const monthEnd = new Date(selectedMonth)
    monthEnd.setMonth(selectedMonth.getMonth() + 1)

    try {
      const response = await fetch("/api/insights/monthly", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodData,
          journalData,
          monthStart: selectedMonth.toISOString(),
          monthEnd: monthEnd.toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch monthly insights")
      }

      const data = await response.json()
      setMonthlyInsights(data.analysis)
    } catch (err) {
      console.error("Error fetching monthly insights:", err)
      setError("Failed to analyze monthly data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateMonthlySuggestions = () => {
    const suggestions = []

    if (!monthlyInsights) return []

    // Use trajectory data for personalized suggestions
    if (monthlyInsights.trajectory && typeof monthlyInsights.trajectory === "string") {
      suggestions.push({
        title: "Monthly Direction",
        content: `${monthlyInsights.trajectory}. Plan next month accordingly.`,
        type: "trajectory",
      })
    }

    // Use progress metrics for personalized suggestions
    if (
      monthlyInsights.progressMetrics &&
      typeof monthlyInsights.progressMetrics === "string" &&
      monthlyInsights.progressMetrics !== "Not enough data to assess progress."
    ) {
      suggestions.push({
        title: "Progress Insight",
        content: `${monthlyInsights.progressMetrics}`,
        type: "progress",
      })
    }

    // Use peak and low weeks for targeted suggestions
    if (monthlyInsights.peakWeek && typeof monthlyInsights.peakWeek === "string") {
      suggestions.push({
        title: "Peak Period",
        content: `Best week: ${monthlyInsights.peakWeek}`,
        type: "peak-week",
      })
    }

    if (monthlyInsights.lowWeek && typeof monthlyInsights.lowWeek === "string") {
      suggestions.push({
        title: "Challenge Period",
        content: `Challenging: ${monthlyInsights.lowWeek}`,
        type: "low-week",
      })
    }

    // Use patterns for personalized suggestions
    if (monthlyInsights.patterns && Array.isArray(monthlyInsights.patterns) && monthlyInsights.patterns.length > 0) {
      const significantPattern = monthlyInsights.patterns[0]
      suggestions.push({
        title: "Monthly Pattern",
        content: `${typeof significantPattern === "string" ? significantPattern : "Mood fluctuations"}`,
        type: "pattern",
      })
    }

    // Add a general suggestion based on monthly stats
    const monthStats = monthlyInsights.monthlyStats || {}
    if (monthStats.averageMood !== null && monthStats.averageMood !== undefined) {
      if (monthStats.averageMood < 2.5) {
        suggestions.push({
          title: "Monthly Reflection",
          content: "Focus on self-care for next month.",
          type: "general-low",
        })
      } else if (monthStats.averageMood >= 3.5) {
        suggestions.push({
          title: "Sustaining Wellbeing",
          content: "Continue what worked well.",
          type: "general-high",
        })
      } else {
        suggestions.push({
          title: "Balance & Growth",
          content: "Maintain balance, try new practices.",
          type: "general-neutral",
        })
      }
    }

    // Ensure we have at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        title: "Continue Tracking",
        content: "Keep tracking for better insights.",
        type: "general",
      })
    }

    setMonthlySuggestions(suggestions)
  }

  // Calculate weekly averages for the month
  function getWeeklyAverages() {
    if (!monthlyInsights || !monthlyInsights.weeklyBreakdown) {
      return []
    }

    return monthlyInsights.weeklyBreakdown.map((week) => {
      return {
        weekStart: new Date(week.weekStart),
        weekLabel: `${new Date(week.weekStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${new Date(week.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        average: week.averageMood,
        entryCount: week.moodEntries,
      }
    })
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Analyzing your monthly data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.errorMessage} ${darkMode ? styles.darkErrorMessage : ""}`}>
        <p>{error}</p>
        <button
          onClick={getMonthlyInsights}
          className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""} mt-4`}
        >
          Try Again
        </button>
      </div>
    )
  }

  const weeklyAverages = getWeeklyAverages()

  return (
    <div className={styles.monthlyContainer}>
      <div className={`${styles.monthSelector} ${darkMode ? styles.darkMonthSelector : ""}`}>
        <h2 className={styles.sectionTitle}>Monthly Mood Analysis</h2>

        <div className={styles.monthPickerContainer}>
          <label htmlFor="month-select">Select Month:</label>
          <select
            id="month-select"
            className={`${styles.monthSelect} ${darkMode ? styles.darkMonthSelect : ""}`}
            value={selectedMonth ? selectedMonth.toISOString() : ""}
            onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          >
            {availableMonths.map((month, index) => (
              <option key={index} value={month.toISOString()}>
                {formatMonth(month)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Overview */}
      <div className={`${styles.monthOverview} ${darkMode ? styles.darkMonthOverview : ""}`}>
        <h3>Overview for {formatMonth(selectedMonth)}</h3>

        {/* Monthly Stats */}
        {monthlyInsights && monthlyInsights.monthlyStats && (
          <div className={styles.statsGrid}>
            <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
              <span className={styles.statNumber}>{monthlyInsights.monthlyStats.totalMoodEntries}</span>
              <span className={styles.statLabel}>Mood Entries</span>
            </div>
            <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
              <span className={styles.statNumber}>{monthlyInsights.monthlyStats.totalJournalEntries}</span>
              <span className={styles.statLabel}>Journal Entries</span>
            </div>
            {monthlyInsights.monthlyStats.averageMood && (
              <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
                <span className={styles.statNumber}>{monthlyInsights.monthlyStats.averageMood.toFixed(1)}</span>
                <span className={styles.statLabel}>Avg. Mood</span>
              </div>
            )}
            {monthlyInsights.monthlyStats.highestMood && (
              <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
                <span className={styles.statNumber}>{monthlyInsights.monthlyStats.highestMood}</span>
                <span className={styles.statLabel}>Highest Mood</span>
              </div>
            )}
          </div>
        )}

        {/* Weekly Averages Chart */}
        {weeklyAverages.length > 0 && (
          <div className={`${styles.weeklyChart} ${darkMode ? styles.darkWeeklyChart : ""}`}>
            <h4>Weekly Mood Averages</h4>
            <div className={styles.chartContainer}>
              {weeklyAverages.map((week, index) => (
                <div key={index} className={styles.chartWeek}>
                  <div className={styles.chartBar}>
                    <div
                      className={styles.chartBarFill}
                      style={{
                        height: week.average ? `${(week.average / 5) * 100}%` : "0%",
                        backgroundColor: getMoodColor(week.average),
                      }}
                    ></div>
                  </div>
                  <div className={styles.chartLabel}>{week.weekLabel}</div>
                  <div className={styles.chartValue}>{week.average ? week.average.toFixed(1) : ""}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Monthly Insights */}
      {monthlyInsights && (
        <div className={`${styles.monthlyInsights} ${darkMode ? styles.darkMonthlyInsights : ""}`}>
          <h3 className={styles.insightTitle}>Monthly Insights</h3>

          {monthlyInsights.summary && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Summary</h4>
              <p>{monthlyInsights.summary}</p>
            </div>
          )}

          {/* Support Suggestions Section */}
          {monthlySuggestions.length > 0 && (
            <div className={`${styles.insightCard} ${styles.supportCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Suggestions & Support</h4>
              <div className={styles.supportGrid}>
                {monthlySuggestions.map((suggestion, index) => (
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

          {monthlyInsights.patterns &&
            Array.isArray(monthlyInsights.patterns) &&
            monthlyInsights.patterns.length > 0 && (
              <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
                <h4>Monthly Patterns</h4>
                <ul className={styles.patternsList}>
                  {monthlyInsights.patterns.map((pattern, index) => (
                    <li key={index}>
                      {typeof pattern === "object" ? pattern.description || JSON.stringify(pattern) : pattern}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {monthlyInsights.insights && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Key Insights</h4>
              <p>{monthlyInsights.insights}</p>
            </div>
          )}

          {monthlyInsights.progressMetrics && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Progress Metrics</h4>
              <p>{monthlyInsights.progressMetrics}</p>
            </div>
          )}

          {monthlyInsights.trajectory && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Overall Trajectory</h4>
              <p>{monthlyInsights.trajectory}</p>
            </div>
          )}

          {monthlyInsights.peakWeek && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Peak Week</h4>
              <p>
                {typeof monthlyInsights.peakWeek === "object"
                  ? JSON.stringify(monthlyInsights.peakWeek)
                  : monthlyInsights.peakWeek}
              </p>
            </div>
          )}

          {monthlyInsights.lowWeek && (
            <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
              <h4>Low Week</h4>
              <p>
                {typeof monthlyInsights.lowWeek === "object"
                  ? JSON.stringify(monthlyInsights.lowWeek)
                  : monthlyInsights.lowWeek}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Helper function to get color based on mood score
function getMoodColor(score) {
  if (!score) return "#cccccc"

  if (score >= 4.5) return "#4ade80" // Green for very positive
  if (score >= 3.5) return "#60a5fa" // Blue for positive
  if (score >= 2.5) return "#facc15" // Yellow for neutral
  if (score >= 1.5) return "#fb923c" // Orange for negative
  return "#f87171" // Red for very negative
}
