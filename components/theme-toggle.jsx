"use client"

import { useTheme } from "./theme-provider"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const styles = {
    button: {
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#f0f0f0",
      color: theme === "dark" ? "#ffffff" : "#333333",
      border: "none",
      borderRadius: "0.25rem",
      padding: "0.5rem 1rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    icon: {
      marginRight: "0.5rem",
    },
  }

  return (
    <button style={styles.button} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? "🌙" : "☀️"} Toggle Theme
    </button>
  )
}

