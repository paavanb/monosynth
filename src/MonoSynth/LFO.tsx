import React from 'react'
import { useCallback, useState } from 'react'
import * as Tone from 'tone'

type OscillatorType = 'sine' | 'square' | 'triangle' | 'sawtooth'

interface LFOProps {
  oscillator: Tone.OmniOscillator<any>
}

export default function LFO(props: LFOProps): JSX.Element {
  const { oscillator } = props
  const [oscType, setOscType] = useState<OscillatorType>('square')

  const handleTypeChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const oscType = evt.target.value as OscillatorType
      setOscType(oscType)
      oscillator.type = oscType
    },
    [oscillator]
  )

  return (
    <form>
      <label>
        Sine
        <input
          type="radio"
          name="osc-type"
          value="sine"
          checked={oscType === 'sine'}
          onChange={handleTypeChange}
        />
      </label>
      <label>
        Square
        <input
          type="radio"
          name="osc-type"
          value="square"
          checked={oscType === 'square'}
          onChange={handleTypeChange}
        />
      </label>
      <label>
        Triangle
        <input
          type="radio"
          name="osc-type"
          value="triangle"
          checked={oscType === 'triangle'}
          onChange={handleTypeChange}
        />
      </label>
      <label>
        Sawtooth
        <input
          type="radio"
          name="osc-type"
          value="sawtooth"
          checked={oscType === 'sawtooth'}
          onChange={handleTypeChange}
        />
      </label>
    </form>
  )
}
