export interface EffortData {
  h1h2: number    // dB difference between H1 and H2
  valid: boolean  // false when F0 unknown or clarity too low
}

const EMA_ALPHA = 0.15
const PEAK_SEARCH_BINS = 2 // search +/- this many bins around expected harmonic

export class EffortAnalyser {
  private analyserNode: AnalyserNode
  private sampleRate: number
  private frequencyData: Float32Array
  private smoothedH1H2: number | null = null

  constructor(analyserNode: AnalyserNode, sampleRate: number) {
    this.analyserNode = analyserNode
    this.sampleRate = sampleRate
    this.frequencyData = new Float32Array(analyserNode.frequencyBinCount)
  }

  /**
   * Compute H1-H2 given the current F0.
   * Call this each time a valid pitch is detected.
   */
  analyse(f0: number): EffortData {
    if (f0 <= 0) return { h1h2: 0, valid: false }

    this.analyserNode.getFloatFrequencyData(this.frequencyData)

    const binResolution = this.sampleRate / this.analyserNode.fftSize

    // Find H1 (fundamental) amplitude
    const h1Bin = Math.round(f0 / binResolution)
    const h1Db = this.peakInRange(h1Bin)

    // Find H2 (second harmonic) amplitude
    const h2Bin = Math.round((2 * f0) / binResolution)
    const h2Db = this.peakInRange(h2Bin)

    if (h1Db === null || h2Db === null) return { h1h2: 0, valid: false }

    const rawH1H2 = h1Db - h2Db

    // Apply EMA smoothing
    if (this.smoothedH1H2 === null) {
      this.smoothedH1H2 = rawH1H2
    } else {
      this.smoothedH1H2 = EMA_ALPHA * rawH1H2 + (1 - EMA_ALPHA) * this.smoothedH1H2
    }

    return { h1h2: this.smoothedH1H2, valid: true }
  }

  /**
   * Call when no valid pitch is detected — decays the smoothed value.
   */
  markInvalid(): EffortData {
    return { h1h2: this.smoothedH1H2 ?? 0, valid: false }
  }

  reset() {
    this.smoothedH1H2 = null
  }

  private peakInRange(centerBin: number): number | null {
    const minBin = Math.max(0, centerBin - PEAK_SEARCH_BINS)
    const maxBin = Math.min(this.frequencyData.length - 1, centerBin + PEAK_SEARCH_BINS)

    let peak = -Infinity
    for (let i = minBin; i <= maxBin; i++) {
      if (this.frequencyData[i] > peak) {
        peak = this.frequencyData[i]
      }
    }

    // getFloatFrequencyData returns -Infinity for empty bins
    return peak === -Infinity ? null : peak
  }
}
