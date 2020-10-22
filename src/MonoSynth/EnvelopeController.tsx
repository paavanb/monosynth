import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import ScaledRangeInput from '../ScaledRangeInput'

import EnvelopeViz from './EnvelopeViz'
import cs from './styles.module.css'

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

  return (
    <div>
      <EnvelopeViz
        onsetDuration={onsetDuration}
        percentAttack={percentAttack}
        sustain={sustain}
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
    </div>
  )
}
