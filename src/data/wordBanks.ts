export type Complexity = 'short' | 'medium' | 'long'

export const WORD_BANKS: Record<Complexity, string[]> = {
  short: [
    'hello', 'water', 'open', 'easy', 'calm',
    'home', 'light', 'warm', 'soft', 'kind',
    'blue', 'green', 'clear', 'cool', 'flow',
    'rest', 'moon', 'sun', 'rain', 'breeze',
    'hope', 'smile', 'peace', 'dream', 'wave',
    'tree', 'lake', 'stone', 'earth', 'air',
    'time', 'love', 'gold', 'wind', 'seed',
    'cloud', 'leaf', 'hill', 'song', 'bell',
  ],
  medium: [
    'morning', 'gentle', 'garden', 'river', 'sunset',
    'window', 'silver', 'meadow', 'feather', 'simple',
    'music', 'ocean', 'golden', 'forest', 'mountain',
    'pillow', 'blanket', 'lantern', 'harvest', 'dolphin',
    'balance', 'summer', 'autumn', 'winter', 'journey',
    'candle', 'silence', 'flower', 'rainbow', 'velvet',
    'anchor', 'whisper', 'compass', 'timber', 'crystal',
    'ember', 'harbor', 'cherry', 'willow', 'shadow',
  ],
  long: [
    'good morning everyone', 'have a wonderful day',
    'the weather is lovely', 'a walk in the garden',
    'thank you very much', 'the sun is shining bright',
    'a cup of warm tea', 'reading a good book',
    'the leaves are falling', 'waves on the shoreline',
    'a quiet afternoon', 'the birds are singing',
    'a gentle summer breeze', 'the mountain is peaceful',
    'flowers in the meadow', 'a clear blue sky today',
    'the candle flickers softly', 'walking along the river',
    'the harvest moon is rising', 'a blanket of fresh snow',
    'listening to the rainfall', 'the forest is so quiet',
    'a golden sunset evening', 'the stars are out tonight',
  ],
}

export const COMPLEXITY_LABELS: Record<Complexity, { label: string; description: string }> = {
  short: { label: 'Short', description: '1-2 syllable words' },
  medium: { label: 'Medium', description: 'Longer words' },
  long: { label: 'Long', description: 'Phrases & sentences' },
}

/**
 * Get a shuffled list of words for a session, combining
 * pre-populated bank with any user custom words.
 */
export function getSessionWords(complexity: Complexity, customWords: string[]): string[] {
  const bank = [...WORD_BANKS[complexity], ...customWords]
  // Fisher-Yates shuffle
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]]
  }
  return bank
}
