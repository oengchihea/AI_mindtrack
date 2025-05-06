"use client"

import { useState, useEffect } from "react"
import { useTheme } from "../../../components/theme-provider"
import { useToast } from "../../../hooks/use-toast"
import FixedGauge from "./fixed-gauge"
import styles from "../styles.module.css"

export default function MoodAnalyzerUI() {
  const { theme } = useTheme()
  const [responses, setResponses] = useState({
    feeling: "",
    moodWord: "",
    positiveExperience: "",
    affectingFactor: "",
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState("")
  const [score, setScore] = useState(3)
  const [emojiType, setEmojiType] = useState("neutral")
  const [insights, setInsights] = useState("")
  // UPDATED: Removed suggestions state
  const { toast } = useToast()

  const isDark = theme === "dark"

  // Map emoji types to actual emoji characters
  const emojiMap = {
    sad: "😢",
    slightly_sad: "🙁",
    neutral: "😐",
    slightly_happy: "🙂",
    happy: "😄",
  }

  // Process the result when it changes
  useEffect(() => {
    if (result?.analysis) {
      console.log("Analysis result:", result.analysis)

      try {
        // Extract score and ensure it's a number between 1-5
        let scoreValue = result.analysis.score
        if (typeof scoreValue === "string") {
          scoreValue = Number.parseInt(scoreValue, 10)
        }

        if (!isNaN(scoreValue) && scoreValue >= 1 && scoreValue <= 5) {
          setScore(scoreValue)
          console.log("Setting score to:", scoreValue)
        }

        // Set emoji based on score
        if (result.analysis.emoji) {
          setEmojiType(result.analysis.emoji)
        }

        // Set insights
        if (result.analysis.insights) {
          setInsights(result.analysis.insights)
        }

        // UPDATED: Removed setting suggestions
      } catch (e) {
        console.error("Error processing analysis result:", e)
        setError("Error processing the analysis result. Please try again.")
      }
    }
  }, [result])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setResponses((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!responses.feeling || !responses.moodWord) {
      toast({
        title: "Missing information",
        description: "Please answer at least the first two questions.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("Sending data to API:", {
        userData: responses,
        analysisType: "immediate-mood",
      })

      const response = await fetch("/api/analyze-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userData: responses,
          analysisType: "immediate-mood",
        }),
      })

      console.log("API Response Status:", response.status)
      const data = await response.json()
      console.log("API Response Data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze mood")
      }

      setResult(data)
      setShowResults(true)
    } catch (error) {
      console.error("Error analyzing mood:", error)
      setError(error.message || "An unknown error occurred while analyzing mood.")
      toast({
        title: "Analysis failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setShowResults(false)
    setResponses({
      feeling: "",
      moodWord: "",
      positiveExperience: "",
      affectingFactor: "",
    })
    setResult(null)
    setScore(3)
    setEmojiType("neutral")
    setInsights("")
    // UPDATED: Removed resetting suggestions
    setError("")
  }

  // Debug function to manually set score (for testing)
  const debugSetScore = (newScore) => {
    console.log("Setting debug score to:", newScore)

    // Update the score state
    setScore(newScore)

    // Update the emoji based on the new score
    const emojiTypes = ["sad", "slightly_sad", "neutral", "slightly_happy", "happy"]
    setEmojiType(emojiTypes[Math.max(0, Math.min(4, newScore - 1))])

    // Also update the result object to ensure consistency
    if (result) {
      const updatedAnalysis = {
        ...(result.analysis || {}),
        score: newScore,
        emoji: emojiTypes[Math.max(0, Math.min(4, newScore - 1))],
      }

      setResult({
        ...result,
        analysis: updatedAnalysis,
      })
    }
  }

  return (
    <div className={`${styles.card} ${isDark ? styles.darkCard : ""}`}>
      <h2 className={styles.infoTitle}>Mood Analysis</h2>

      {!showResults ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className={styles.formGroup}>
              <label className={`${styles.label} ${isDark ? styles.darkLabel : ""}`}>
                How are you feeling today on a scale from 1 to 10?
              </label>
              <input
                type="number"
                name="feeling"
                min="1"
                max="10"
                value={responses.feeling}
                onChange={handleInputChange}
                className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${isDark ? styles.darkLabel : ""}`}>
                What's one word that best describes your mood right now?
              </label>
              <input
                type="text"
                name="moodWord"
                value={responses.moodWord}
                onChange={handleInputChange}
                className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${isDark ? styles.darkLabel : ""}`}>
                Have you experienced anything today that lifted your spirits?
              </label>
              <input
                type="text"
                name="positiveExperience"
                value={responses.positiveExperience}
                onChange={handleInputChange}
                className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={`${styles.label} ${isDark ? styles.darkLabel : ""}`}>
                Is there something on your mind that's affecting how you feel?
              </label>
              <input
                type="text"
                name="affectingFactor"
                value={responses.affectingFactor}
                onChange={handleInputChange}
                className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
              />
            </div>
          </div>

          <div className="flex mt-4 space-x-2">
            <button type="submit" disabled={loading} className={`${styles.button} ${styles.primaryButton}`}>
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze Mood"
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className={`${styles.button} ${styles.secondaryButton} ${isDark ? styles.darkSecondaryButton : ""}`}
            >
              Clear
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.resultsContainer}>
          {!error ? (
            <div className="flex flex-col items-center">
              {/* Emoji Display */}
              <div className={styles.emojiContainer}>
                <div className={styles.emoji}>{emojiMap[emojiType] || emojiMap.neutral}</div>
              </div>

              {/* Gauge Display - Using a unique key to force re-render */}
              <FixedGauge key={`gauge-${Date.now()}-${score}`} score={score} theme={theme} />

              {/* Debug controls - only in development */}
              <div className={`${styles.debugContainer} ${isDark ? styles.darkDebugContainer : ""}`}>
                <p className={styles.debugTitle}>Debug: Set Score Manually</p>
                <div className={styles.debugButtons}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => debugSetScore(n)}
                      className={`${styles.debugButton} ${score === n ? styles.debugButtonActive : ""} ${isDark ? styles.darkDebugButton : ""}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Insights */}
              {insights && (
                <div className={`${styles.infoCard} ${isDark ? styles.darkInfoCard : ""}`}>
                  <h3 className={styles.infoTitle}>Insights</h3>
                  <p className={`${styles.infoText} ${isDark ? styles.darkInfoText : ""}`}>{insights}</p>
                </div>
              )}

              {/* UPDATED: Removed Suggestions section */}

              <button onClick={resetForm} className={`mt-6 ${styles.button} ${styles.primaryButton}`}>
                Start Over
              </button>
            </div>
          ) : (
            <div className={`${styles.errorContainer} ${isDark ? styles.darkErrorContainer : ""}`}>
              <h3 className={styles.errorTitle}>Error</h3>
              <p>{error}</p>
              <button onClick={resetForm} className={styles.errorButton}>
                Try Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
