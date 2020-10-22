import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import ScaledRangeInput from '../ScaledRangeInput'

import ScaledEnvelope from './ScaledEnvelope'
import ScaledEnvelopeViz from './ScaledEnvelopeViz'
import cs from './styles.module.css'

const scaleOnsetDuration = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatTime = format('.2f')
const formatPercent = format('.1%')

interface ScaledEnvelopeControllerProps {
  envelope: ScaledEnvelope
  min: number
  minLabel: string
  formatMin: (val: number) => string
  max: number
  maxLabel: string
  formatMax: (val: number) => string
  step: number
}

export default function ScaledEnvelopeController(
  props: ScaledEnvelopeControllerProps
): JSX.Element {
  const {
    envelope,
    min,
    minLabel,
    formatMin,
    max,
    maxLabel,
    formatMax,
    step,
  } = props
  const [onsetDuration, setOnsetDuration] = useState(() => {
    const attack = Tone.Time(envelope.attack).toSeconds()
    const decay = Tone.Time(envelope.decay).toSeconds()
    return attack + decay
  })

  const [percentAttack, setPercentAttack] = useState(() => {
    const attack = Tone.Time(envelope.attack).toSeconds()
    const decay = Tone.Time(envelope.decay).toSeconds()
    const totalTime = attack + decay
    return attack / totalTime
  })

  const [envelopeMin, setEnvelopeMin] = useState(envelope.min)
  const [envelopeMax, setEnvelopeMax] = useState(envelope.max)

  const [release, setRelease] = useState(() =>
    Tone.Time(envelope.release).toSeconds()
  )

  // syncAttackDecay
  useEffect(() => {
    envelope.attack = onsetDuration * percentAttack
    envelope.decay = onsetDuration * (1 - percentAttack)
  }, [envelope, onsetDuration, percentAttack])

  // syncMin
  useEffect(() => {
    envelope.min = envelopeMin
  }, [envelope, envelopeMin])

  // syncMax
  useEffect(() => {
    envelope.max = envelopeMax
  }, [envelope, envelopeMax])

  // syncRelease
  useEffect(() => {
    envelope.release = release
  }, [envelope, release])

  return (
    <div>
      <ScaledEnvelopeViz
        onsetDuration={onsetDuration}
        percentAttack={percentAttack}
        min={min}
        max={max}
        envelopeMin={envelopeMin}
        envelopeMax={envelopeMax}
        release={release}
      />
      <div className={cs.control}>
        <label>
          <span>
            Onset
            <output>{formatTime(onsetDuration)}s</output>
          </span>
          <ScaledRangeInput
            scale={scaleOnsetDuration}
            min="0.01"
            max="4"
            step="0.01"
            value={onsetDuration}
            onUpdate={setOnsetDuration}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            Attack-Decay Split
            <output>{formatPercent(percentAttack)}</output>
          </span>
          <input
            type="range"
            min={0}
            max={0.999}
            step="0.001"
            value={percentAttack}
            onChange={(evt) => setPercentAttack(parseFloat(evt.target.value))}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            {minLabel}
            <output>{formatMin(envelopeMin)}</output>
          </span>
          <input
            type="range"
            min={min}
            max={envelope.fixedSustain}
            step={step}
            value={envelopeMin}
            onChange={(evt) => setEnvelopeMin(parseFloat(evt.target.value))}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            {maxLabel}
            <output>{formatMax(envelopeMax)}</output>
          </span>
          <input
            type="range"
            min={envelope.fixedSustain}
            max={max}
            step={step}
            value={envelopeMax}
            onChange={(evt) => setEnvelopeMax(parseFloat(evt.target.value))}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            Release
            <output>{formatTime(release)}s</output>
          </span>
          <input
            type="range"
            min={0.01}
            max={4}
            step="0.1"
            value={release}
            onChange={(evt) => setRelease(parseFloat(evt.target.value))}
          />
        </label>
      </div>
    </div>
  )
}
