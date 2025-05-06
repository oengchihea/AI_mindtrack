"use client"

import { useState } from "react"

export default function ContentView({ data }) {
  const [expanded, setExpanded] = useState({})

  const toggleSection = (section) => {
    setExpanded({
      ...expanded,
      [section]: !expanded[section],
    })
  }

  // Helper function to format keys for display
  const formatKey = (key) => {
    return key
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Check if the data has specific sections we can format nicely
  const hasDefinition = data && data.definition
  const hasComponents = data && data.components
  const hasTypes = data && data.types
  const hasFunctions = data && data.functions
  const hasInfluencingFactors = data && data.influencing_factors

  return (
    <div className="space-y-6">
      {/* Definition Section */}
      {hasDefinition && (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-2">Definition</h3>
          {typeof data.definition === "object" && data.definition !== null ? (
            <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
              {JSON.stringify(data.definition, null, 2)}
            </pre>
          ) : (
            <p className="text-gray-800 dark:text-gray-200">{String(data.definition)}</p>
          )}
        </div>
      )}

      {/* Components Section */}
      {hasComponents && (
        <div>
          <div
            className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 p-4 rounded-t-lg border border-purple-100 dark:border-purple-800 cursor-pointer"
            onClick={() => toggleSection("components")}
          >
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300">Components</h3>
            <span>{expanded.components ? "▼" : "▶"}</span>
          </div>

          {expanded.components && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-purple-100 dark:border-purple-800 space-y-4">
              {Object.entries(data.components).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium text-purple-600 dark:text-purple-400 mb-1">{formatKey(key)}</h4>
                  {typeof value === "object" && value !== null ? (
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Types Section */}
      {hasTypes && (
        <div>
          <div
            className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-4 rounded-t-lg border border-green-100 dark:border-green-800 cursor-pointer"
            onClick={() => toggleSection("types")}
          >
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Types</h3>
            <span>{expanded.types ? "▼" : "▶"}</span>
          </div>

          {expanded.types && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-green-100 dark:border-green-800 space-y-4">
              {Object.entries(data.types).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">{formatKey(key)}</h4>
                  {typeof value === "object" && value !== null ? (
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Functions Section */}
      {hasFunctions && (
        <div>
          <div
            className="flex items-center justify-between bg-amber-50 dark:bg-amber-900/20 p-4 rounded-t-lg border border-amber-100 dark:border-amber-800 cursor-pointer"
            onClick={() => toggleSection("functions")}
          >
            <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300">Functions</h3>
            <span>{expanded.functions ? "▼" : "▶"}</span>
          </div>

          {expanded.functions && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-amber-100 dark:border-amber-800 space-y-4">
              {Object.entries(data.functions).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-1">{formatKey(key)}</h4>
                  {typeof value === "object" && value !== null ? (
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Influencing Factors Section */}
      {hasInfluencingFactors && (
        <div>
          <div
            className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 p-4 rounded-t-lg border border-red-100 dark:border-red-800 cursor-pointer"
            onClick={() => toggleSection("influencing_factors")}
          >
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Influencing Factors</h3>
            <span>{expanded.influencing_factors ? "▼" : "▶"}</span>
          </div>

          {expanded.influencing_factors && (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-red-100 dark:border-red-800 space-y-4">
              {Object.entries(data.influencing_factors).map(([key, value]) => (
                <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0">
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">{formatKey(key)}</h4>
                  {typeof value === "object" && value !== null ? (
                    <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                      {JSON.stringify(value, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Properties */}
      {data &&
        Object.entries(data)
          .filter(([key]) => !["definition", "components", "types", "functions", "influencing_factors"].includes(key))
          .map(([key, value]) => (
            <div key={key}>
              <div
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-t-lg border border-gray-200 dark:border-gray-600 cursor-pointer"
                onClick={() => toggleSection(key)}
              >
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{formatKey(key)}</h3>
                <span>{expanded[key] ? "▼" : "▶"}</span>
              </div>

              {expanded[key] && typeof value === "object" ? (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-600 space-y-4">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <div
                      key={subKey}
                      className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0 last:pb-0"
                    >
                      <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-1">{formatKey(subKey)}</h4>
                      {typeof subValue === "object" && subValue !== null ? (
                        <pre className="text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                          {JSON.stringify(subValue, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300">{String(subValue)}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : expanded[key] ? (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg border-x border-b border-gray-200 dark:border-gray-600">
                  <p className="text-gray-700 dark:text-gray-300">{String(value)}</p>
                </div>
              ) : null}
            </div>
          ))}
    </div>
  )
}

