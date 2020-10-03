import React from 'react'
import { useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'
import { scaleLinear, scalePow } from 'd3-scale'

import useNormalRangeParam from '../hooks/useNormalRangeParam'

import cs from './styles.module.css'

const WIDTH = 150
const HEIGHT = 150

const FREQ_MAX = 20

// Important to use a nonlinear scale, since our ears perceive far more difference
//   between 2Hz and 5Hz than 25Hz and 30Hz. With a linear scale, it is hard
//   to get precision at the lower freqs
const scaleFreq = scalePow()
  .exponent(2)
  .domain([0, WIDTH])
  .range([0, FREQ_MAX])
  .clamp(true)
const scaleDepth = scaleLinear().domain([0, HEIGHT]).range([1, 0]).clamp(true)

function useFreq(
  frequencySignal: Tone.Signal<'frequency'>
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [freq, setFreq] = useState(() =>
    Tone.Frequency(frequencySignal.value).toFrequency()
  )

  useEffect(() => {
    const now = Tone.now()
    // Make sure we don't accidentally schedule frequency changes at the same time
    frequencySignal.cancelScheduledValues(now)
    frequencySignal.setValueAtTime(freq, now)
  }, [freq, frequencySignal])

  return [freq, setFreq]
}

interface LFOProps {
  frequencySignal: Tone.Signal<'frequency'>
  depthParam: Tone.Param<'normalRange'>
}

export default function LFOPad(props: LFOProps): JSX.Element {
  const { frequencySignal, depthParam } = props
  const [freq, setFreq] = useFreq(frequencySignal)
  const [depth, setDepth] = useNormalRangeParam(depthParam)
  const [dragging, setDragging] = useState(false)

  const markerCoords = {
    x: scaleFreq.invert(freq),
    y: scaleDepth.invert(depth),
  }

  const stopDrag = useCallback(() => {
    setDragging(false)
  }, [])

  const updateMarkerCoords = useCallback(
    (x: number, y: number) => {
      setFreq(scaleFreq(x) as number)
      setDepth(scaleDepth(y) as number)
    },
    [setFreq, setDepth]
  )

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<SVGGElement, MouseEvent>) => {
      setDragging(true)
      updateMarkerCoords(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      document.addEventListener('mouseup', () => {
        setDragging(false)
        document.removeEventListener('mouseup', stopDrag)
      })
    },
    [updateMarkerCoords, stopDrag]
  )

  const handleMouseMove = useCallback(
    (evt: React.MouseEvent<SVGGElement, MouseEvent>) => {
      if (dragging) {
        updateMarkerCoords(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      }
    },
    [dragging, updateMarkerCoords]
  )

  return (
    <svg>
      <g>
        <g>
          <rect
            className={cs.lfoPad}
            width={WIDTH}
            height={HEIGHT}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          />
          <circle
            // Avoid accidentally intercepting mouse events
            style={{ pointerEvents: 'none' }}
            cx={markerCoords.x}
            cy={markerCoords.y}
            r={5}
            stroke="white"
            fill="none"
          />
        </g>
      </g>
    </svg>
  )
}
