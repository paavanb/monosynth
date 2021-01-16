import React from 'react'
import { useRef, useCallback, useState, useEffect, useMemo } from 'react'
import * as Tone from 'tone'
import { GridColumns } from '@vx/grid'
import { Group } from '@vx/group'
import { AxisBottom } from '@vx/axis'
import { scaleLinear, NumberValue } from 'd3-scale'
import { range } from 'd3'

import Keyboard from './Keyboard'
import cs from './styles.module.css'

const WIDTH = 800
const HEIGHT = 50
const MIDDLE_C_POS = WIDTH / 2

const MUSICAL_CONST = Math.pow(2, 1 / 12)
// Frequency of C4
const MIDDLE_C = 261.626

const OCTAVES = 8

// Semitones that the keyboard spans
const RIBBON_SPAN = 12 * OCTAVES

const scaleRibbon = scaleLinear()
  .domain([-RIBBON_SPAN / 2, RIBBON_SPAN / 2])
  .range([0, WIDTH])
  .clamp(true)

/*
 * Given half steps from a fixed point (e.g., C4), get frequency.
 * Uses the equation frequency = f0 * 2^(1/12)^half_steps
 */
function getFrequency(anchorFrequency: number, halfSteps: number): number {
  return anchorFrequency * Math.pow(MUSICAL_CONST, halfSteps)
}

/**
 * Given frequency, get number of half steps from fixed point (e.g., C4)
 */
function getHalfSteps(anchorFrequency: number, frequency: number): number {
  return Math.log(frequency / anchorFrequency) / Math.log(MUSICAL_CONST)
}

function getOctaveTicks(semitoneOffset: number): number[] {
  return range(OCTAVES + 1).map(
    (octaveIdx) => (octaveIdx - OCTAVES / 2) * 12 + semitoneOffset
  )
}

const bottomTickLabelProps = () =>
  ({
    textAnchor: 'middle',
    fontFamily: 'Arial',
    fontSize: 10,
    fill: 'white',
    dy: '0.25em',
  } as const)

enum Margin {
  Top = 16,
  Right = 16,
  Left = 16,
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
  const [activeFreq, setActiveFreq] = useState<number | null>(null)

  const handleTriggerAttack = useCallback(
    (freq: string | number | Tone.FrequencyClass<number>) => {
      triggerAttack(freq)
      setActiveFreq(Tone.Frequency(freq).toFrequency())
    },
    [triggerAttack]
  )

  const handleTriggerRelease = useCallback(() => {
    triggerRelease()
    setActiveFreq(null)
  }, [triggerRelease])

  const getMouseFrequency = useCallback((evt: MouseEvent): number | null => {
    if (!ribbonRef.current) return null

    const boundingRect = ribbonRef.current.getBoundingClientRect()
    const x = evt.clientX - boundingRect.left
    const halfSteps = ((x - MIDDLE_C_POS) / WIDTH) * RIBBON_SPAN

    return getFrequency(MIDDLE_C, halfSteps)
  }, [])

  const stopDrag = useCallback(() => {
    setDragging(false)
  }, [])

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      if (dragging) {
        const freq = getMouseFrequency(evt)
        if (freq !== null) {
          onFrequencyChange(freq)
          setActiveFreq(Tone.Frequency(freq).toFrequency())
        }
      }
    },
    [dragging, getMouseFrequency, onFrequencyChange]
  )

  const handleMouseDown = useCallback(
    (evt: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      setDragging(true)
      const freq = getMouseFrequency(evt.nativeEvent)
      if (freq !== null) handleTriggerAttack(freq)
    },
    [handleTriggerAttack, getMouseFrequency]
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
    if (!dragging) handleTriggerRelease()
  }, [dragging, handleTriggerRelease])

  const evenOctaveTicks = getOctaveTicks(0).filter((_, idx) => idx % 2 === 0)
  const oddOctaveTicks = getOctaveTicks(0).filter((_, idx) => idx % 2 === 1)
  const activeNoteX = useMemo(() => {
    if (activeFreq !== null) {
      const x = scaleRibbon(getHalfSteps(MIDDLE_C, activeFreq))
      return x !== undefined ? x : null
    }
    return null
  }, [activeFreq])

  return (
    <>
      <svg
        width={WIDTH + Margin.Left + Margin.Right}
        height={HEIGHT + Margin.Top + Margin.Bottom}
        style={{ userSelect: 'none' }}
        className={cs.ribbonKeyboard}
      >
        <Group left={Margin.Left} top={Margin.Top}>
          <text
            fill="white"
            fontFamily="Arial"
            fontSize={10}
            fontWeight="bold"
            textAnchor="middle"
            x={WIDTH / 2}
            y="-6px"
          >
            Keyboard
          </text>
          <rect
            ref={ribbonRef}
            width={WIDTH}
            height={HEIGHT}
            style={{ fill: 'white' }}
            onMouseDown={handleMouseDown}
          />
          {/* Draw columns at octaves */}
          <GridColumns
            height={HEIGHT}
            scale={scaleRibbon}
            stroke="#bbb"
            strokeWidth={1}
            tickValues={oddOctaveTicks}
            lineStyle={{ pointerEvents: 'none' }}
          />
          <GridColumns
            height={HEIGHT}
            scale={scaleRibbon}
            stroke="#666"
            strokeWidth={1}
            tickValues={evenOctaveTicks}
            lineStyle={{ pointerEvents: 'none' }}
          />
          <AxisBottom
            top={HEIGHT}
            scale={scaleRibbon}
            tickValues={evenOctaveTicks}
            tickFormat={(value: NumberValue) =>
              `C${Math.floor(value.valueOf() / 12) + 4}`
            }
            tickLabelProps={bottomTickLabelProps}
            tickLength={0}
            hideAxisLine
          />
          {/* Draw active frequency */}
          {activeNoteX !== null && (
            <line
              x1={activeNoteX}
              y1={0}
              x2={activeNoteX}
              y2={HEIGHT}
              strokeWidth={3}
              className={cs.activeMarker}
            />
          )}
        </Group>
      </svg>
      <Keyboard
        triggerAttack={handleTriggerAttack}
        triggerRelease={handleTriggerRelease}
      />
    </>
  )
}
