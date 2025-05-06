"use client"

import { ThemeProvider } from "../../components/theme-provider"
import ThemeToggle from "../../components/theme-toggle"
import MoodAnalyzerUI from "./components/mood-analyzer-ui"
import Link from "next/link"
import styles from "./styles.module.css"

export default function MoodAnalyzerPage() {
  return (
    <ThemeProvider defaultTheme="light">
      <div className={styles.container}>
        <div className="container mx-auto max-w-4xl">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className={styles.title}>AI Mood Analyzer</h1>
              <p className={styles.subtitle}>Analyze your mood with Gemini AI</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className={`${styles.button} ${styles.secondaryButton}`}>
                Back to Home
              </Link>
              <ThemeToggle />
            </div>
          </header>

          <MoodAnalyzerUI />

          <div className={`mt-8 ${styles.card}`}>
            <h2 className={styles.infoTitle}>About Mood Analysis</h2>
            <p className={`${styles.infoText} mb-4`}>
              This tool uses Google's Gemini AI to analyze your mood based on your responses to a few simple questions.
              The AI evaluates your answers and provides:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li className={styles.infoText}>A mood score on a scale of 1-5</li>
              <li className={styles.infoText}>A visual representation of your current emotional state</li>
              <li className={styles.infoText}>Personalized insights about your mood patterns</li>
              {/* UPDATED: Removed the suggestions bullet point */}
            </ul>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
