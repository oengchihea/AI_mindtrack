"use client"

import { useState } from "react"
import styles from "../styles/journal-prompt.module.css"

export default function FreeformJournal({ onSave, onCancel, darkMode }) {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [mood, setMood] = useState("")

  const handleSave = () => {
    onSave(content, title, mood)
  }

  return (
    <div className={styles.freeformContainer}>
      <h2 className={styles.promptTitle}>Write Your Journal</h2>

      <div className={styles.formGroup}>
        <label className={`${styles.label} ${darkMode ? styles.darkLabel : ""}`}>Journal Title (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Today's Thoughts"
          className={`${styles.input} ${darkMode ? styles.darkInput : ""}`}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={`${styles.label} ${darkMode ? styles.darkLabel : ""}`}>
          How are you feeling today? (optional)
        </label>
        <input
          type="text"
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          placeholder="Happy, Sad, Anxious, Excited..."
          className={`${styles.input} ${darkMode ? styles.darkInput : ""}`}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={`${styles.label} ${darkMode ? styles.darkLabel : ""}`}>Your Journal Entry</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your thoughts here..."
          className={`${styles.textarea} ${styles.largeTextarea} ${darkMode ? styles.darkTextarea : ""}`}
          required
        />
      </div>

      <div className={styles.buttonContainer}>
        <button onClick={handleSave} className={`${styles.button} ${styles.primaryButton}`} disabled={!content.trim()}>
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
