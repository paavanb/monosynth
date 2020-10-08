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

  const path = [
    ['M', 0, 0],
    ['l', attackWidth, INNER_HEIGHT],
    ['l', decayWidth, sustainHeight - INNER_HEIGHT],
    ['h', SUSTAIN_WIDTH],
    ['l', releaseWidth, -sustainHeight],
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
