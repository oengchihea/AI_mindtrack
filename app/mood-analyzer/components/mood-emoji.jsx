"use client"

import { useEffect } from "react"
import styles from "../styles.module.css"

export default function MoodEmoji({ emojiType = "neutral" }) {
  // Map emoji types to actual emoji characters
  const emojiMap = {
    sad: "😢",
    slightly_sad: "🙁",
    neutral: "😐",
    slightly_happy: "🙂",
    happy: "😄",
  }

  // Get the emoji based on the type
  const emoji = emojiMap[emojiType] || emojiMap.neutral

  useEffect(() => {
    console.log("MoodEmoji: Emoji type updated to", emojiType)
  }, [emojiType])

  return (
    <div className={styles.emojiContainer}>
      <div className={styles.emoji}>{emoji}</div>
    </div>
  )
}
