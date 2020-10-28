import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import { SelectOption } from '../types'
import ScaledRangeInput from '../ScaledRangeInput'

import EnvelopeViz from './EnvelopeViz'
import { BasicEnvelopeCurve, EnvelopeCurve } from './types'
import cs from './styles.module.css'

const scaleOnsetDuration = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatTime = format('.2f')
const formatPercent = format('.1%')

const BASIC_CURVE_OPTIONS: SelectOption<BasicEnvelopeCurve>[] = [
  { label: 'Linear', value: 'linear' as const },
  { label: 'Exponential', value: 'exponential' as const },
]

const ALL_CURVE_OPTIONS: SelectOption<EnvelopeCurve>[] = [
  { label: 'Linear', value: 'linear' as const },
  { label: 'Exponential', value: 'exponential' as const },
  { label: 'Sine', value: 'sine' as const },
  { label: 'Cosine', value: 'cosine' as const },
  { label: 'Bounce', value: 'bounce' as const },
  { label: 'Ripple', value: 'ripple' as const },
  { label: 'Step', value: 'step' as const },
]

interface EnvelopeControllerProps {
  envelope: Tone.Envelope
}

export default function EnvelopeController(
  props: EnvelopeControllerProps
): JSX.Element {
  const { envelope } = props
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

  const [sustain, setSustain] = useState(envelope.sustain)

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

  // syncAttackDecay
  useEffect(() => {
    envelope.attack = onsetDuration * percentAttack
    envelope.decay = onsetDuration * (1 - percentAttack)
  }, [envelope, onsetDuration, percentAttack])

  // syncSustain
  useEffect(() => {
    envelope.sustain = sustain
  }, [envelope, sustain])

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
      <EnvelopeViz
        onsetDuration={onsetDuration}
        percentAttack={percentAttack}
        sustain={sustain}
        release={release}
        attackCurve={attackCurve}
        decayCurve={decayCurve}
        releaseCurve={releaseCurve}
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
            Sustain
            <output>{formatPercent(sustain)}</output>
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={sustain}
            onChange={(evt) => setSustain(parseFloat(evt.target.value))}
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
      <div className={cs.inlineControl}>
        <label>
          Attack Curve
          <select
            name="attack-curve"
            value={attackCurve}
            onChange={(evt) =>
              setAttackCurve(evt.target.value as EnvelopeCurve)
            }
          >
            {ALL_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={cs.inlineControl}>
        <label>
          Decay Curve
          <select
            name="decay-curve"
            value={decayCurve}
            onChange={(evt) =>
              setDecayCurve(evt.target.value as BasicEnvelopeCurve)
            }
          >
            {BASIC_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={cs.inlineControl}>
        <label>
          Release Curve
          <select
            name="release-curve"
            value={releaseCurve}
            onChange={(evt) =>
              setReleaseCurve(evt.target.value as EnvelopeCurve)
            }
          >
            {ALL_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
