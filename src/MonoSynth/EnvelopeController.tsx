import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'

const scaleAttackDecayTime = scalePow().exponent(2).domain([0, 4]).range([0, 4])
const formatAttackDecayTime = format('.2f')
const formatPercent = format('.0%')

interface EnvelopeControllerProps {
  envelope: Tone.Envelope
}

export default function EnvelopeController(
  props: EnvelopeControllerProps
): JSX.Element {
  const { envelope } = props
  const [sliderAttackDecayTime, setSliderAttackDecayTime] = useState(() =>
    scaleAttackDecayTime.invert(envelope.attack + envelope.decay)
  )
  const attackDecayTime = scaleAttackDecayTime(sliderAttackDecayTime)

  const [percentAttack, setPercentAttack] = useState(() => {
    const totalTime = envelope.attack + envelope.decay
    return envelope.attack / totalTime
  })

  const [sustain, setSustain] = useState(envelope.sustain)

  // syncAttackDecay
  useEffect(() => {
    envelope.attack = attackDecayTime * percentAttack
    envelope.decay = attackDecayTime * (1 - percentAttack)
  }, [envelope, attackDecayTime, percentAttack])

  // syncSustain
  useEffect(() => {
    envelope.sustain = sustain
  }, [envelope, sustain])

  return (
    <div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Attack-Decay Time
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
        {formatAttackDecayTime(attackDecayTime)}s
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          Percent Attack
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={percentAttack}
            onChange={(evt) => setPercentAttack(parseFloat(evt.target.value))}
          />
        </label>
        {formatPercent(percentAttack)}
      </div>
      <div>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
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
        {formatPercent(sustain)}
      </div>
    </div>
  )
}
