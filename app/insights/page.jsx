"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "../../components/theme-provider"
import ThemeToggle from "../../components/theme-toggle"
import Link from "next/link"
import AnalysisDashboard from "./components/analysis-dashboard"
import WeeklyAnalysis from "./components/weekly-analysis"
import MonthlyAnalysis from "./components/monthly-analysis"
import styles from "./styles/insights.module.css"

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [moodData, setMoodData] = useState([])
  const [journalData, setJournalData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Load data from localStorage
    loadUserData()
  }, [])

  const loadUserData = () => {
    try {
      // Load mood data
      const savedMoodData = localStorage.getItem("moodHistory")
      if (savedMoodData) {
        setMoodData(JSON.parse(savedMoodData))
      }

      // Load journal data
      const savedJournals = localStorage.getItem("savedJournals")
      if (savedJournals) {
        setJournalData(JSON.parse(savedJournals))
      }
    } catch (err) {
      console.error("Error loading user data:", err)
      setError("Failed to load your data. Please try again.")
    }
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "weekly":
        return <WeeklyAnalysis moodData={moodData} journalData={journalData} />
      case "monthly":
        return <MonthlyAnalysis moodData={moodData} journalData={journalData} />
      default:
        return <AnalysisDashboard moodData={moodData} journalData={journalData} />
    }
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className={`${styles.container} ${darkMode ? styles.darkContainer : ""}`}>
        <div className="container mx-auto max-w-6xl">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className={styles.title}>Mood & Journal Insights</h1>
              <p className={styles.subtitle}>Analyze your mood patterns and journal entries</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
              >
                Back to Home
              </Link>
              <Link
                href="/mood-analyzer"
                className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""}`}
              >
                Mood Analyzer
              </Link>
              <Link
                href="/journal-prompt"
                className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""}`}
              >
                Journal
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <div className={`${styles.tabContainer} ${darkMode ? styles.darkTabContainer : ""}`}>
            <button
              className={`${styles.tabButton} ${activeTab === "overview" ? styles.activeTab : ""} ${
                darkMode ? styles.darkTabButton : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "weekly" ? styles.activeTab : ""} ${
                darkMode ? styles.darkTabButton : ""
              }`}
              onClick={() => setActiveTab("weekly")}
            >
              Weekly Analysis
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === "monthly" ? styles.activeTab : ""} ${
                darkMode ? styles.darkTabButton : ""
              }`}
              onClick={() => setActiveTab("monthly")}
            >
              Monthly Analysis
            </button>
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {moodData.length === 0 && journalData.length === 0 ? (
            <div className={`${styles.emptyState} ${darkMode ? styles.darkEmptyState : ""}`}>
              <h2>No Data Available</h2>
              <p>
                You haven't recorded any mood or journal entries yet. Visit the Mood Analyzer or Journal pages to get
                started.
              </p>
              <div className="flex space-x-4 mt-4">
                <Link
                  href="/mood-analyzer"
                  className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""}`}
                >
                  Try Mood Analyzer
                </Link>
                <Link
                  href="/journal-prompt"
                  className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkPrimaryButton : ""}`}
                >
                  Write a Journal
                </Link>
              </div>
            </div>
          ) : (
            <div className={`${styles.contentContainer} ${darkMode ? styles.darkContentContainer : ""}`}>
              {renderActiveTab()}
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
