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

export const wordList = persistedStore<string[]>('voicecoach:wordList', [])

export const sessionDuration = persistedStore<number>('voicecoach:sessionDuration', 5)
