import React from 'react'
import { Group } from '@vx/group'

import cs from './styles.module.css'

const WIDTH = 300
const HEIGHT = 100

const INNER_WIDTH = 275
const INNER_HEIGHT = 80

enum Padding {
  Left = (WIDTH - INNER_WIDTH) / 2,
  Top = (HEIGHT - INNER_HEIGHT) / 2,
}

const MAX_ONSET_DURATION = 4
const MAX_ONSET_DURATION_WIDTH = 120

const MAX_RELEASE = 4
const MAX_RELEASE_WIDTH = 120
const SUSTAIN_WIDTH = INNER_WIDTH - MAX_ONSET_DURATION_WIDTH - MAX_RELEASE_WIDTH

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

interface ScaledEnvelopeVizProps {
  onsetDuration: number
  percentAttack: number
  release: number
  min: number
  max: number
  envelopeMin: number
  envelopeMax: number
}

export default function ScaledEnvelopeViz(
  props: ScaledEnvelopeVizProps
): JSX.Element {
  const {
    onsetDuration,
    percentAttack,
    min,
    max,
    envelopeMin,
    envelopeMax,
    release,
  } = props

  const startHeight = ((envelopeMin - min) / (max - min)) * INNER_HEIGHT
  const peakHeight = ((envelopeMax - min) / (max - min)) * INNER_HEIGHT
  const onsetDurationWidth =
    (onsetDuration / MAX_ONSET_DURATION) * MAX_ONSET_DURATION_WIDTH
  const attackWidth = percentAttack * onsetDurationWidth
  const decayWidth = onsetDurationWidth - attackWidth
  const releaseWidth = (release / MAX_RELEASE) * MAX_RELEASE_WIDTH
  const sustainHeight = INNER_HEIGHT / 2

  const path = [
    ['M', 0, 0],
    ['L', 0, startHeight],
    ['L', attackWidth, peakHeight],
    ['L', attackWidth + decayWidth, sustainHeight],
    ['h', SUSTAIN_WIDTH],
    ['L', attackWidth + decayWidth + SUSTAIN_WIDTH + releaseWidth, 0],
  ]
  return (
    <svg
      width={WIDTH + Margin.Left + Margin.Right}
      height={HEIGHT + Margin.Top + Margin.Bottom}
      className={cs.envelopeViz}
    >
      <Group left={Margin.Left} top={Margin.Top}>
        <rect className={cs.window} width={WIDTH} height={HEIGHT} />
        {/* Translate/scale so that origin is at bottom left */}
        <Group
          transform={`
            translate(${Padding.Left}, ${Padding.Top + INNER_HEIGHT})
            scale(1, -1)
          `}
        >
          <path d={path.map((a) => a.join(' ')).join(' ')} />
        </Group>
      </Group>
    </svg>
  )
}
