"use client"

import { useState, useEffect } from "react"
import styles from "../styles/insights.module.css"

export default function AnalysisDashboard({ moodData, journalData }) {
  const [insights, setInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState(null)
  const [supportSuggestions, setSupportSuggestions] = useState([])

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Get insights if we have data
    if ((moodData && moodData.length > 0) || (journalData && journalData.length > 0)) {
      getInsights()
    }
  }, [moodData, journalData])

  useEffect(() => {
    // Generate support suggestions based on insights
    if (insights) {
      generateSupportSuggestions()
    }
  }, [insights])

  const getInsights = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/insights/overview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          moodData,
          journalData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch insights")
      }

      const data = await response.json()
      setInsights(data.analysis)
    } catch (err) {
      console.error("Error fetching insights:", err)
      setError("Failed to analyze data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const generateSupportSuggestions = () => {
    const suggestions = []

    // Use actual insights data for personalized suggestions
    if (!insights) return []

    // Extract mood words for personalized suggestions
    const moodWords = moodData
      .map((entry) => entry.moodWord || entry.mood)
      .filter((word) => word && typeof word === "string")

    const commonMoodWords = findMostCommonItems(moodWords, 3)

    // Check mood patterns
    if (insights.patterns && Array.isArray(insights.patterns)) {
      // Look for specific patterns in the data
      const moodPatterns = insights.patterns.filter(
        (pattern) =>
          typeof pattern === "string" &&
          (pattern.toLowerCase().includes("mood") || pattern.toLowerCase().includes("emotion")),
      )

      if (moodPatterns.length > 0) {
        suggestions.push({
          title: "Pattern Recognition",
          content: `Pattern: "${moodPatterns[0]}". Identify triggers.`,
          type: "pattern",
        })
      }
    }

    // Use journal themes for personalized suggestions
    if (
      insights.journalThemes &&
      typeof insights.journalThemes === "string" &&
      insights.journalThemes !== "More journal entries needed to identify themes."
    ) {
      suggestions.push({
        title: "Journal Reflection",
        content: `Themes: "${insights.journalThemes}". Explore what matters to you.`,
        type: "journal",
      })
    }

    // Add correlation-based suggestion if available
    if (
      insights.correlations &&
      typeof insights.correlations === "string" &&
      insights.correlations !== "More data needed to identify correlations."
    ) {
      suggestions.push({
        title: "Insight Connection",
        content: `Connection: "${insights.correlations}". Note this pattern.`,
        type: "correlation",
      })
    }

    // Add mood-specific suggestions based on actual mood data
    const avgMood = insights.stats?.averageMood || 0

    if (avgMood < 2.5) {
      suggestions.push({
        title: "Mood Support",
        content: `Low mood${commonMoodWords.length > 0 ? `: "${commonMoodWords.join(", ")}"` : ""}. Try mood-boosting activities.`,
        type: "mood-low",
      })

      // Add a specific coping strategy for low mood
      suggestions.push({
        title: "Coping Strategy",
        content: "Try 5-4-3-2-1 grounding: see 5, touch 4, hear 3, smell 2, taste 1.",
        type: "coping-low",
      })
    } else if (avgMood >= 3.5) {
      suggestions.push({
        title: "Maintaining Positivity",
        content: `Positive trend${commonMoodWords.length > 0 ? `: "${commonMoodWords.join(", ")}"` : ""}. Note what works.`,
        type: "mood-high",
      })

      // Add a specific strategy for maintaining high mood
      suggestions.push({
        title: "Sustaining Practice",
        content: "Create a 'joy inventory' of what brings positive feelings.",
        type: "coping-high",
      })
    } else {
      suggestions.push({
        title: "Balance & Stability",
        content: `Balanced mood${commonMoodWords.length > 0 ? `: "${commonMoodWords.join(", ")}"` : ""}. Build resilience now.`,
        type: "mood-neutral",
      })

      // Add a specific strategy for balanced mood
      suggestions.push({
        title: "Resilience Building",
        content: "Try daily 5-min mindfulness or gratitude practice.",
        type: "coping-neutral",
      })
    }

    // Add mood trend suggestion if available
    if (insights.moodTrend && typeof insights.moodTrend === "string") {
      suggestions.push({
        title: "Trend Awareness",
        content: `Trend: ${insights.moodTrend}. Adjust self-care accordingly.`,
        type: "trend",
      })
    }

    // Always ensure we have at least one general suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        title: "Continue Tracking",
        content: "Keep tracking for better insights.",
        type: "general",
      })
    }

    setSupportSuggestions(suggestions)
  }

  // Helper function to find most common items in an array
  const findMostCommonItems = (array, count = 3) => {
    if (!array || array.length === 0) return []

    const frequency = {}
    array.forEach((item) => {
      frequency[item] = (frequency[item] || 0) + 1
    })

    return Object.keys(frequency)
      .sort((a, b) => frequency[b] - frequency[a])
      .slice(0, count)
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Analyzing your data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${styles.errorMessage} ${darkMode ? styles.darkErrorMessage : ""}`}>
        <p>{error}</p>
        <button
          onClick={getInsights}
          className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""} mt-4`}
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!insights) {
    return (
      <div className={`${styles.emptyState} ${darkMode ? styles.darkEmptyState : ""}`}>
        <h2>No Analysis Available</h2>
        <p>We couldn't generate insights from your data. Try adding more entries or try again later.</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.sectionTitle}>Your Mood & Journal Insights</h2>

      <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
        <h3 className={styles.insightTitle}>Overall Mood Summary</h3>
        <div className={styles.insightContent}>
          {insights.summary && <p>{insights.summary}</p>}

          {insights.moodTrend && (
            <div className={`${styles.trendBox} ${darkMode ? styles.darkTrendBox : ""}`}>
              <h4>Mood Trend</h4>
              <p>{insights.moodTrend}</p>
            </div>
          )}
        </div>
      </div>

      {/* Support Suggestions Section */}
      {supportSuggestions.length > 0 && (
        <div className={`${styles.insightCard} ${styles.supportCard} ${darkMode ? styles.darkInsightCard : ""}`}>
          <h3 className={`${styles.insightTitle} ${styles.supportTitle}`}>Suggestions & Support</h3>
          <div className={styles.supportGrid}>
            {supportSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`${styles.supportItem} ${darkMode ? styles.darkSupportItem : ""}`}
                data-type={suggestion.type || "general"}
              >
                <h4>{suggestion.title}</h4>
                <p>{suggestion.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.patterns && Array.isArray(insights.patterns) && insights.patterns.length > 0 && (
        <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
          <h3 className={styles.insightTitle}>Identified Patterns</h3>
          <ul className={styles.patternsList}>
            {insights.patterns.map((pattern, index) => (
              <li key={index} className={styles.patternItem}>
                {typeof pattern === "object" ? pattern.description || JSON.stringify(pattern) : pattern}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.insights && (
        <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
          <h3 className={styles.insightTitle}>Key Insights</h3>
          <div className={styles.insightContent}>
            <p>{insights.insights}</p>
          </div>
        </div>
      )}

      {insights.journalThemes && (
        <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
          <h3 className={styles.insightTitle}>Journal Themes</h3>
          <div className={styles.insightContent}>
            <p>
              {typeof insights.journalThemes === "object"
                ? JSON.stringify(insights.journalThemes)
                : insights.journalThemes}
            </p>
          </div>
        </div>
      )}

      {insights.correlations && (
        <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
          <h3 className={styles.insightTitle}>Mood-Journal Correlations</h3>
          <div className={styles.insightContent}>
            <p>
              {typeof insights.correlations === "object"
                ? JSON.stringify(insights.correlations)
                : insights.correlations}
            </p>
          </div>
        </div>
      )}

      <div className={`${styles.insightCard} ${darkMode ? styles.darkInsightCard : ""}`}>
        <h3 className={styles.insightTitle}>Data Summary</h3>
        <div className={styles.statsGrid}>
          <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
            <span className={styles.statNumber}>{insights.stats?.totalMoodEntries || moodData.length}</span>
            <span className={styles.statLabel}>Mood Entries</span>
          </div>
          <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
            <span className={styles.statNumber}>{insights.stats?.totalJournalEntries || journalData.length}</span>
            <span className={styles.statLabel}>Journal Entries</span>
          </div>
          {moodData.length > 0 && (
            <>
              <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
                <span className={styles.statNumber}>
                  {insights.stats?.averageMood
                    ? insights.stats.averageMood.toFixed(1)
                    : (moodData.reduce((sum, entry) => sum + (entry.score || 0), 0) / moodData.length).toFixed(1)}
                </span>
                <span className={styles.statLabel}>Avg. Mood</span>
              </div>
              <div className={`${styles.statBox} ${darkMode ? styles.darkStatBox : ""}`}>
                <span className={styles.statNumber}>
                  {insights.stats?.highestMood || Math.max(...moodData.map((entry) => entry.score || 0))}
                </span>
                <span className={styles.statLabel}>Highest Mood</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
  