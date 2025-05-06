"use client"

import { useTheme } from "./theme-provider"
import JsonViewer from "./json-viewer"

export default function ResponseDisplay({ result, onCopy, onClear }) {
  const { theme } = useTheme()

  const styles = {
    card: {
      borderRadius: "0.5rem",
      border: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#333333",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      padding: "1.5rem",
      paddingBottom: "0.5rem",
      backgroundColor: theme === "dark" ? "#333333" : "#f0f7ff",
    },
    title: {
      display: "flex",
      alignItems: "center",
      color: theme === "dark" ? "#81a1ff" : "#4361ee",
      fontSize: "1.5rem",
      fontWeight: "600",
      lineHeight: "none",
    },
    icon: {
      marginRight: "0.5rem",
    },
    content: {
      padding: "1rem",
      overflow: "auto",
    },
    text: {
      whiteSpace: "pre-wrap",
      fontFamily: "monospace",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      padding: "1.5rem",
      paddingTop: "0",
      backgroundColor: theme === "dark" ? "#333333" : "#f0f7ff",
      justifyContent: "flex-end",
      gap: "0.5rem",
    },
    button: {
      display: "flex",
      alignItems: "center",
      padding: "0.5rem 1rem",
      borderRadius: "0.25rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: "transparent",
      color: theme === "dark" ? "#ffffff" : "#333333",
      border: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
      cursor: "pointer",
    },
    buttonIcon: {
      marginRight: "0.5rem",
      width: "1rem",
      height: "1rem",
    },
  }

  // Format the result for display
  const formattedResult = typeof result === "object" ? JSON.stringify(result, null, 2) : result

  const downloadAsText = () => {
    const element = document.createElement("a")
    const content = typeof result === "object" ? JSON.stringify(result, null, 2) : result
    const file = new Blob([content], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `gemini-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // If result is not available, don't render anything
  if (!result) return null

  // If result is an object, use the JsonViewer component
  if (typeof result === "object") {
    return <JsonViewer data={result} onCopy={onCopy} onClear={onClear} />
  }

  // Otherwise, use the original text display
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={styles.icon}>📄</span>
          Generated Response
        </div>
      </div>
      <div style={styles.content}>
        <pre style={styles.text}>{formattedResult}</pre>
      </div>
      <div style={styles.footer}>
        <button style={styles.button} onClick={onCopy}>
          <span style={styles.buttonIcon}>📋</span>
          Copy
        </button>
        <button style={styles.button} onClick={downloadAsText}>
          <span style={styles.buttonIcon}>⬇️</span>
          Download JSON
        </button>
        <button style={styles.button} onClick={onClear}>
          <span style={styles.buttonIcon}>🗑️</span>
          Clear
        </button>
      </div>
    </div>
  )
}

