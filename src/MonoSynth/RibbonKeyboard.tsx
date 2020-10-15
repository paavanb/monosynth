import React from 'react'
import { useRef, useCallback, useState, useEffect } from 'react'
import * as Tone from 'tone'

const WIDTH = 800
const MIDDLE_C_POS = WIDTH / 2

const MUSICAL_CONST = Math.pow(2, 1 / 12)
const MIDDLE_C = 440

// Semitones that the keyboard spans
const RIBBON_SPAN = 12 * 8

// frequency = f0 * 2^(1/12)^half_steps
// Where f0 is a fixed point, e.g. C4 (440Hz), and half_steps is the number of half steps
// away you are from that fixed point
function getFrequency(anchorFrequency: number, halfSteps: number): number {
  return anchorFrequency * Math.pow(MUSICAL_CONST, halfSteps)
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
  const svgRef = useRef<SVGSVGElement>(null)

  const getMouseFrequency = useCallback((evt: MouseEvent): number | null => {
    if (!svgRef.current) return null

    const boundingRect = svgRef.current.getBoundingClientRect()
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
    (evt: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
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
      onMouseDown={handleMouseDown}
      ref={svgRef}
      width={WIDTH}
      height={50}
      style={{ userSelect: 'none', backgroundColor: 'aliceblue' }}
    ></svg>
  )
}
