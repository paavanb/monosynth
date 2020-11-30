import React from 'react'
import { useState, useEffect, useMemo } from 'react'
import { Group } from '@vx/group'
import { AxisBottom, AxisLeft } from '@vx/axis'
import { Grid } from '@vx/grid'
import * as Tone from 'tone'
import { range } from 'd3'
import { scaleLinear, scaleSymlog } from 'd3-scale'
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

const MAX_FREQ = 20_000
const scaleFreq = scaleSymlog([0, MAX_FREQ], [0, INNER_WIDTH]).constant(100)
const formatFreq = format('.2s')

const scaleDecibels = scaleLinear([-100, 0], [0, INNER_HEIGHT])
const axisScaleDecibels = scaleLinear(
  [scaleDecibels.domain()[1], scaleDecibels.domain()[0]],
  scaleDecibels.range()
)

const xAxisTickValues = [75, 250, 750, 2_500, 7_500, MAX_FREQ]

interface FFTVizProps {
  meter: Tone.FFT
}

/*
 * Render a Tone.FFT instance
 */
export default function FFTViz(props: FFTVizProps): JSX.Element {
  const { meter } = props

  const [buffer, setBuffer] = useState<Float32Array>(new Float32Array())

  const path = useMemo(() => {
    const indexes = range(0, buffer.length)

    return indexes
      .map((index) => {
        const value = buffer[index]
        const svgPathCommand = index === 0 ? 'M' : 'L'
        const freq = meter.getFrequencyOfIndex(index)
        return `${svgPathCommand} ${scaleFreq(freq) as number} ${
          scaleDecibels(value) as number
        }`
      })
      .join(' ')
  }, [buffer, meter])

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
        <Group left={Padding.Left} top={Padding.Top}>
          {/* Translate/scale so that origin is at bottom left */}
          <Grid
            xScale={scaleFreq}
            yScale={axisScaleDecibels}
            columnTickValues={xAxisTickValues}
            width={INNER_WIDTH}
            height={INNER_HEIGHT}
          />
          <AxisBottom
            scale={scaleFreq}
            top={INNER_HEIGHT / 2}
            tickValues={xAxisTickValues}
            tickLength={0}
            tickFormat={formatFreq}
            label="Hz"
          />
          <AxisLeft
            scale={axisScaleDecibels}
            tickLength={0}
            label="db"
            labelOffset={27}
          />
          <Group transform={`translate(0, ${INNER_HEIGHT}) scale(1, -1)`}>
            {path && <path d={path} className={cs.tonePath} />}
          </Group>
        </Group>
      </Group>
    </svg>
  )
}
