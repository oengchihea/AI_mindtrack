// This file (freeform-journal-ns0idlqovgCndzr3JR8fUGyikG4lnQ.jsx)
// is assumed to be correct as per your attachment and is not directly
// involved in the API fetching issue. No changes made here.
"use client"

import { useState } from "react"
// styles prop will be passed from journal-prompt-ui.jsx, originating from page.jsx

export default function FreeformJournal({ onSave, onCancel, darkMode, styles }) {
  const [content, setContent] = useState("")
  const [title, setTitle] = useState("")
  const [mood, setMood] = useState("")

  const handleSave = () => {
    // The parent (journal-prompt-ui) will handle the actual save call
    // This component just passes the data up
    onSave(content, title, mood)
  }

  return (
    <div className={styles.freeformContainer}>
      <h2 className={`${styles.promptTitle} ${darkMode ? styles.darkPromptTitle : ""}`}>Write Your Journal</h2>

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
          rows={8}
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
