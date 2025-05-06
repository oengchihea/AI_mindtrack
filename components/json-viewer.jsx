"use client"

import { useState } from "react"
import { useTheme } from "./theme-provider"

const JsonViewer = ({ data, onCopy, onClear }) => {
  const { theme } = useTheme()
  const [expandedPaths, setExpandedPaths] = useState(new Set(["root"]))
  const [copySuccess, setCopySuccess] = useState(false)

  const togglePath = (path) => {
    const newExpandedPaths = new Set(expandedPaths)
    if (newExpandedPaths.has(path)) {
      newExpandedPaths.delete(path)
    } else {
      newExpandedPaths.add(path)
    }
    setExpandedPaths(newExpandedPaths)
  }

  const copyToClipboard = () => {
    if (onCopy) {
      onCopy()
    } else {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    }
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const downloadAsJson = () => {
    const element = document.createElement("a")
    const content = JSON.stringify(data, null, 2)
    const file = new Blob([content], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `gemini-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const styles = {
    container: {
      borderRadius: "0.5rem",
      border: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#333333",
      overflow: "hidden",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      marginTop: "1.5rem",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: theme === "dark" ? "#333333" : "#f0f7ff",
      borderBottom: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
    },
    title: {
      display: "flex",
      alignItems: "center",
      color: theme === "dark" ? "#81a1ff" : "#4361ee",
      fontSize: "1.25rem",
      fontWeight: "600",
    },
    icon: {
      marginRight: "0.5rem",
    },
    actions: {
      display: "flex",
      gap: "0.5rem",
    },
    button: {
      display: "flex",
      alignItems: "center",
      padding: "0.5rem 0.75rem",
      borderRadius: "0.25rem",
      fontSize: "0.875rem",
      fontWeight: "500",
      backgroundColor: theme === "dark" ? "#444444" : "#f0f0f0",
      color: theme === "dark" ? "#ffffff" : "#333333",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    copyButton: {
      backgroundColor: copySuccess
        ? theme === "dark"
          ? "#2e7d32"
          : "#e6f4ea"
        : theme === "dark"
          ? "#1e3a8a"
          : "#e0e7ff",
      color: copySuccess ? (theme === "dark" ? "#ffffff" : "#2e7d32") : theme === "dark" ? "#ffffff" : "#4361ee",
    },
    content: {
      padding: "1rem",
      overflow: "auto",
      maxHeight: "500px",
      fontFamily: "monospace",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    property: {
      marginLeft: "1.5rem",
    },
    key: {
      color: theme === "dark" ? "#ff9580" : "#e53935",
    },
    string: {
      color: theme === "dark" ? "#a5d6a7" : "#2e7d32",
    },
    number: {
      color: theme === "dark" ? "#90caf9" : "#1565c0",
    },
    boolean: {
      color: theme === "dark" ? "#ce93d8" : "#7b1fa2",
    },
    null: {
      color: theme === "dark" ? "#b0bec5" : "#607d8b",
      fontStyle: "italic",
    },
    expandButton: {
      display: "inline-block",
      width: "1rem",
      cursor: "pointer",
      userSelect: "none",
    },
    footer: {
      display: "flex",
      alignItems: "center",
      padding: "1rem",
      backgroundColor: theme === "dark" ? "#333333" : "#f0f7ff",
      justifyContent: "flex-end",
      gap: "0.5rem",
      borderTop: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
    },
    footerButton: {
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

  const renderValue = (value, path, key = null, isLast = true) => {
    if (value === null) {
      return <span style={styles.null}>null</span>
    }

    if (typeof value === "string") {
      return <span style={styles.string}>"{value}"</span>
    }

    if (typeof value === "number") {
      return <span style={styles.number}>{value}</span>
    }

    if (typeof value === "boolean") {
      return <span style={styles.boolean}>{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      return renderArray(value, path, key, isLast)
    }

    if (typeof value === "object") {
      return renderObject(value, path, key, isLast)
    }

    return String(value)
  }

  const renderObject = (obj, path, key = null, isLast = true) => {
    const currentPath = key ? `${path}.${key}` : path
    const isExpanded = expandedPaths.has(currentPath)

    if (Object.keys(obj).length === 0) {
      return <span>{"{}"}</span>
    }

    return (
      <span>
        <span onClick={() => togglePath(currentPath)} style={styles.expandButton}>
          {isExpanded ? "▼" : "▶"}
        </span>
        <span>{" {"}</span>
        {isExpanded && (
          <>
            {Object.entries(obj).map(([k, v], index, arr) => (
              <div key={k} style={styles.property}>
                <span style={styles.key}>"{k}"</span>: {renderValue(v, currentPath, k, index === arr.length - 1)}
              </div>
            ))}
          </>
        )}
        <span>{isExpanded ? "}" : " ... }"}</span>
        {!isLast && ","}
      </span>
    )
  }

  const renderArray = (arr, path, key = null, isLast = true) => {
    const currentPath = key ? `${path}.${key}` : path
    const isExpanded = expandedPaths.has(currentPath)

    if (arr.length === 0) {
      return <span>[]</span>
    }

    return (
      <span>
        <span onClick={() => togglePath(currentPath)} style={styles.expandButton}>
          {isExpanded ? "▼" : "▶"}
        </span>
        <span>{" ["}</span>
        {isExpanded && (
          <>
            {arr.map((item, index) => (
              <div key={index} style={styles.property}>
                {renderValue(item, currentPath, index, index === arr.length - 1)}
              </div>
            ))}
          </>
        )}
        <span>{isExpanded ? "]" : " ... ]"}</span>
        {!isLast && ","}
      </span>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span style={styles.icon}>📊</span>
          Generated JSON Data
        </div>
        <div style={styles.actions}>
          <button onClick={copyToClipboard} style={{ ...styles.button, ...styles.copyButton }}>
            {copySuccess ? "✓ Copied!" : "Copy JSON"}
          </button>
          <button onClick={() => setExpandedPaths(new Set(["root"]))} style={styles.button}>
            Collapse All
          </button>
          <button
            onClick={() => {
              const allPaths = getAllPaths(data, "root")
              setExpandedPaths(new Set(allPaths))
            }}
            style={styles.button}
          >
            Expand All
          </button>
        </div>
      </div>
      <div style={styles.content}>{renderValue(data, "root")}</div>
      <div style={styles.footer}>
        <button style={styles.footerButton} onClick={downloadAsJson}>
          <span style={styles.buttonIcon}>⬇️</span>
          Download JSON
        </button>
        {onClear && (
          <button style={styles.footerButton} onClick={onClear}>
            <span style={styles.buttonIcon}>🗑️</span>
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

// Helper function to get all possible paths in the JSON object
const getAllPaths = (obj, path, result = []) => {
  result.push(path)

  if (obj && typeof obj === "object") {
    Object.keys(obj).forEach((key) => {
      const newPath = `${path}.${key}`
      result.push(newPath)
      if (obj[key] && typeof obj[key] === "object") {
        getAllPaths(obj[key], newPath, result)
      }
    })
  }

  return result
}

export default JsonViewer

