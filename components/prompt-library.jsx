"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog"

export default function PromptLibrary({ prompts, onUsePrompt, onDeletePrompt }) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredPrompts = searchTerm
    ? prompts.filter((p) => p.text.toLowerCase().includes(searchTerm.toLowerCase()))
    : prompts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Prompts</CardTitle>
        <CardDescription>Your collection of saved prompts</CardDescription>
        <div className="relative mt-2">
          <input
            type="text"
            placeholder="Search prompts..."
            className="w-full p-2 pl-8 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPrompts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No matching prompts found" : "No saved prompts yet"}
          </div>
        ) : (
          <div className="h-[400px] overflow-y-auto pr-1">
            <div className="space-y-4">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="mb-2 text-sm">
                      {prompt.text.length > 200 ? `${prompt.text.substring(0, 200)}...` : prompt.text}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {new Date(prompt.timestamp).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onUsePrompt(prompt.text)}>
                          Use
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this prompt from your library.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => onDeletePrompt(prompt.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

