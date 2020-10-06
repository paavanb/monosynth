import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

import cs from './styles.module.css'

const scaleAttackDecayTime = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatTime = format('.2f')
const formatPercent = format('.0%')

interface EnvelopeControllerProps {
  envelope: Tone.Envelope
}

export default function EnvelopeController(
  props: EnvelopeControllerProps
): JSX.Element {
  const { envelope } = props
  const [sliderAttackDecayTime, setSliderAttackDecayTime] = useState(() => {
    const attack = Tone.Time(envelope.attack).toSeconds()
    const decay = Tone.Time(envelope.decay).toSeconds()
    return scaleAttackDecayTime.invert(attack + decay)
  })
  const attackDecayTime = scaleAttackDecayTime(sliderAttackDecayTime) as number

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
    envelope.attack = attackDecayTime * percentAttack
    envelope.decay = attackDecayTime * (1 - percentAttack)
  }, [envelope, attackDecayTime, percentAttack])

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
      <div className={cs.control}>
        <label>
          Onset
          <input
            type="range"
            min={0}
            max={4}
            step="0.05"
            value={sliderAttackDecayTime}
            onChange={(evt) =>
              setSliderAttackDecayTime(parseFloat(evt.target.value))
            }
          />
        </label>
        <output>{formatTime(attackDecayTime)}s</output>
      </div>
      <div className={cs.control}>
        <label>
          A-D Ratio
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={percentAttack}
            onChange={(evt) => setPercentAttack(parseFloat(evt.target.value))}
          />
        </label>
        <output>{formatPercent(percentAttack)}</output>
      </div>
      <div className={cs.control}>
        <label>
          Sustain
          <input
            type="range"
            min={0}
            max={1}
            step="0.05"
            value={sustain}
            onChange={(evt) => setSustain(parseFloat(evt.target.value))}
          />
        </label>
        <output>{formatPercent(sustain)}</output>
      </div>
      <div className={cs.control}>
        <label>
          Release
          <input
            type="range"
            min={0}
            max={4}
            step="0.1"
            value={release}
            onChange={(evt) => setRelease(parseFloat(evt.target.value))}
          />
        </label>
        <output>{formatTime(release)}s</output>
      </div>
    </div>
  )
}
