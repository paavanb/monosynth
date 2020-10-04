import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

const scaleFilter = scalePow().exponent(2).domain([0, 5000]).range([0, 5000])

const formatFreq = format(',d')

interface FilterControllerProps {
  filterEnvelope: Tone.FrequencyEnvelope
}

export default function FilterController(
  props: FilterControllerProps
): JSX.Element {
  const { filterEnvelope } = props
  const [freq, setFreq] = useState(filterEnvelope.baseFrequency)

  useEffect(() => {
    const val = scaleFilter(Tone.Frequency(freq).toFrequency())
    if (val) filterEnvelope.baseFrequency = val
  }, [freq, filterEnvelope])

  return (
    <form>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Frequency
          <input
            type="range"
            min="0"
            max="5000"
            value={freq}
            onChange={(evt) => setFreq(evt.target.value)}
          />
        </label>
        <output>
          {formatFreq(Tone.Frequency(filterEnvelope.baseFrequency))} Hz
        </output>
      </div>
    </form>
  )
}
