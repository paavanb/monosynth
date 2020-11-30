import React from 'react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Group } from '@vx/group'
import * as Tone from 'tone'
import { scaleLinear } from 'd3-scale'

import { AsyncValue } from '../types'

import audioBufferSVGPath from './audioBufferSVGPath'
import cs from './styles.module.css'

const WIDTH = 300
const HEIGHT = 100

const INNER_WIDTH = 275
const INNER_HEIGHT = 80

const DEFAULT_SAMPLE_RATE = 48000

enum Padding {
  Left = (WIDTH - INNER_WIDTH) / 2,
  Top = (HEIGHT - INNER_HEIGHT) / 2,
}

const DEFAULT_BOUNDS = [0, 1]

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

interface ToneVizProps {
  // Amount of time to record for, in seconds
  recordDuration: number
  // All events scheduled with the provided context will be recorded
  // See: Tone.Offline()
  contextRecorder: (ctx: Tone.Context) => void
  // The lower and upper bounds of the viz values
  bounds?: [number, number]
  sampleRate?: number
}

export default function ToneViz(props: ToneVizProps): JSX.Element {
  const {
    contextRecorder,
    recordDuration,
    bounds = DEFAULT_BOUNDS, // Preserve ref equality
    sampleRate = DEFAULT_SAMPLE_RATE,
  } = props

  const [asyncToneBuffer, setAsyncToneBuffer] = useState<
    AsyncValue<Tone.ToneAudioBuffer>
  >({ status: 'pending' })

  const updateGraph = useCallback(() => {
    Tone.Offline(
      (context) => {
        contextRecorder(context)
      },
      recordDuration,
      1,
      sampleRate
    )
      .then((buffer) => {
        setAsyncToneBuffer({ status: 'ready', value: buffer })
      })
      .catch(() => {
        setAsyncToneBuffer({
          status: 'error',
          error: 'Error creating buffer.',
        })
      })
  }, [contextRecorder, recordDuration, sampleRate])

  useEffect(() => {
    updateGraph()
  }, [updateGraph])

  const path = useMemo(() => {
    if (asyncToneBuffer.status !== 'ready') return null

    return audioBufferSVGPath(
      asyncToneBuffer.value,
      INNER_WIDTH,
      INNER_HEIGHT,
      Math.min(500, sampleRate * recordDuration),
      scaleLinear([bounds[0], bounds[1]], [0, 1])
    )
  }, [asyncToneBuffer, bounds, sampleRate, recordDuration])

  return (
    <svg
      width={WIDTH + Margin.Left + Margin.Right}
      height={HEIGHT + Margin.Top + Margin.Bottom}
      className={cs.toneViz}
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
          {path && <path d={path} className={cs.tonePath} />}
        </Group>
      </Group>
    </svg>
  )
}
