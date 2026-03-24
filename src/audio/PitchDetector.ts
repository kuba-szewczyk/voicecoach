import { PitchDetector as Pitchy } from 'pitchy'
import { MicInput } from './MicInput'

export interface PitchData {
  hz: number
  clarity: number
}

export type PitchCallback = (data: PitchData | null) => void

const CLARITY_THRESHOLD = 0.9
const MIN_HZ = 50
const MAX_HZ = 500

export class PitchDetector {
  private micInput = new MicInput()
  private workletNode: AudioWorkletNode | null = null
  private callback: PitchCallback | null = null
  private running = false

  async start(callback: PitchCallback) {
    this.callback = callback
    this.running = true

    const { audioContext, sourceNode } = await this.micInput.start()

    await audioContext.audioWorklet.addModule('/audio-processor.worklet.js')

    this.workletNode = new AudioWorkletNode(audioContext, 'pitch-accumulator')

    this.workletNode.port.onmessage = (event: MessageEvent) => {
      if (!this.running) return

      const { samples } = event.data as { samples: Float32Array }
      const detector = Pitchy.forFloat32Array(samples.length)
      const [hz, clarity] = detector.findPitch(samples, audioContext.sampleRate)

      if (clarity >= CLARITY_THRESHOLD && hz >= MIN_HZ && hz <= MAX_HZ) {
        this.callback?.({ hz, clarity })
      } else {
        this.callback?.(null)
      }
    }

    sourceNode.connect(this.workletNode)
    // Don't connect worklet to destination — we don't want playback
  }

  stop() {
    this.running = false
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    this.micInput.stop()
    this.callback = null
  }

  isRunning(): boolean {
    return this.running
  }
}
