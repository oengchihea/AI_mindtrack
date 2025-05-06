"use client"

import { useState } from "react"
import { useTheme } from "./theme-provider"

export default function ModelSelector({ availableModels, selectedModel, onSelectModel }) {
  const [isOpen, setIsOpen] = useState(false)
  const { theme } = useTheme()

  const styles = {
    container: {
      position: "relative",
    },
    selector: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem",
      border: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
      borderRadius: "0.375rem",
      cursor: "pointer",
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#333333",
    },
    icon: {
      color: "#4361ee",
      width: "1.25rem",
      height: "1.25rem",
    },
    content: {
      flex: 1,
    },
    modelName: {
      fontWeight: "500",
    },
    modelVersion: {
      fontSize: "0.75rem",
      color: theme === "dark" ? "#cccccc" : "#666666",
    },
    dropdown: {
      position: "absolute",
      zIndex: 10,
      width: "100%",
      marginTop: "0.25rem",
      borderRadius: "0.375rem",
      border: `1px solid ${theme === "dark" ? "#444444" : "#e0e0e0"}`,
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      maxHeight: "300px",
      overflowY: "auto",
    },
    modelItem: {
      padding: "0.75rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      backgroundColor: theme === "dark" ? "#2a2a2a" : "#ffffff",
      color: theme === "dark" ? "#ffffff" : "#333333",
    },
    modelItemHover: {
      backgroundColor: theme === "dark" ? "#333333" : "#f5f5f5",
    },
    selectedBadge: {
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "9999px",
      padding: "0.25rem 0.625rem",
      fontSize: "0.75rem",
      fontWeight: "600",
      backgroundColor: theme === "dark" ? "#4361ee" : "#e0e0ff",
      color: theme === "dark" ? "#ffffff" : "#4361ee",
    },
  }

  // If no models are provided, use a default one
  const models =
    availableModels && availableModels.length > 0
      ? availableModels
      : [{ name: "gemini-1.5-pro", displayName: "Gemini 1.5 Pro", version: "v1beta" }]

  const currentModel = models.find((m) => m.name === selectedModel) || models[0]

  return (
    <div style={styles.container}>
      <div style={styles.selector} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.icon}>🤖</div>
        <div style={styles.content}>
          <div style={styles.modelName}>{currentModel.displayName || currentModel.name}</div>
          <div style={styles.modelVersion}>{currentModel.version}</div>
        </div>
        <div>{isOpen ? "▲" : "▼"}</div>
      </div>

      {isOpen && (
        <div style={styles.dropdown}>
          {models.map((model, index) => (
            <div
              key={index}
              style={{
                ...styles.modelItem,
                ...(model.name === selectedModel ? styles.modelItemHover : {}),
              }}
              onClick={() => {
                onSelectModel(model)
                setIsOpen(false)
              }}
            >
              <div style={styles.icon}>🤖</div>
              <div style={styles.content}>
                <div style={styles.modelName}>{model.displayName || model.name}</div>
                <div style={styles.modelVersion}>API: {model.version}</div>
              </div>
              {model.name === selectedModel && <div style={styles.selectedBadge}>Selected</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

