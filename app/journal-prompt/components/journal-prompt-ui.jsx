"use client"

import { useState } from "react"
import GuidedPrompt from "./guided-prompt"
import FreeformJournal from "./freeform-journal"
// styles prop will be passed from page.jsx

export default function JournalPromptUI({ saveJournal, darkMode, styles, showAppToast }) {
  const [showInitialChoice, setShowInitialChoice] = useState(true)
  const [useGuided, setUseGuided] = useState(null) // true for guided, false for freeform

  const handleGuidedChoice = (choice) => {
    setUseGuided(choice)
    setShowInitialChoice(false)
  }

  const handleSaveJournalFromChild = (content, title, mood) => {
    if (!content && useGuided === false) {
      // Only enforce for freeform if content is primary
      if (showAppToast) showAppToast("Please write something before saving your journal.", true)
      return
    }

    const journalEntry = {
      content,
      title: title || (useGuided ? "Guided Entry" : "Journal Entry"),
      mood: mood || "",
      isGuided: useGuided, // Store if it was a guided session
    }

    saveJournal(journalEntry) // This calls the saveJournal from page.jsx

    // Reset to initial choice screen
    setShowInitialChoice(true)
    setUseGuided(null)
  }

  const resetToInitialChoice = () => {
    setShowInitialChoice(true)
    setUseGuided(null)
  }

  return (
    <div className={`${styles.card} ${darkMode ? styles.darkCard : ""}`}>
      {showInitialChoice ? (
        <div className={styles.promptContainer}>
          <h2 className={`${styles.promptTitle} ${darkMode ? styles.darkPromptTitle : ""}`}>
            How would you like to journal?
          </h2>
          {/* Removed the AI prompt box for this initial choice to simplify */}
          <p className={`${styles.promptText} ${darkMode ? styles.darkPromptText : ""}`}>
            Choose between an AI-guided session or a freeform entry.
          </p>
          <div className={styles.promptButtons}>
            <button
              onClick={() => handleGuidedChoice(true)}
              className={`${styles.button} ${styles.primaryButton} ${darkMode ? styles.darkButton : ""}`}
            >
              AI Guided
            </button>
            <button
              onClick={() => handleGuidedChoice(false)}
              className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
            >
              Freeform
            </button>
          </div>
        </div>
      ) : useGuided ? (
        <GuidedPrompt
          onComplete={handleSaveJournalFromChild}
          onCancel={resetToInitialChoice}
          darkMode={darkMode}
          styles={styles}
          showAppToast={showAppToast} // Pass down the toast function
        />
      ) : (
        <FreeformJournal
          onSave={handleSaveJournalFromChild}
          onCancel={resetToInitialChoice}
          darkMode={darkMode}
          styles={styles} // Pass styles if FreeformJournal uses them
        />
      )}
    </div>
  )
}
