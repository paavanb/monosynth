import React from 'react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Group } from '@vx/group'
import * as Tone from 'tone'
import { scaleLinear } from 'd3-scale'
import { debounce } from 'lodash'

import { AsyncValue } from '../types'

import audioBufferSVGPath from './audioBufferSVGPath'
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
const MAX_RELEASE = 4
const SUSTAIN_DURATION = 0.5
const TOTAL_WIDTH_DURATION = MAX_ONSET_DURATION + SUSTAIN_DURATION + MAX_RELEASE

// NOTE: 3000 seems to be the minimum for at least Chrome
const ENVELOPE_SAMPLE_RATE = 3000

const DEFAULT_BOUNDS = [0, 1]

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

interface EnvelopeVizProps {
  onsetDuration: number
  envelope: (ctx: Tone.Context) => Tone.Envelope
  // The lower and upper bounds of the viz values
  bounds?: [number, number]
}

/**
 * TODO: This component is actually capable of rendering any signal over time, should rename.
 */
export default function EnvelopeViz(props: EnvelopeVizProps): JSX.Element {
  const {
    onsetDuration,
    envelope,
    bounds = DEFAULT_BOUNDS, // Preserve ref equality
  } = props

  const [asyncEnvelopeBuffer, setAsyncEnvelopeBuffer] = useState<
    AsyncValue<Tone.ToneAudioBuffer>
  >({ status: 'pending' })

  const updateGraph = useCallback(() => {
    Tone.Offline(
      (context) => {
        const env = envelope(context)
        env.triggerAttackRelease(onsetDuration + SUSTAIN_DURATION)
      },
      TOTAL_WIDTH_DURATION,
      1,
      ENVELOPE_SAMPLE_RATE
    )
      .then((buffer) => {
        setAsyncEnvelopeBuffer({ status: 'ready', value: buffer })
      })
      .catch(() => {
        setAsyncEnvelopeBuffer({
          status: 'error',
          error: 'Error creating buffer.',
        })
      })
  }, [envelope, onsetDuration])

  useEffect(() => {
    updateGraph()
  }, [updateGraph])

  const path = useMemo(() => {
    if (asyncEnvelopeBuffer.status !== 'ready') return null

    return audioBufferSVGPath(
      asyncEnvelopeBuffer.value,
      INNER_WIDTH,
      INNER_HEIGHT,
      500,
      scaleLinear([bounds[0], bounds[1]], [0, 1])
    )
  }, [asyncEnvelopeBuffer, bounds])

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
          {path && <path d={path} />}
        </Group>
      </Group>
    </svg>
  )
}
