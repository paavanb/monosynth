import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import ScaledRangeInput from '../ScaledRangeInput'

import cs from './styles.module.css'

const scaleFreq = scalePow([0, 5000], [0, 5000]).exponent(2)

const formatFreq = format(',d')

const formatQuality = format('.2f')

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

const FILTERS_WITH_GAIN = new Set(['lowshelf', 'highshelf', 'peaking'])

interface FilterControllerProps {
  filterEnvelope: Tone.FrequencyEnvelope
  filter: Tone.Filter
}

export default function FilterController(
  props: FilterControllerProps
): JSX.Element {
  const { filterEnvelope, filter } = props
  const [filterType, setFilterType] = useState<BiquadFilterType>('lowpass')
  const [freq, setFreq] = useState(
    Tone.Frequency(filterEnvelope.baseFrequency).toFrequency()
  )
  const [quality, setQuality] = useState(1)
  const [gain, setGain] = useState(0)

  // syncFilterFrequency
  useEffect(() => {
    filterEnvelope.baseFrequency = freq
  }, [freq, filterEnvelope])

  // syncFilterQuality
  useEffect(() => {
    const now = Tone.now()
    filter.Q.cancelScheduledValues(now)
    filter.Q.setValueAtTime(quality, now)
  }, [quality, filter.Q])

  // syncFilterGain
  useEffect(() => {
    const now = Tone.now()
    filter.gain.cancelScheduledValues(now)
    filter.gain.setValueAtTime(gain, now)
  }, [gain, filter])

  // syncFilterType
  useEffect(() => {
    filter.type = filterType
  }, [filterType, filter])

  return (
    <form style={{ textAlign: 'center' }}>
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
          <span>
            Frequency
            <output>{formatFreq(freq)} Hz</output>
          </span>
          <ScaledRangeInput
            scale={scaleFreq}
            min="0"
            max="5000"
            value={freq}
            onUpdate={setFreq}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            Quality
            <output>{formatQuality(quality)}</output>
          </span>
          <ScaledRangeInput
            type="range"
            min="0.01"
            max="50"
            step="0.01"
            scale={scalePow([0.01, 50], [0.01, 50]).exponent(2)}
            value={quality}
            onUpdate={setQuality}
          />
        </label>
      </div>
      {FILTERS_WITH_GAIN.has(filterType) && (
        <div className={cs.control}>
          <label>
            <span>
              Gain
              <output>{gain}</output>
            </span>
            <input
              type="range"
              min="-25"
              max="25"
              step="0.1"
              value={gain}
              onChange={(evt) => setGain(parseFloat(evt.target.value))}
            />
          </label>
        </div>
      )}
    </form>
  )
}
