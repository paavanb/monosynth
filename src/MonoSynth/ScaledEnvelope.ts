import * as Tone from 'tone'

interface ScaledEnvelopeOptions {
  min: number
  max: number
  // Updating min/max will also affect sustain value,
  //   in order to keep the sustained signal equal to `fixedSustain`
  fixedSustain: number
}

/**
 * ASDR Envelope scaled to a given min-max value instead of [0, 1]
 */
export default class ScaledEnvelope extends Tone.Envelope {
  readonly name: string = 'PitchEnvelope'

  private scale: Tone.Scale

  public readonly fixedSustain: number

  constructor(options: Partial<Tone.EnvelopeOptions> & ScaledEnvelopeOptions) {
    super({
      ...options,
      sustain: 0.5,
    })

    const { min, max, fixedSustain } = options
    this.fixedSustain = fixedSustain
    this.scale = this.output = new Tone.Scale({
      context: this.context,
      min,
      max,
    })

    this._sig.connect(this.scale)
    this.updateSustain()
  }

  private updateSustain() {
    if (this.fixedSustain < this.min || this.fixedSustain > this.max)
      throw new Error(
        `ValueError: Fixed value '${this.fixedSustain}' is outside of bounds (${this.min}, ${this.max}).`
      )

    // Set sustain such that the sustained signal will equal the fixedSustain value
    const difference = this.max - this.min
    if (difference !== 0)
      this.sustain = (this.fixedSustain - this.min) / (this.max - this.min)
    else this.sustain = this.fixedSustain
  }

  get min(): number {
    return this.scale.min
  }

  set min(val: number) {
    if (val > this.max)
      throw new Error(
        `Cannot set ScaledEnvelope min value to '${val}', since it is greater than the max value '${this.max}'`
      )
    this.scale.min = val
    this.updateSustain()
  }

  get max(): number {
    return this.scale.max
  }

  set max(val: number) {
    if (val < this.min)
      throw new Error(
        `Cannot set ScaledEnvelope max value to '${val}', since it is less than the max value '${this.min}'`
      )
    this.scale.max = val
    this.updateSustain()
  }

  public dispose(): this {
    super.dispose()
    this.scale.dispose()
    return this
  }
}
