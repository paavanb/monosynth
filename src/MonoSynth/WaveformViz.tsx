import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Group } from '@vx/group'
import { AxisLeft } from '@vx/axis'
import { GridRows } from '@vx/grid'
import * as Tone from 'tone'
import { range } from 'd3'
import { scaleLinear } from 'd3-scale'
import { format } from 'd3-format'

import cs from './styles.module.css'

enum Padding {
  Top = 10,
  Right = 12.5,
  Bottom = 10,
  Left = 40,
}

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

const INNER_WIDTH = 400
const INNER_HEIGHT = 200

const WIDTH = INNER_WIDTH + Padding.Left + Padding.Right
const HEIGHT = INNER_HEIGHT + Padding.Top + Padding.Bottom

const scaleAmplitude = scaleLinear([-1, 1], [0, INNER_HEIGHT])
const formatAmplitude = format('.0%')
const amplitudeTickValues = [-1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1]

// Waveform oscilloscope trigger "voltage". Allows us to display a consistent waveform
const TRIGGER = 0

/*
 * Given a buffer of data and a desired "trigger" level, get the bounds of one period
 * starting and ending at that trigger level.
 */
function getTriggerIndexes(
  buffer: Float32Array,
  trigger = 0
): [number, number] {
  let rising = true
  let boundStart = 0
  let startFound = false
  for (let i = 0; i < buffer.length; i++) {
    if (i > 0) {
      // Rising trigger
      if (rising && buffer[i - 1] < trigger && buffer[i] >= trigger) {
        if (!startFound) {
          boundStart = i
          startFound = true
        } else return [boundStart, i]
      }

      // Falling trigger
      if (!rising && buffer[i - 1] > trigger && buffer[i] <= trigger) {
        rising = false
      }
    }
  }

  return [0, buffer.length]
}

interface WaveformVizProps {
  meter: Tone.Waveform
}

/*
 * Render a Tone.MeterBase instance
 */
export default function WaveformViz(props: WaveformVizProps): JSX.Element {
  const { meter } = props

  const [buffer, setBuffer] = useState<Float32Array>(new Float32Array())

  const path = useMemo(() => {
    const [startIndex, endIndex] = getTriggerIndexes(buffer, TRIGGER)
    const length = endIndex - startIndex
    const scale = scaleLinear([0, length], [0, INNER_WIDTH])
    const indexes = range(0, length)

    return indexes
      .map((index) => {
        const value = buffer[index + startIndex]
        const svgPathCommand = index === 0 ? 'M' : 'L'
        return `${svgPathCommand} ${scale(index) as number} ${
          scaleAmplitude(value) as number
        }`
      })
      .join(' ')
  }, [buffer])

  useEffect(() => {
    const intervalId = setInterval(
      // Must wrap in a Float32Array since meter.getValue() returns a pointer to
      // the same array every time
      () => setBuffer(new Float32Array(meter.getValue())),
      16
    )
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
        <Group left={Padding.Left} top={Padding.Top}>
          <AxisLeft
            scale={scaleAmplitude}
            tickFormat={formatAmplitude}
            tickValues={amplitudeTickValues}
            tickLength={0}
          />
          <GridRows
            scale={scaleAmplitude}
            tickValues={amplitudeTickValues}
            width={INNER_WIDTH}
          />
          <line
            x1={0}
            y1={INNER_HEIGHT / 2}
            x2={INNER_WIDTH}
            y2={INNER_HEIGHT / 2}
            stroke="gray"
          />
          {/* Translate/scale so that origin is at bottom left */}
          <Group transform={`translate(0, ${INNER_HEIGHT}) scale(1, -1)`}>
            {path && <path d={path} className={cs.waveformPath} />}
          </Group>
        </Group>
      </Group>
    </svg>
  )
}
