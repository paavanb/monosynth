import React from 'react'
import { useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import ScaledRangeInput from '../ScaledRangeInput'

import ToneViz from './ToneViz'
import { BasicEnvelopeCurve, EnvelopeCurve } from './types'
import cs from './styles.module.css'
import EnvelopeCurveController from './EnvelopeCurveController'

const MAX_ONSET_DURATION = 4
const SUSTAIN_DURATION = 0.5
const MAX_RELEASE = 4
const TOTAL_WIDTH_DURATION = MAX_ONSET_DURATION + SUSTAIN_DURATION + MAX_RELEASE

// NOTE: 3000 seems to be the minimum for at least Chrome
const ENVELOPE_SAMPLE_RATE = 3000

const scaleOnsetDuration = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatTime = format('.2f')
const formatPercent = format('.1%')

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

  const recordEnvelope = useCallback(
    (context: Tone.Context) => {
      const env = new Tone.Envelope({
        context,
        attack: percentAttack * onsetDuration,
        decay: (1 - percentAttack) * onsetDuration,
        sustain,
        release,
        attackCurve,
        decayCurve,
        releaseCurve,
      }).toDestination()
      env.triggerAttackRelease(onsetDuration + SUSTAIN_DURATION)
    },
    [
      percentAttack,
      onsetDuration,
      sustain,
      release,
      attackCurve,
      decayCurve,
      releaseCurve,
    ]
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
      <ToneViz
        contextRecorder={recordEnvelope}
        recordDuration={TOTAL_WIDTH_DURATION}
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
            min="0.01"
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
