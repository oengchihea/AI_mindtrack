"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeProvider } from "../components/theme-provider"
import ThemeToggle from "../components/theme-toggle"
import ModelSelector from "../components/model-selector"
import { useToast } from "../hooks/use-toast"
import Link from "next/link"

export default function Home() {
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [availableModels, setAvailableModels] = useState([])
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-pro")
  const [temperature, setTemperature] = useState(0.2)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [history, setHistory] = useState([])
  const [savedPrompts, setSavedPrompts] = useState([])
  const [viewMode, setViewMode] = useState("content") // "content" or "raw"
  const textareaRef = useRef(null)
  const { toast } = useToast()

  // Fetch available models on component mount
  useEffect(() => {
    fetchAvailableModels()

    // Load saved prompts and history from localStorage
    const savedPromptsFromStorage = localStorage.getItem("savedPrompts")
    const historyFromStorage = localStorage.getItem("generationHistory")

    if (savedPromptsFromStorage) {
      setSavedPrompts(JSON.parse(savedPromptsFromStorage))
    }

    if (historyFromStorage) {
      setHistory(JSON.parse(historyFromStorage))
    }
  }, [])

  async function fetchAvailableModels() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/list-models")
      const data = await response.json()

      if (data.status === "success") {
        setAvailableModels(data.models)

        // If the currently selected model is not in the available models,
        // select the first available model
        if (data.models.length > 0) {
          const modelNames = data.models.map((m) => m.name)
          if (!modelNames.includes(selectedModel)) {
            setSelectedModel(data.models[0].name)
          }
        }
      } else {
        setError(`Failed to get models: ${data.message}`)
        toast({
          title: "Error fetching models",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setError(`Error checking models: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to fetch models: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt before generating.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch("/api/generate-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          temperature,
          maxTokens,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate data")
      }

      // Set the JSON data as result
      setResult(data.data)

      // Add to history
      const newHistoryItem = {
        id: Date.now(),
        prompt,
        response: data.data,
        model: selectedModel,
        timestamp: new Date().toISOString(),
        settings: { temperature, maxTokens },
      }

      const updatedHistory = [newHistoryItem, ...history].slice(0, 50) // Keep last 50 items
      setHistory(updatedHistory)
      localStorage.setItem("generationHistory", JSON.stringify(updatedHistory))
    } catch (error) {
      console.error("Error generating data:", error)
      setError(error.message || "An unknown error occurred while generating data.")
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function handleModelSelect(model) {
    setSelectedModel(model.name)
    toast({
      title: "Model changed",
      description: `Now using ${model.displayName || model.name}`,
    })
  }

  function savePrompt() {
    if (!prompt) return

    const newPrompt = {
      id: Date.now(),
      text: prompt,
      timestamp: new Date().toISOString(),
    }

    const updatedPrompts = [newPrompt, ...savedPrompts]
    setSavedPrompts(updatedPrompts)
    localStorage.setItem("savedPrompts", JSON.stringify(updatedPrompts))

    toast({
      title: "Prompt saved",
      description: "Your prompt has been saved to the library.",
    })
  }

  function clearPrompt() {
    setPrompt("")
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  function clearResult() {
    setResult(null)
  }

  function copyToClipboard() {
    const textToCopy = typeof result === "object" ? JSON.stringify(result, null, 2) : result
    navigator.clipboard.writeText(textToCopy)
    toast({
      title: "Copied to clipboard",
      description: "The JSON data has been copied to your clipboard.",
    })
  }

  function downloadJson() {
    const element = document.createElement("a")
    const content = typeof result === "object" ? JSON.stringify(result, null, 2) : result
    const file = new Blob([content], { type: "application/json" })
    element.href = URL.createObjectURL(file)
    element.download = `gemini-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Downloaded",
      description: "The JSON data has been downloaded.",
    })
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen p-8">
        <div className="container mx-auto max-w-4xl">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 text-blue-600">Gemini JSON Generator</h1>
            <p className="text-gray-600 dark:text-gray-300">Powered by Google's advanced AI models</p>
          </header>

          <div className="flex justify-center items-center mb-6 space-x-4">
            <Link
              href="/mood-analyzer"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              Try Mood Analyzer
            </Link>
            <Link
              href="/journal-prompt"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Journal Prompt
            </Link>
            <Link
              href="/insights"
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Insights Dashboard
            </Link>
            <ThemeToggle />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Model Selection</h2>
            <ModelSelector
              availableModels={availableModels}
              selectedModel={selectedModel}
              onSelectModel={handleModelSelect}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create a Prompt</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <textarea
                  ref={textareaRef}
                  className="w-full h-40 p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  placeholder="Enter your prompt here... (e.g., 'Generate a JSON object with user profile data including name, age, and interests')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                ></textarea>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Generating..." : "Generate JSON"}
                </button>
                <button
                  type="button"
                  onClick={savePrompt}
                  disabled={!prompt}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Save Prompt
                </button>
                <button
                  type="button"
                  onClick={clearPrompt}
                  disabled={!prompt}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md">
                {error}
              </div>
            )}

            {result && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Generated JSON</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === "content" ? "raw" : "content")}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    >
                      {viewMode === "content" ? "View Raw" : "View Formatted"}
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    >
                      Copy
                    </button>
                    <button
                      onClick={downloadJson}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    >
                      Download
                    </button>
                    <button
                      onClick={clearResult}
                      className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-4 overflow-auto max-h-96">
                  {viewMode === "content" ? (
                    <pre className="text-sm whitespace-pre-wrap break-words">{JSON.stringify(result, null, 2)}</pre>
                  ) : (
                    <pre className="text-sm overflow-x-auto">{JSON.stringify(result)}</pre>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
