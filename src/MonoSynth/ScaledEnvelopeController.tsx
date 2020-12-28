import React from 'react'
import { useState, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import ScaledRangeInput from '../ScaledRangeInput'

import ScaledEnvelope from './ScaledEnvelope'
import ToneViz from './ToneViz'
import { BasicEnvelopeCurve, EnvelopeCurve } from './types'
import EnvelopeCurveController from './EnvelopeCurveController'
import cs from './styles.module.css'

const MAX_ONSET_DURATION = 4
const SUSTAIN_DURATION = 0.5
const MAX_RELEASE = 4
const TOTAL_WIDTH_DURATION = MAX_ONSET_DURATION + SUSTAIN_DURATION + MAX_RELEASE

// NOTE: 3000 seems to be the minimum for at least Chrome
const ENVELOPE_SAMPLE_RATE = 3000

const scaleOnsetDuration = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatTime = format('.2f')
const formatPercent = format('.1%')
const VIZ_BOUNDS: [number, number] = [-2400, 2400]

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

  const [attackCurve, setAttackCurve] = useState<EnvelopeCurve>(
    envelope.attackCurve as EnvelopeCurve
  )
  const [decayCurve, setDecayCurve] = useState<BasicEnvelopeCurve>(
    envelope.decayCurve
  )
  const [releaseCurve, setReleaseCurve] = useState<EnvelopeCurve>(
    envelope.releaseCurve as EnvelopeCurve
  )

  const recordEnvelope = useCallback(
    (context: Tone.Context) => {
      const env = new ScaledEnvelope({
        context,
        attack: percentAttack * onsetDuration,
        decay: (1 - percentAttack) * onsetDuration,
        release,
        attackCurve,
        decayCurve,
        releaseCurve,
        min: envelopeMin,
        max: envelopeMax,
        fixedSustain: 0,
      }).toDestination()
      env.triggerAttackRelease(onsetDuration + SUSTAIN_DURATION)
    },
    [
      percentAttack,
      onsetDuration,
      release,
      attackCurve,
      decayCurve,
      releaseCurve,
      envelopeMin,
      envelopeMax,
    ]
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

  // syncCurves
  useEffect(() => {
    envelope.attackCurve = attackCurve
    envelope.decayCurve = decayCurve
    envelope.releaseCurve = releaseCurve
  }, [envelope, attackCurve, decayCurve, releaseCurve])

  return (
    <div>
      <ToneViz
        contextRecorder={recordEnvelope}
        recordDuration={TOTAL_WIDTH_DURATION}
        bounds={VIZ_BOUNDS}
        sampleRate={ENVELOPE_SAMPLE_RATE}
      />
      <div className={cs.control}>
        <label>
          <span>
            Onset
            <output>{formatTime(onsetDuration)}s</output>
          </span>
          <ScaledRangeInput
            scale={scaleOnsetDuration}
            min={0.01}
            max={MAX_ONSET_DURATION}
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
            max={MAX_RELEASE}
            step="0.1"
            value={release}
            onChange={(evt) => setRelease(parseFloat(evt.target.value))}
          />
        </label>
      </div>
      <EnvelopeCurveController
        attackCurve={attackCurve}
        onAttackCurveChange={setAttackCurve}
        decayCurve={decayCurve}
        onDecayCurveChange={setDecayCurve}
        releaseCurve={releaseCurve}
        onReleaseCurveChange={setReleaseCurve}
      />
    </div>
  )
}
