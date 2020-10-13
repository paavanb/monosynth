import * as Tone from 'tone'

interface ScaledEnvelopeOptions {
  min: number
  max: number
}

/**
 * ASDR Envelope scaled to a given min-max value instead of [0, 1]
 */
export default class ScaledEnvelope extends Tone.Envelope {
  readonly name: string = 'PitchEnvelope'

  private scale: Tone.Scale

  constructor(options: Partial<Tone.EnvelopeOptions> & ScaledEnvelopeOptions) {
    super({
      ...options,
      sustain: 0.5,
    })

    const { min, max } = options
    this.scale = this.output = new Tone.Scale({
      context: this.context,
      min,
      max,
    })

    this._sig.connect(this.scale)
  }

  get min(): number {
    return this.scale.min
  }

  set min(val: number) {
    this.scale.min = val
  }

  get max(): number {
    return this.scale.max
  }

  set max(val: number) {
    this.scale.max = val
  }

  public dispose(): this {
    super.dispose()
    this.scale.dispose()
    return this
  }
}
