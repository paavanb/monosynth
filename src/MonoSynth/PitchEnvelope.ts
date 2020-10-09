import * as Tone from 'tone'

export default class PitchEnvelope extends Tone.Envelope {
  readonly name: string = 'PitchEnvelope'

  private scale: Tone.Scale

  private exponent: Tone.Pow

  constructor() {
    super({
      sustain: 0.5
    })

    this.exponent = this.input = new Tone.Pow({
      context: this.context,
      value: 1,
    })

    this.scale = this.output = new Tone.Scale({
      context: this.context,
      min: -2400,
      max: 2400,
    })

    this._sig.chain(this.exponent, this.scale)
  }

  public dispose(): this {
    super.dispose()
    this.exponent.dispose()
    this.scale.dispose()
    return this
  }
}
