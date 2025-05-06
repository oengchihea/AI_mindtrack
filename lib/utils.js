import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Helper function to format dates
export function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

// Helper function to calculate average from an array of numbers
export function calculateAverage(numbers) {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, val) => acc + val, 0)
  return Number.parseFloat((sum / numbers.length).toFixed(1))
}

// Helper function to find most frequent items in an array
export function findMostFrequent(arr) {
  const frequency = {}

  // Count occurrences
  arr.forEach((item) => {
    frequency[item] = (frequency[item] || 0) + 1
  })

  // Find the maximum frequency
  const maxFrequency = Math.max(...Object.values(frequency))

  // Return all items that have the maximum frequency
  return Object.keys(frequency).filter((item) => frequency[item] === maxFrequency)
}

