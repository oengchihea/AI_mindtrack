"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import JournalPromptUI from "./components/journal-prompt-ui"
import styles from "./styles/journal-prompt.module.css"

export default function JournalPromptPage() {
  const [journals, setJournals] = useState([])
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check if dark mode is enabled
    const isDarkMode = document.documentElement.classList.contains("dark")
    setDarkMode(isDarkMode)

    // Load saved journals from localStorage
    const savedJournals = localStorage.getItem("savedJournals")
    if (savedJournals) {
      setJournals(JSON.parse(savedJournals))
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

    // Show toast notification
    showToast("Journal saved successfully")

    return newJournal.id
  }

  const showToast = (message) => {
    const toast = document.createElement("div")
    toast.className = styles.toast
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
      toast.classList.add(styles.showToast)
    }, 100)

    setTimeout(() => {
      toast.classList.remove(styles.showToast)
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, 3000)
  }

  return (
    <div className={`${styles.container} ${darkMode ? styles.darkContainer : ""}`}>
      <div className="container mx-auto max-w-4xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className={styles.title}>Your Journal</h1>
            <p className={styles.subtitle}>Reflect on your thoughts and feelings</p>
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

        <JournalPromptUI saveJournal={saveJournal} darkMode={darkMode} />

        {journals.length > 0 && (
          <div className={`mt-8 ${styles.card} ${darkMode ? styles.darkCard : ""}`}>
            <h2 className={styles.sectionTitle}>Your Journal Entries</h2>
            <div className="space-y-4 mt-4">
              {journals.map((journal) => (
                <div key={journal.id} className={`${styles.journalEntry} ${darkMode ? styles.darkJournalEntry : ""}`}>
                  <div className="flex justify-between items-start">
                    <h3 className={styles.journalTitle}>{journal.title || "Journal Entry"}</h3>
                    <span className={styles.journalDate}>{journal.date}</span>
                  </div>
                  <p className={styles.journalContent}>{journal.content}</p>
                  {journal.mood && (
                    <div className={styles.journalMood}>
                      <span className={styles.moodLabel}>Mood:</span> {journal.mood}
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
