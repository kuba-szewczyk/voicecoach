const FFT_SIZE = 4096

export interface AudioNodes {
  audioContext: AudioContext
  sourceNode: MediaStreamAudioSourceNode
  analyserNode: AnalyserNode
}

export class MicInput {
  private stream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private analyserNode: AnalyserNode | null = null

  async start(): Promise<AudioNodes> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    })

    this.audioContext = new AudioContext({ latencyHint: 0 } as AudioContextOptions)

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream)

    // AnalyserNode for FFT-based harmonic analysis (H1-H2)
    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = FFT_SIZE
    this.analyserNode.smoothingTimeConstant = 0 // We do our own EMA smoothing
    this.sourceNode.connect(this.analyserNode)

    return {
      audioContext: this.audioContext,
      sourceNode: this.sourceNode,
      analyserNode: this.analyserNode,
    }
  }

  stop() {
    if (this.analyserNode) {
      this.analyserNode.disconnect()
      this.analyserNode = null
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect()
      this.sourceNode = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop())
      this.stream = null
    }
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext
  }

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode
  }
}
