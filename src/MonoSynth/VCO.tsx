import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'
import { scaleLinear } from 'd3-scale'
import { piecewise, interpolateNumber } from 'd3-interpolate'

import cs from './styles.module.css'

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'pulse'

const dutyCycleFormat = format('.0%')
const semitoneFormat = (v: number) => `${format('.1f')(v)} st`
// Map from # semitones offset from the center to the frequency ratio (e.g., 4:3 = perfect fifth up)
// https://en.wikipedia.org/wiki/Interval_(music)#Size_of_intervals_used_in_different_tuning_systems
const harmonicityInterpolator = piecewise(interpolateNumber, [
  1 / 2, // Perfect octave down
  8 / 15, // Major seventh down
  9 / 16, // Minor seventh down, etc
  3 / 5,
  5 / 8,
  2 / 3,
  32 / 45,
  3 / 4,
  4 / 5,
  5 / 6,
  8 / 9,
  15 / 16,
  1 / 1, // Perfect unison
  16 / 15,
  9 / 8,
  6 / 5,
  5 / 4,
  4 / 3,
  45 / 32,
  3 / 2,
  8 / 5,
  5 / 3,
  16 / 9,
  15 / 8,
  2 / 1, // Perfect octave up
])

const semitoneScale = scaleLinear([-12, 12], [0, 1])
const semitoneToHarmonicity = (semitones: number) =>
  harmonicityInterpolator(semitoneScale(semitones) as number)

const OSCILLATOR_OPTIONS = [
  {
    label: 'Sine',
    value: 'sine',
  },
  {
    label: 'Triangle',
    value: 'triangle',
  },
  {
    label: 'Sawtooth',
    value: 'sawtooth',
  },
  {
    label: 'Square',
    value: 'square',
  },
  {
    label: 'Pulse',
    value: 'pulse',
  },
]

const MODULATION_OPTIONS = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Frequency',
    value: 'fm',
  },
  {
    label: 'Amplitude',
    value: 'am',
  },
  {
    label: 'Fat',
    value: 'fat',
  },
]

interface OscillatorControllerProps<
  T extends Tone.PulseOscillator | Tone.AMOscillator | Tone.FMOscillator
> {
  oscillator: Tone.OmniOscillator<T>
}

function PulseOscillatorControls(
  props: OscillatorControllerProps<Tone.PulseOscillator>
): JSX.Element {
  const { oscillator } = props
  // Width is in [-1, 0, 1]
  const [width, setWidth] = useState(0)
  // Duty cycle is in [0, 1]
  const dutyCycle = (width + 1) / 2

  // syncWidth
  useEffect(() => {
    // Sometimes while switching oscillators, we render before Tonejs switches
    // So we have to check that width exists
    if (oscillator.width) {
      oscillator.width.setValueAtTime(width, Tone.now())
    }
  }, [width, oscillator.width])

  return (
    <div className={cs.control}>
      <label>
        <span>
          Width
          <output>{dutyCycleFormat(dutyCycle)}</output>
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={dutyCycle}
          onChange={(evt) => setWidth(parseFloat(evt.target.value) * 2 - 1)}
        />
      </label>
    </div>
  )
}

function HarmonicOscillatorControls<
  T extends Tone.AMOscillator | Tone.FMOscillator
>(props: OscillatorControllerProps<T>): JSX.Element {
  const { oscillator } = props
  // Set the semitone offset between the carrier and modulating frequencies
  const [semitones, setSemitones] = useState(0)

  // syncHarmonicity
  useEffect(() => {
    // Sometimes while switching oscillators, we render before Tonejs switches
    // So we have to check that harmonicity exists
    if (oscillator.harmonicity) {
      const harmonicity = semitoneToHarmonicity(semitones)
      oscillator.harmonicity.setValueAtTime(harmonicity, Tone.now())
    }
  }, [semitones, oscillator.harmonicity])

  return (
    <div className={cs.control}>
      <label>
        <span>
          Harmonicity
          <output>{semitoneFormat(semitones)}</output>
        </span>
        <input
          type="range"
          min="-12"
          max="12"
          step="0.1"
          value={semitones}
          onChange={(evt) => setSemitones(parseFloat(evt.target.value))}
        />
      </label>
    </div>
  )
}

interface VCOProps {
  oscillator: Tone.OmniOscillator<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VCO(props: VCOProps): JSX.Element {
  const { oscillator } = props
  // @ts-ignore Tonejs doesn't export the OmniOscillatorType for us to use
  const [oscType, setOscType] = useState<OscillatorType>(oscillator.type)
  const [modulationType, setModulationType] = useState<string>('')

  // syncOscillatorType
  useEffect(() => {
    if (oscType === 'pulse') {
      oscillator.type = 'pulse'
    } else {
      // @ts-ignore Tonejs doesn't export the OmniOscillatorType for us to coerce
      oscillator.type = modulationType + oscType
    }
  }, [oscillator, oscType, modulationType])

  return (
    <form style={{ textAlign: 'center', width: 300 }}>
      <div className={cs.inlineControl}>
        <label>
          <span>Type</span>
          <select
            name="osc-type"
            value={oscType}
            onChange={(evt) => setOscType(evt.target.value as OscillatorType)}
          >
            {OSCILLATOR_OPTIONS.map((options) => (
              <option key={options.value} value={options.value}>
                {options.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {oscType !== 'pulse' && (
        <div className={cs.inlineControl}>
          <label>
            <span>Modulation</span>
            <select
              name="osc-type"
              value={modulationType}
              onChange={(evt) => setModulationType(evt.target.value)}
            >
              {MODULATION_OPTIONS.map((options) => (
                <option key={options.value} value={options.value}>
                  {options.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
      {oscType === 'pulse' && (
        <PulseOscillatorControls oscillator={oscillator} />
      )}
      {oscType !== 'pulse' &&
        (modulationType === 'fm' || modulationType === 'am') && (
          <HarmonicOscillatorControls oscillator={oscillator} />
        )}
    </form>
  )
}
