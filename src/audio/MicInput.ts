export class MicInput {
  private stream: MediaStream | null = null
  private audioContext: AudioContext | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null

  async start(): Promise<{ audioContext: AudioContext; sourceNode: MediaStreamAudioSourceNode }> {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        channelCount: 1,
      },
    })

    this.audioContext = new AudioContext({ latencyHint: 0 } as AudioContextOptions)

    // iOS Safari requires resume from user gesture
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }

    this.sourceNode = this.audioContext.createMediaStreamSource(this.stream)

    return { audioContext: this.audioContext, sourceNode: this.sourceNode }
  }

  stop() {
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
}
