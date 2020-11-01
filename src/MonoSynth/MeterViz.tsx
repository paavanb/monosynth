import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Group } from '@vx/group'
import * as Tone from 'tone'
import { range } from 'd3'

import cs from './styles.module.css'

const WIDTH = 300
const HEIGHT = 100

const INNER_WIDTH = 275
const INNER_HEIGHT = 80

enum Padding {
  Left = (WIDTH - INNER_WIDTH) / 2,
  Top = (HEIGHT - INNER_HEIGHT) / 2,
}

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

interface MeterVizProps {
  // Unfortunately Tone does not currently export MeterBase
  meter: Tone.FFT | Tone.Waveform
}

/*
 * Render a Tone.MeterBase instance
 */
export default function MeterViz(props: MeterVizProps): JSX.Element {
  const { meter } = props

  const [buffer, setBuffer] = useState<Float32Array>(new Float32Array())

  const path = useMemo(() => {
    const indexes = range(0, buffer.length)
    return indexes
      .map((index) => {
        const value = buffer[index]
        const svgPathCommand = index === 0 ? 'M' : 'L'
        return `${svgPathCommand} ${(index / buffer.length) * INNER_WIDTH} ${
          value * INNER_HEIGHT
        }`
      })
      .join(' ')
  }, [buffer])

  useEffect(() => {
    const intervalId = setInterval(() => setBuffer(meter.getValue()), 16)
    return () => clearInterval(intervalId)
  }, [meter])

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
          {path && <path d={path} />}
        </Group>
      </Group>
    </svg>
  )
}
