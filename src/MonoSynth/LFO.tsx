import React from 'react'
import { useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'

import clamp from '../utils/clamp'
import useNormalRangeParam from '../hooks/useNormalRangeParam'

const WIDTH = 300
const HEIGHT = 150

const FREQ_MAX = 30
const DEPTH_MAX = 1

function useFreq(
  autoFilter: Tone.AutoFilter
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [freq, setFreq] = useState(() =>
    autoFilter.toFrequency(autoFilter.frequency.value)
  )

  useEffect(() => {
    const now = Tone.now()
    // Make sure we don't accidentally schedule frequency changes at the same time
    autoFilter.frequency.cancelScheduledValues(now)
    autoFilter.frequency.setValueAtTime(freq, now)
  }, [freq, autoFilter.frequency])

  return [freq, setFreq]
}

interface LFOProps {
  autoFilter: Tone.AutoFilter
}

export default function LFO(props: LFOProps): JSX.Element {
  const { autoFilter } = props
  const [freq, setFreq] = useFreq(autoFilter)
  const [depth, setDepth] = useNormalRangeParam(autoFilter.depth)
  const [dragging, setDragging] = useState(false)

  const markerCoords = {
    x: clamp(freq, 0, WIDTH),
    y: HEIGHT * depth,
  }

  const updateMarkerCoords = useCallback(
    (x: number, y: number) => {
      setFreq(x)
      setDepth(y / HEIGHT)
    },
    [setFreq, setDepth]
  )

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      setDragging(true)
      updateMarkerCoords(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
    },
    [updateMarkerCoords]
  )

  const handleMouseMove = useCallback(
    (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
      if (dragging) {
        updateMarkerCoords(evt.nativeEvent.offsetX, evt.nativeEvent.offsetY)
      }
    },
    [dragging, updateMarkerCoords]
  )

  return (
    <svg
      width={WIDTH}
      height={HEIGHT}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
    >
      <circle
        cx={markerCoords.x}
        cy={markerCoords.y}
        r={5}
        stroke="white"
        fill="none"
      />
    </svg>
  )
}
