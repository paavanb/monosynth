import React from 'react'
import { useRef, useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'
import { GridColumns } from '@vx/grid'
import { Group } from '@vx/group'
import { scaleLinear } from 'd3-scale'
import { range } from 'd3'

const WIDTH = 800
const HEIGHT = 50
const MIDDLE_C_POS = WIDTH / 2

const MUSICAL_CONST = Math.pow(2, 1 / 12)
const MIDDLE_C = 261.626

const OCTAVES = 8

// Semitones that the keyboard spans
const RIBBON_SPAN = 12 * OCTAVES

const scaleRibbon = scaleLinear()
  .domain([-RIBBON_SPAN / 2, RIBBON_SPAN / 2])
  .range([0, WIDTH])
  .clamp(true)

// frequency = f0 * 2^(1/12)^half_steps
// Where f0 is a fixed point, e.g. C4 (440Hz), and half_steps is the number of half steps
// away you are from that fixed point
function getFrequency(anchorFrequency: number, halfSteps: number): number {
  return anchorFrequency * Math.pow(MUSICAL_CONST, halfSteps)
}

function getOctaveTicks(semitoneOffset: number): number[] {
  return range(OCTAVES).map(
    (octaveIdx) => (octaveIdx - OCTAVES / 2) * 12 + semitoneOffset
  )
}

enum Margin {
  Top = 0,
  Right = 0,
  Left = 0,
  Bottom = 20,
}

interface RibbonKeyboardProps {
  onFrequencyChange: (hz: number) => void
  triggerAttack: (note: string | number | Tone.FrequencyClass<number>) => void
  triggerRelease: () => void
}

export default function RibbonKeyboard(
  props: RibbonKeyboardProps
): JSX.Element {
  const { triggerAttack, triggerRelease, onFrequencyChange } = props
  const [dragging, setDragging] = useState(false)
  const ribbonRef = useRef<SVGRectElement>(null)

  const getMouseFrequency = useCallback((evt: MouseEvent): number | null => {
    if (!ribbonRef.current) return null

    const boundingRect = ribbonRef.current.getBoundingClientRect()
    const x = evt.clientX - boundingRect.left
    const halfSteps = ((x - MIDDLE_C_POS) / WIDTH) * (RIBBON_SPAN / 2)

    return getFrequency(MIDDLE_C, halfSteps)
  }, [])

  const stopDrag = useCallback(() => {
    setDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (dragging) {
        const freq = getMouseFrequency(evt)
        if (freq !== null) onFrequencyChange(freq)
      }
    },
    [dragging, getMouseFrequency, onFrequencyChange]
  )

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      setDragging(true)
      const freq = getMouseFrequency(evt.nativeEvent)
      if (freq !== null) triggerAttack(freq)
    },
    [triggerAttack, getMouseFrequency]
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

  useEffect(() => {
    if (!dragging) triggerRelease()
  }, [dragging, triggerRelease])

  return (
    <svg
      width={WIDTH + Margin.Left + Margin.Right}
      height={HEIGHT + Margin.Top + Margin.Bottom}
      style={{ userSelect: 'none' }}
    >
      <Group left={Margin.Left} top={Margin.Top}>
        <rect
          ref={ribbonRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ fill: 'white' }}
          onMouseDown={handleMouseDown}
        />
        {/* Draw columns at perfect fifths */}
        <GridColumns
          height={HEIGHT}
          scale={scaleRibbon}
          stroke="#bbb"
          strokeWidth={1}
          tickValues={getOctaveTicks(0).filter((_, idx) => idx % 2 === 1)}
          lineStyle={{ pointerEvents: 'none' }}
        />
        <GridColumns
          height={HEIGHT}
          scale={scaleRibbon}
          stroke="#666"
          strokeWidth={3}
          tickValues={getOctaveTicks(0).filter((_, idx) => idx % 2 === 0)}
          lineStyle={{ pointerEvents: 'none' }}
        />
      </Group>
    </svg>
  )
}
