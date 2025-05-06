"use client"

import { useState, useEffect } from "react"
import styles from "../styles/journal-prompt.module.css"

export default function GuidedPrompt({ onComplete, onCancel, darkMode }) {
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [prompts, setPrompts] = useState([])
  const [responses, setResponses] = useState([])
  const [currentResponse, setCurrentResponse] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [journalMood, setJournalMood] = useState("")

  useEffect(() => {
    // Fetch prompts when component mounts
    fetchPrompts()
  }, [])

  const fetchPrompts = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/journal-prompt/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptType: "guided",
          count: 3, // Number of prompts to generate
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch prompts")
      }

      const data = await response.json()
      setPrompts(data.prompts)
    } catch (error) {
      console.error("Error fetching prompts:", error)

      // Show error toast
      const errorToast = document.createElement("div")
      errorToast.className = `${styles.toast} ${styles.errorToast}`
      errorToast.textContent = "Failed to load journal prompts. Using default prompts instead."
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

      // Set some default prompts as fallback
      setPrompts([
        "How did you feel overall today, and what influenced your mood the most?",
        "What was the most challenging part of your day, and how did you handle it?",
        "What is one small win or positive moment you can appreciate from today?",
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!currentResponse.trim()) {
      // Show error toast
      const errorToast = document.createElement("div")
      errorToast.className = `${styles.toast} ${styles.errorToast}`
      errorToast.textContent = "Please write something before continuing."
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

    // Save current response
    setResponses([...responses, currentResponse])
    setCurrentResponse("")

    // Move to next step or complete
    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - collect title and mood
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = () => {
    // Combine all responses into a single journal entry
    const combinedContent = prompts
      .map((prompt, index) => {
        return `${prompt}\n${responses[index] || ""}\n\n`
      })
      .join("")

    onComplete(combinedContent, journalTitle, journalMood)
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading journal prompts...</p>
      </div>
    )
  }

  // Final step - title and mood
  if (currentStep === prompts.length) {
    return (
      <div className={styles.finalStep}>
        <h2 className={styles.promptTitle}>Complete Your Journal</h2>

        <div className={styles.formGroup}>
          <label className={`${styles.label} ${darkMode ? styles.darkLabel : ""}`}>
            Give your journal entry a title (optional)
          </label>
          <input
            type="text"
            value={journalTitle}
            onChange={(e) => setJournalTitle(e.target.value)}
            placeholder="Today's Reflections"
            className={`${styles.input} ${darkMode ? styles.darkInput : ""}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={`${styles.label} ${darkMode ? styles.darkLabel : ""}`}>
            How would you describe your mood? (optional)
          </label>
          <input
            type="text"
            value={journalMood}
            onChange={(e) => setJournalMood(e.target.value)}
            placeholder="Calm, Reflective, Hopeful..."
            className={`${styles.input} ${darkMode ? styles.darkInput : ""}`}
          />
        </div>

        <div className={styles.buttonContainer}>
          <button onClick={handleComplete} className={`${styles.button} ${styles.primaryButton}`}>
            Save Journal
          </button>
          <button
            onClick={onCancel}
            className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.guidedPromptContainer}>
      <div className={styles.aiPromptBox}>
        <div className={styles.aiPromptLabel}>AI-generated prompt</div>
        <h2 className={styles.promptTitle}>{prompts[currentStep]}</h2>
      </div>

      <textarea
        value={currentResponse}
        onChange={(e) => setCurrentResponse(e.target.value)}
        placeholder="Write it here..."
        className={`${styles.textarea} ${darkMode ? styles.darkTextarea : ""}`}
      />

      <div className={styles.buttonContainer}>
        <button onClick={handleNext} className={`${styles.button} ${styles.primaryButton}`}>
          Next
        </button>
        <button
          onClick={onCancel}
          className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
        >
          Cancel
        </button>
      </div>

      <div className={styles.progressIndicator}>
        <span className={styles.progressText}>
          Question {currentStep + 1} of {prompts.length}
        </span>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${((currentStep + 1) / prompts.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
