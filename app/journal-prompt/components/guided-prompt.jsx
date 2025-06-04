"use client"

import { useState, useEffect, useCallback } from "react"
// styles prop will be passed from journal-prompt-ui.jsx, originating from page.jsx

const DEFAULT_PROMPTS = [
  "How did you feel overall today, and what influenced your mood the most?",
  "What was the most challenging part of your day, and how did you handle it?",
  "What is one small win or positive moment you can appreciate from today?",
]

export default function GuidedPrompt({ onComplete, onCancel, darkMode, styles, showAppToast }) {
  const [isLoading, setIsLoading] = useState(true) // Start loading true
  const [currentStep, setCurrentStep] = useState(0)
  const [prompts, setPrompts] = useState([])
  const [responses, setResponses] = useState([]) // Array to store responses for each prompt
  const [currentResponse, setCurrentResponse] = useState("")
  const [journalTitle, setJournalTitle] = useState("")
  const [journalMood, setJournalMood] = useState("")
  const [error, setError] = useState(null)

  const fetchApiPrompts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    setResponses([]) // Reset responses when fetching new prompts
    setCurrentResponse("")
    setCurrentStep(0)

    try {
      const response = await fetch("/api/journal-prompt/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptType: "guided", count: 3 }),
      })

      const responseText = await response.text() // Read the body ONCE as text

      if (!response.ok) {
        let errorDetails = responseText // Default to the raw text
        try {
          const errorData = JSON.parse(responseText) // Try to parse the text as JSON
          errorDetails = errorData.error || errorData.details || JSON.stringify(errorData)
        } catch (e) {
          // Parsing failed, errorDetails remains the raw responseText or a generic message
          console.warn("Could not parse error response as JSON:", e)
          if (!errorDetails && response.status) {
            // if responseText was empty
            errorDetails = `API request failed with status: ${response.status}`
          } else if (!errorDetails) {
            errorDetails = "API request failed with an unknown error."
          }
        }
        console.error("Failed to fetch prompts from API:", errorDetails)
        throw new Error(errorDetails) // This will be caught by the outer catch
      }

      // If response.ok, parse the responseText
      const data = JSON.parse(responseText)
      if (data.prompts && data.prompts.length > 0) {
        setPrompts(data.prompts)
        setResponses(new Array(data.prompts.length).fill("")) // Initialize responses array
      } else {
        console.warn("API returned no prompts or invalid format, using defaults.")
        setPrompts(DEFAULT_PROMPTS)
        setResponses(new Array(DEFAULT_PROMPTS.length).fill(""))
        setError("AI did not provide prompts. Using default questions.") // Set an error message for the UI
      }
    } catch (err) {
      console.error("Error in fetchApiPrompts:", err)
      const errorMessage = err.message || "Failed to load prompts. Using default questions."
      setError(errorMessage)
      setPrompts(DEFAULT_PROMPTS)
      setResponses(new Array(DEFAULT_PROMPTS.length).fill(""))
      if (showAppToast) showAppToast(errorMessage, true)
    } finally {
      setIsLoading(false)
    }
  }, [showAppToast])

  useEffect(() => {
    fetchApiPrompts()
  }, [fetchApiPrompts])

  const handleNext = () => {
    if (!currentResponse.trim()) {
      if (showAppToast) showAppToast("Please write something before continuing.", true)
      return
    }

    const newResponses = [...responses]
    newResponses[currentStep] = currentResponse
    setResponses(newResponses)
    setCurrentResponse("") // Clear for next prompt

    if (currentStep < prompts.length - 1) {
      setCurrentStep(currentStep + 1)
      setCurrentResponse(newResponses[currentStep + 1] || "") // Pre-fill if already answered
    } else {
      // Move to final step (collect title and mood)
      setCurrentStep(currentStep + 1)
    }
  }

  const handleComplete = () => {
    // Ensure title/mood are captured if on final step, otherwise they might be from previous session
    const finalTitle = currentStep === prompts.length ? journalTitle : ""
    const finalMood = currentStep === prompts.length ? journalMood : ""

    const combinedContent = prompts
      .map((prompt, index) => `Q: ${prompt}\nA: ${responses[index] || "(No answer provided)"}`)
      .join("\n\n")

    onComplete(combinedContent, finalTitle || prompts[0] || "Guided Entry", finalMood)
  }

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={darkMode ? styles.darkProgressText : styles.progressText}>Loading journal prompts...</p>
      </div>
    )
  }

  // Final step - title and mood
  if (prompts.length > 0 && currentStep === prompts.length) {
    return (
      <div className={styles.finalStep}>
        <h2 className={`${styles.promptTitle} ${darkMode ? styles.darkPromptTitle : ""}`}>Complete Your Journal</h2>
        {/* Display general error if it occurred during fetching and led to defaults */}
        {error && prompts === DEFAULT_PROMPTS && (
          <div className={`${styles.toast} ${styles.errorToast} ${styles.showToast}`}>{error}</div>
        )}

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

  if (!prompts || prompts.length === 0 || (error && prompts === DEFAULT_PROMPTS && !isLoading)) {
    // This condition handles cases where prompts are empty or only defaults are shown due to an error
    return (
      <div className={styles.guidedPromptContainer}>
        {error && <div className={`${styles.toast} ${styles.errorToast} ${styles.showToast}`}>{error}</div>}
        <p className={darkMode ? styles.darkPromptText : styles.promptText}>
          {error ? "" : "No prompts available at the moment. Please try again later."}
        </p>
        <div className={styles.buttonContainer}>
          <button
            onClick={onCancel} // Or fetchApiPrompts again
            className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
          >
            {error ? "Try Again" : "Back"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.guidedPromptContainer}>
      {/* Display error if it occurred during fetching and led to defaults, but not if loading */}
      {error && prompts === DEFAULT_PROMPTS && !isLoading && (
        <div className={`${styles.toast} ${styles.errorToast} ${styles.showToast}`}>{error}</div>
      )}
      <div className={`${styles.aiPromptBox} ${darkMode ? styles.darkAiPromptBox : ""}`}>
        <div className={`${styles.aiPromptLabel} ${darkMode ? styles.darkAiPromptLabel : ""}`}>AI-generated prompt</div>
        <h2 className={`${styles.promptTitle} ${darkMode ? styles.darkPromptTitle : ""}`}>{prompts[currentStep]}</h2>
      </div>

      <textarea
        value={currentResponse}
        onChange={(e) => setCurrentResponse(e.target.value)}
        placeholder="Write it here..."
        className={`${styles.textarea} ${darkMode ? styles.darkTextarea : ""}`}
        rows={5}
      />

      <div className={styles.buttonContainer}>
        <button onClick={handleNext} className={`${styles.button} ${styles.primaryButton}`}>
          {currentStep < prompts.length - 1 ? "Next" : "Review & Finish"}
        </button>
        <button
          onClick={onCancel}
          className={`${styles.button} ${styles.secondaryButton} ${darkMode ? styles.darkSecondaryButton : ""}`}
        >
          Cancel
        </button>
      </div>

      <div className={styles.progressIndicator}>
        <span className={`${styles.progressText} ${darkMode ? styles.darkProgressText : ""}`}>
          Question {currentStep + 1} of {prompts.length}
        </span>
        <div className={`${styles.progressBar} ${darkMode ? styles.darkProgressBar : ""}`}>
          <div
            className={styles.progressFill}
            style={{ width: `${prompts.length > 0 ? ((currentStep + 1) / prompts.length) * 100 : 0}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}
