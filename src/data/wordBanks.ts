export type Complexity = 'short' | 'medium' | 'long'

export const DEFAULT_POOLS: Record<Complexity, string[]> = {
  short: [
    'Makes sense.',
    'Got it.',
    'Fair point.',
    "That's right.",
    'Good catch.',
    'Next steps.',
    'Top priority.',
    'Key takeaway.',
    'Action items.',
    'Bottom line.',
    'Red flag.',
    'Green light.',
    'Circle back.',
    'Follow up.',
    'Loop in.',
    'Sync with.',
  ],
  medium: [
    "What's the timeline on this?",
    "What's the status of that?",
    'Do we have clarity here?',
    "Let's circle back on this.",
    "I'll follow up with them.",
    'Keep everyone in the loop.',
    'We need to sync with legal.',
    'What are we missing here?',
    'How do we approach this?',
    "What's blocking us right now?",
  ],
  long: [
    'What are the next steps we need to take here?',
    'Can you walk me through the timeline on this project?',
    "Let's make sure we keep the team in the loop.",
    'I think we need to circle back with legal on that.',
    'Do we have clarity on what the priority is here?',
    "What's the key dependency that's blocking us right now?",
    "I'll follow up with them after this call today.",
    'We should coordinate with the product team this week.',
    'Can we get a decision on this by end of day?',
  ],
}

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; description: string }> = {
  short: { label: 'Short', description: 'Quick phrases' },
  medium: { label: 'Medium', description: 'Short questions' },
  long: { label: 'Long', description: 'Full sentences' },
}

/**
 * Get a shuffled list of words for a session.
 * Merges default built-in pool with any user-added words.
 */
export function getSessionWords(userPools: Record<Complexity, string[]>, complexity: Complexity): string[] {
  const defaults = DEFAULT_POOLS[complexity]
  const custom = userPools[complexity]
  // Combine defaults + user words, deduplicate
  const combined = [...new Set([...defaults, ...custom])]
  // Fisher-Yates shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]]
  }
  return combined
}
