import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import cs from './styles.module.css'

const scaleFilter = scalePow().exponent(2).domain([0, 5000]).range([0, 5000])

const formatFreq = format(',d')

interface FilterOption {
  name: string
  value: BiquadFilterType
}

const FILTER_OPTIONS: FilterOption[] = [
  {
    name: 'Low-pass',
    value: 'lowpass',
  },
  {
    name: 'High-pass',
    value: 'highpass',
  },
  {
    name: 'Band-pass',
    value: 'bandpass',
  },
  {
    name: 'All-pass',
    value: 'allpass',
  },
  {
    name: 'Low-shelf',
    value: 'lowshelf',
  },
  {
    name: 'High-shelf',
    value: 'highshelf',
  },
  {
    name: 'Notch',
    value: 'notch',
  },
  {
    name: 'Peaking',
    value: 'peaking',
  },
]

interface FilterControllerProps {
  filterEnvelope: Tone.FrequencyEnvelope
  filter: Tone.Filter
}

export default function FilterController(
  props: FilterControllerProps
): JSX.Element {
  const { filterEnvelope, filter } = props
  const [sliderFreq, setSliderFreq] = useState(
    scaleFilter.invert(
      Tone.Frequency(filterEnvelope.baseFrequency).toFrequency()
    )
  )
  const [sliderQ, setSliderQ] = useState(1)
  const [filterType, setFilterType] = useState<BiquadFilterType>('lowpass')

  // syncEnvelopeFrequency
  useEffect(() => {
    const val = scaleFilter(Tone.Frequency(sliderFreq).toFrequency())
    if (val) filterEnvelope.baseFrequency = val
  }, [sliderFreq, filterEnvelope])

  // syncEnvelopeFrequency
  useEffect(() => {
    const now = Tone.now()
    filter.Q.cancelScheduledValues(now)
    filter.Q.setValueAtTime(sliderQ, now)
  }, [sliderQ, filter.Q])

  // syncFilterType
  useEffect(() => {
    filter.type = filterType
  }, [filterType, filter])

  return (
    <form>
      <div className={cs.control}>
        <label>
          Type
          <select
            name="filter-type"
            value={filterType}
            onChange={(evt) =>
              setFilterType(evt.target.value as BiquadFilterType)
            }
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={cs.control}>
        <label>
          Frequency
          <input
            type="range"
            min="0"
            max="5000"
            value={sliderFreq}
            onChange={(evt) => setSliderFreq(parseInt(evt.target.value))}
          />
        </label>
        <output>
          {formatFreq(Tone.Frequency(filterEnvelope.baseFrequency))} Hz
        </output>
      </div>
      <div className={cs.control}>
        <label>
          Quality
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={sliderQ}
            onChange={(evt) => setSliderQ(parseFloat(evt.target.value))}
          />
        </label>
        <output>{sliderQ}</output>
      </div>
    </form>
  )
}
