"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import JournalPromptUI from "./components/journal-prompt-ui"
import styles from "./styles/journal-prompt.module.css"

export default function JournalPromptPage() {
  const [journals, setJournals] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const isDarkModeEnabled =
      document.documentElement.classList.contains("dark") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setDarkMode(isDarkModeEnabled)

    const savedJournals = localStorage.getItem("savedJournals")
    if (savedJournals) {
      try {
        setJournals(JSON.parse(savedJournals))
      } catch (error) {
        console.error("Failed to parse saved journals from localStorage:", error)
        localStorage.removeItem("savedJournals") // Clear corrupted data
        setJournals([])
        // Optionally, inform the user about the corrupted data
        // showToast("Error: Could not load saved journals. Data was corrupted.", true);
      }
    }
  }, [])

  const saveJournal = (journalEntry) => {
    const newJournal = {
      id: Date.now(),
      ...journalEntry,
      date: new Date().toLocaleDateString(),
      timestamp: new Date().toISOString(),
    }

    const updatedJournals = [newJournal, ...journals]
    setJournals(updatedJournals)
    localStorage.setItem("savedJournals", JSON.stringify(updatedJournals))

    showToast("Journal saved successfully")
    return newJournal.id // As per original journal-prompt-ui.jsx expectation
  }

  // Your existing showToast function
  const showToast = (message, isError = false) => {
    const toast = document.createElement("div")
    toast.className = `${styles.toast} ${isError ? styles.errorToast : ""}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.showToast)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.showToast)
      setTimeout(() => {
        if (document.body.contains(toast)) {
          // Check if still in DOM before removing
          document.body.removeChild(toast)
        }
      }, 300)
    }, 3000)
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ""}`}>
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`${styles.title} ${darkMode ? styles.darkPromptTitle : ""}`}>Your Journal</h1>
            <p className={`${styles.subtitle} ${darkMode ? styles.darkSubtitle : ""}`}>
              Reflect on your thoughts and feelings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
            >
              Back to Home
            </Link>
          </div>
        </header>

        <JournalPromptUI saveJournal={saveJournal} darkMode={darkMode} styles={styles} showAppToast={showToast} />

        {journals.length > 0 && (
          <div className={`mt-12 ${styles.card} ${darkMode ? styles.darkCard : ""}`}>
            <h2 className={`${styles.sectionTitle} ${darkMode ? styles.darkSectionTitle : ""}`}>
              Your Journal Entries
            </h2>
            <div className="space-y-4 mt-4">
              {journals.map((journal) => (
                <div key={journal.id} className={`${styles.journalEntry} ${darkMode ? styles.darkJournalEntry : ""}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={`${styles.journalTitle} ${darkMode ? styles.darkJournalTitle : ""}`}>
                      {journal.title || "Journal Entry"}
                    </h3>
                    <span className={`${styles.journalDate} ${darkMode ? styles.darkJournalDate : ""}`}>
                      {journal.date}
                    </span>
                  </div>
                  <p className={`${styles.journalContent} ${darkMode ? styles.darkJournalContent : ""}`}>
                    {journal.content}
                  </p>
                  {journal.mood && (
                    <div className={`${styles.journalMood} ${darkMode ? styles.darkJournalMood : ""}`}>
                      <span className={`${styles.moodLabel} ${darkMode ? styles.darkMoodLabel : ""}`}>Mood:</span>{" "}
                      {journal.mood}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
