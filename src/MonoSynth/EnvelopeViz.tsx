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

interface EnvelopeVizProps {
  onsetDuration: number
  percentAttack: number
  sustain: number
  release: number
}

export default function EnvelopeViz(props: EnvelopeVizProps): JSX.Element {
  const { onsetDuration, percentAttack, release, sustain } = props

  const onsetDurationWidth =
    (onsetDuration / MAX_ONSET_DURATION) * MAX_ONSET_DURATION_WIDTH
  const attackWidth = percentAttack * onsetDurationWidth
  const decayWidth = onsetDurationWidth - attackWidth
  const releaseWidth = (release / MAX_RELEASE) * MAX_RELEASE_WIDTH
  const sustainHeight =
    percentAttack !== 1 && onsetDuration !== 0
      ? sustain * INNER_HEIGHT
      : INNER_HEIGHT

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
          {/* Attack curve */}
          {onsetDuration !== 0 && percentAttack !== 0 && (
            <line
              x1={0}
              y1={0}
              x2={attackWidth}
              y2={INNER_HEIGHT}
              stroke="black"
            />
          )}
          {/* Decay curve */}
          {onsetDuration !== 0 && percentAttack !== 1 && (
            <line
              x1={attackWidth}
              y1={INNER_HEIGHT}
              x2={attackWidth + decayWidth}
              y2={sustainHeight}
              stroke="black"
            />
          )}
          {/* Zero-onset curve */}
          {onsetDuration === 0 && (
            <line x1={0} y1={0} x2={0} y2={sustainHeight} stroke="black" />
          )}
          {/* Sustain level */}
          <line
            x1={onsetDurationWidth}
            y1={sustainHeight}
            x2={onsetDurationWidth + SUSTAIN_WIDTH}
            y2={sustainHeight}
            stroke="black"
          />
          {/* Release curve */}
          <line
            x1={onsetDurationWidth + SUSTAIN_WIDTH}
            y1={sustainHeight}
            x2={onsetDurationWidth + SUSTAIN_WIDTH + releaseWidth}
            y2={0}
            stroke="black"
          />
        </Group>
      </Group>
    </svg>
  )
}
