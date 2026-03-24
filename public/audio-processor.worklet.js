class PitchAccumulatorProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this.bufferSize = 2048
    this.hopSize = 1024
    this.ringBuffer = new Float32Array(this.bufferSize)
    this.writePtr = 0
    this.samplesAccumulated = 0
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || !input[0]) return true

    const channelData = input[0]

    for (let i = 0; i < channelData.length; i++) {
      this.ringBuffer[this.writePtr] = channelData[i]
      this.writePtr = (this.writePtr + 1) % this.bufferSize
      this.samplesAccumulated++

      if (this.samplesAccumulated >= this.hopSize) {
        this.samplesAccumulated = 0

        // Build the analysis window from the ring buffer
        const analysisBuffer = new Float32Array(this.bufferSize)
        for (let j = 0; j < this.bufferSize; j++) {
          analysisBuffer[j] = this.ringBuffer[(this.writePtr + j) % this.bufferSize]
        }

        this.port.postMessage({ samples: analysisBuffer })
      }
    }

    return true
  }
}

registerProcessor('pitch-accumulator', PitchAccumulatorProcessor)
