import { writable } from 'svelte/store'

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

// Effort threshold: how far from baseline (in dB) before considered "out of range"
// Default: 1.5 * std, but stored as absolute dB value after calibration
export const effortThreshold = persistedStore<number>('voicecoach:effortThreshold', 3)

export const wordList = persistedStore<string[]>('voicecoach:wordList', [])

export const sessionDuration = persistedStore<number>('voicecoach:sessionDuration', 5)
