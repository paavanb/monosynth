import React from 'react'
import { useCallback, useState, useEffect, useRef } from 'react'
import * as Tone from 'tone'
import { scaleLinear, scaleSymlog, NumberValue } from 'd3-scale'
import { AxisBottom, AxisLeft, TickFormatter } from '@vx/axis'
import { Group } from '@vx/group'
import { GridColumns, GridRows } from '@vx/grid'

import useNormalRangeParam from '../hooks/useNormalRangeParam'
import useFrequency from '../hooks/useFrequency'

import cs from './styles.module.css'

const WIDTH = 150
const HEIGHT = 150

enum Margin {
  Top = 10,
  Right = 10,
  Bottom = 60,
  Left = 60,
}

const FREQ_MAX = 20

// Important to use a nonlinear scale, since our ears perceive far more difference
//   between 2Hz and 5Hz than 25Hz and 30Hz. With a linear scale, it is hard
//   to get precision at the lower freqs
const scaleFreq = scaleSymlog()
  .domain([0, FREQ_MAX])
  .range([0, WIDTH])
  .clamp(true)
const scaleDepth = scaleLinear().domain([1, 0]).range([0, HEIGHT]).clamp(true)

const bottomTickLabelProps = () =>
  ({
    textAnchor: 'middle',
    fontFamily: 'Arial',
    fontSize: 10,
    fill: 'white',
  } as const)

const leftTickLabelProps = () =>
  ({
    fontFamily: 'Arial',
    fontSize: 10,
    fill: 'white',
    textAnchor: 'end',
    dx: '-0.25em',
    dy: '0.25em',
  } as const)

interface LFOProps {
  lfo: Tone.LFO
  leftAxisTickFormat?: TickFormatter<NumberValue>
  leftAxisLabel?: string
}

export default function LFOPad(props: LFOProps): JSX.Element {
  const { lfo, leftAxisTickFormat, leftAxisLabel } = props
  const frequencySignal = lfo.frequency
  const depthParam = lfo.amplitude

  const [freq, setFreq] = useFrequency(frequencySignal)
  const [depth, setDepth] = useNormalRangeParam(depthParam)
  const [dragging, setDragging] = useState(false)
  const padRef = useRef<SVGRectElement>(null)

  const markerCoords = {
    x: scaleFreq(freq),
    y: scaleDepth(depth),
  }

  const stopDrag = useCallback(() => {
    setDragging(false)
  }, [])

  const updateMarkerCoords = useCallback(
    (evt: MouseEvent) => {
      if (!padRef.current) return

      const boundingRect = padRef.current.getBoundingClientRect()
      const x = evt.clientX - boundingRect.left
      const y = evt.clientY - boundingRect.top

      setFreq(scaleFreq.invert(x) as number)
      setDepth(scaleDepth.invert(y) as number)
    },
    [setFreq, setDepth]
  )

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (dragging) {
        updateMarkerCoords(evt)
      }
    },
    [dragging, updateMarkerCoords]
  )

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      setDragging(true)
      updateMarkerCoords(evt.nativeEvent)
    },
    [updateMarkerCoords]
  )

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', stopDrag)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', stopDrag)
    }
  }, [dragging, handleMouseMove, stopDrag])

  return (
    <svg
      width={WIDTH + Margin.Left + Margin.Right}
      height={HEIGHT + Margin.Top + Margin.Bottom}
      onMouseDown={handleMouseDown}
      style={{ userSelect: 'none' }}
    >
      <Group left={Margin.Left} top={Margin.Top}>
        <rect
          className={cs.lfoPad}
          ref={padRef}
          width={WIDTH}
          height={HEIGHT}
        />
        <g>
          <AxisBottom
            top={HEIGHT}
            scale={scaleFreq}
            numTicks={5}
            tickLength={5}
            hideAxisLine={true}
            stroke="white"
            tickStroke="white"
            tickLabelProps={bottomTickLabelProps}
            label="Frequency"
            labelProps={{
              fill: 'white',
              fontSize: 10,
              textAnchor: 'middle',
            }}
          />
          <GridColumns
            height={HEIGHT}
            scale={scaleFreq}
            stroke="#888"
            numTicks={5}
          />
        </g>
        <g>
          <AxisLeft
            left={0}
            scale={scaleDepth}
            tickLength={5}
            tickValues={[0, 0.25, 0.5, 0.75, 1]}
            tickFormat={leftAxisTickFormat}
            hideAxisLine={true}
            stroke="white"
            tickStroke="white"
            tickLabelProps={leftTickLabelProps}
            label={leftAxisLabel}
            labelProps={{
              fill: 'white',
              fontSize: 10,
              textAnchor: 'middle',
            }}
            labelOffset={25}
          />
          <GridRows
            width={WIDTH}
            scale={scaleDepth}
            stroke="#a6a6a6"
            numTicks={4}
            tickValues={[0, 0.25, 0.5, 0.75, 1]}
          />
        </g>
        <circle
          // Avoid accidentally intercepting mouse events
          style={{ pointerEvents: 'none' }}
          cx={markerCoords.x}
          cy={markerCoords.y}
          r={5}
          stroke="#920000"
          strokeWidth={2}
          fill="none"
        />
      </Group>
    </svg>
  )
}
