"use client"

import { useState } from "react"
import GuidedPrompt from "./guided-prompt"
import FreeformJournal from "./freeform-journal"
import styles from "../styles/journal-prompt.module.css"

export default function JournalPromptUI({ saveJournal, darkMode }) {
  const [showPrompt, setShowPrompt] = useState(true)
  const [useGuided, setUseGuided] = useState(null)
  const [journalContent, setJournalContent] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [journalMood, setJournalMood] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGuidedChoice = (choice) => {
    setUseGuided(choice)
    setShowPrompt(false)
  }

  const handleSaveJournal = (content, title, mood) => {
    if (!content) {
      // Show error message
      const errorToast = document.createElement("div")
      errorToast.className = `${styles.toast} ${styles.errorToast}`
      errorToast.textContent = "Please write something before saving your journal."
      document.body.appendChild(errorToast)

      setTimeout(() => {
        errorToast.classList.add(styles.showToast)
      }, 100)

      setTimeout(() => {
        errorToast.classList.remove(styles.showToast)
        setTimeout(() => {
          document.body.removeChild(errorToast)
        }, 300)
      }, 3000)
      return
    }

    const journalEntry = {
      content,
      title: title || "Journal Entry",
      mood: mood || "",
      isGuided: useGuided,
    }

    const journalId = saveJournal(journalEntry)

    // Reset the form
    setJournalContent("")
    setJournalTitle("")
    setJournalMood("")
    setShowPrompt(true)
    setUseGuided(null)
  }

  const resetJournal = () => {
    setShowPrompt(true)
    setUseGuided(null)
    setJournalContent("")
    setJournalTitle("")
    setJournalMood("")
  }

  return (
    <div className={`${styles.card} ${darkMode ? styles.darkCard : ""}`}>
      {showPrompt ? (
        <div className={styles.promptContainer}>
          <h2 className={styles.promptTitle}>Guided Journal Prompt</h2>
          <div className={styles.aiPromptBox}>
            <div className={styles.aiPromptLabel}>AI-generated prompt</div>
            <p className={styles.promptText}>Would you like AI to guide you through the journaling process?</p>
          </div>
          <div className={styles.promptButtons}>
            <button onClick={() => handleGuidedChoice(true)} className={`${styles.button} ${styles.primaryButton}`}>
              Yes
            </button>
            <button
              onClick={() => handleGuidedChoice(false)}
              className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
            >
              No
            </button>
          </div>
        </div>
      ) : useGuided ? (
        <GuidedPrompt onComplete={handleSaveJournal} onCancel={resetJournal} darkMode={darkMode} />
      ) : (
        <FreeformJournal onSave={handleSaveJournal} onCancel={resetJournal} darkMode={darkMode} />
      )}
    </div>
  )
}
