export type Complexity = 'short' | 'medium' | 'long'

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; description: string }> = {
  short: { label: 'Short', description: 'Single words' },
  medium: { label: 'Medium', description: 'Short phrases' },
  long: { label: 'Long', description: 'Full sentences' },
}

/**
 * Get a shuffled list of words for a session from the given pool.
 */
export function getSessionWords(pools: Record<Complexity, string[]>, complexity: Complexity): string[] {
  const bank = [...pools[complexity]]
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]]
  }
  return bank
}
