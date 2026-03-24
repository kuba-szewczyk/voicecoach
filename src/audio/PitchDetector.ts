import { PitchDetector as Pitchy } from 'pitchy'
import { MicInput } from './MicInput'
import { EffortAnalyser, type EffortData } from './EffortAnalyser'

export interface PitchData {
  hz: number
  clarity: number
}

export interface AudioFrameData {
  pitch: PitchData | null
  effort: EffortData
}

export type AudioFrameCallback = (data: AudioFrameData) => void

const CLARITY_THRESHOLD = 0.9
const MIN_HZ = 50
const MAX_HZ = 500

export class PitchDetector {
  private micInput = new MicInput()
  private workletNode: AudioWorkletNode | null = null
  private effortAnalyser: EffortAnalyser | null = null
  private callback: AudioFrameCallback | null = null
  private running = false

  async start(callback: AudioFrameCallback) {
    this.callback = callback
    this.running = true

    const { audioContext, sourceNode, analyserNode } = await this.micInput.start()

    this.effortAnalyser = new EffortAnalyser(analyserNode, audioContext.sampleRate)

    await audioContext.audioWorklet.addModule('/audio-processor.worklet.js')

    this.workletNode = new AudioWorkletNode(audioContext, 'pitch-accumulator')

    this.workletNode.port.onmessage = (event: MessageEvent) => {
      if (!this.running) return

      const { samples } = event.data as { samples: Float32Array }
      const detector = Pitchy.forFloat32Array(samples.length)
      const [hz, clarity] = detector.findPitch(samples, audioContext.sampleRate)

      let pitch: PitchData | null = null
      let effort: EffortData

      if (clarity >= CLARITY_THRESHOLD && hz >= MIN_HZ && hz <= MAX_HZ) {
        pitch = { hz, clarity }
        effort = this.effortAnalyser!.analyse(hz)
      } else {
        effort = this.effortAnalyser!.markInvalid()
      }

      this.callback?.({ pitch, effort })
    }

    sourceNode.connect(this.workletNode)
  }

  stop() {
    this.running = false
    if (this.workletNode) {
      this.workletNode.disconnect()
      this.workletNode = null
    }
    this.effortAnalyser?.reset()
    this.effortAnalyser = null
    this.micInput.stop()
    this.callback = null
  }

  isRunning(): boolean {
    return this.running
  }
}
