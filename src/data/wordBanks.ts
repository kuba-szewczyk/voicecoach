export type Complexity = 'short' | 'medium' | 'long'

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; description: string }> = {
  short: { label: 'Short', description: 'Single words' },
  medium: { label: 'Medium', description: '2–3 word phrases' },
  long: { label: 'Long', description: '4+ word phrases' },
}

/**
 * Classify a word or phrase into a complexity level by word count.
 *   1 word  → short
 *   2-3 words → medium
 *   4+ words  → long
 */
export function classifyEntry(entry: string): Complexity {
  const wordCount = entry.trim().split(/\s+/).length
  if (wordCount <= 1) return 'short'
  if (wordCount <= 3) return 'medium'
  return 'long'
}

/**
 * Classify a flat list of entries into the three complexity buckets.
 */
export function classifyAll(entries: string[]): Record<Complexity, string[]> {
  const result: Record<Complexity, string[]> = { short: [], medium: [], long: [] }
  for (const entry of entries) {
    const trimmed = entry.trim()
    if (trimmed.length > 0) {
      result[classifyEntry(trimmed)].push(trimmed)
    }
  }
  return result
}

/**
 * Get a shuffled list of words for a session from the given complexity bucket.
 */
export function getSessionWords(allWords: string[], complexity: Complexity): string[] {
  const classified = classifyAll(allWords)
  const bank = [...classified[complexity]]
  // Fisher-Yates shuffle
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]]
  }
  return bank
}
