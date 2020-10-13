import React from 'react'
import { useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'

import cs from './styles.module.css'

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth'

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
  {
    label: 'Pulse Width',
    value: 'pwm',
  },
]

interface VCOProps {
  oscillator: Tone.OmniOscillator<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function VCO(props: VCOProps): JSX.Element {
  const { oscillator } = props
  const [oscType, setOscType] = useState<OscillatorType>('square')
  const [modulationType, setModulationType] = useState<string>('')

  // syncOscillatorType
  useEffect(() => {
    if (modulationType === 'pwm') {
      oscillator.type = 'pwm'
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
    </form>
  )
}
