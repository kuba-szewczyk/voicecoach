import { writable } from 'svelte/store'
import type { Complexity } from '../data/wordBanks'

function persistedStore<T>(key: string, initial: T) {
  let stored: string | null = null
  try {
    stored = localStorage.getItem(key)
  } catch {
    // localStorage unavailable (private browsing on iOS)
  }

  const store = writable<T>(stored ? JSON.parse(stored) : initial)

  store.subscribe((value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Silently fail if localStorage is full or unavailable
    }
  })

  return store
}

export const targetPitchRange = persistedStore<{ low: number; high: number } | null>(
  'voicecoach:targetPitchRange',
  null,
)

export const effortBaseline = persistedStore<{ mean: number; std: number } | null>(
  'voicecoach:effortBaseline',
  null,
)

export const effortThreshold = persistedStore<number>('voicecoach:effortThreshold', 3)

// Flat word pool — auto-classified into short/medium/long by word count
export const wordPool = persistedStore<string[]>('voicecoach:wordPool', [])

// Selected word complexity for sessions
export const wordComplexity = persistedStore<Complexity>('voicecoach:wordComplexity', 'short')

export const sessionDuration = persistedStore<number>('voicecoach:sessionDuration', 5)

// Daily session completion tracker — array of ISO date strings (YYYY-MM-DD)
export const completedDays = persistedStore<string[]>('voicecoach:completedDays', [])
