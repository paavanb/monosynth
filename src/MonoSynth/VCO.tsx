import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'

import cs from './styles.module.css'

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth' | 'pulse'

const dutyCycleFormat = format('.0%')

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

interface OscillatorControllerProps {
  oscillator: Tone.OmniOscillator<Tone.PulseOscillator>
}

function PulseOscillatorControls(
  props: OscillatorControllerProps
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
    if (oscillator.width) oscillator.width.setValueAtTime(width, Tone.now())
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

interface VCOProps {
  oscillator: Tone.OmniOscillator<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VCO(props: VCOProps): JSX.Element {
  const { oscillator } = props
  const [oscType, setOscType] = useState<OscillatorType>('square')
  const [modulationType, setModulationType] = useState<string>('')

  // syncOscillatorType
  useEffect(() => {
    if (oscType === 'pulse') {
      oscillator.type = 'pulse'
    } else {
      // Tonejs doesn't export the OmniOscillatorType for us to coerce
      // eslint-disable-next-line
      // @ts-ignore
      oscillator.type = modulationType + oscType
    }
  }, [oscillator, oscType, modulationType])

  return (
    <form style={{ textAlign: 'center', width: 300 }}>
      <div className={cs.inlineControl}>
        <label>
          <span>Oscillator Type</span>
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
            <span>Modulation Type</span>
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
    </form>
  )
}
