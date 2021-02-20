import React from 'react'
import { useCallback, useEffect, useState } from 'react'
import * as Tone from 'tone'

import { Dictionary } from '../types'

// [note, octave] tuples
type Note = [string, number]

function noteIsEqual(a: Note | null, b: Note | null) {
  if (a === null && b === null) return true
  if (a === null) return false
  if (b === null) return false

  return a[0] === b[0] && a[1] === b[1]
}

// Map from key to # octaves to offset
const OTTAVA_MAP: Dictionary<string, number> = {
  b: 1,
  n: 2,
  m: 3,
  ',': 4,
  v: -1,
  c: -2,
  x: -3,
  z: -4,
}

const OTTAVA_KEYS = new Set(Object.keys(OTTAVA_MAP))

// Intuition: Hands should feel comfortable above home row. Spacebar is middle C.
const KEYMAP: Dictionary<string, Note> = {
  1: ['Db', 3],
  q: ['D', 3],
  2: ['Eb', 3],
  w: ['E', 3],
  e: ['F', 3],
  4: ['Gb', 3],
  r: ['G', 3],
  5: ['Ab', 3],
  t: ['A', 3],
  6: ['Bb', 3],
  y: ['B', 3],
  ' ': ['C', 4], // Middle C
  7: ['C#', 4],
  u: ['D', 4],
  8: ['D#', 4],
  i: ['E', 4],
  o: ['F', 4],
  0: ['F#', 4],
  p: ['G', 4],
  '-': ['G#', 4],
  '[': ['A', 4],
  '=': ['A#', 4],
  ']': ['B', 4],
}

interface KeyboardProps {
  triggerAttack: (note: string | number | Tone.FrequencyClass<number>) => void
  triggerRelease: () => void
}

export default function Keyboard(props: KeyboardProps): JSX.Element {
  const { triggerAttack, triggerRelease } = props
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [activeOttavaKey, setActiveOttavaKey] = useState<string | null>(null)

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note !== undefined && !noteIsEqual(note, activeNote)) {
        setActiveNote(note)
      }

      // Prevent the spacebar from scrolling the page
      if (evt.key === ' ') {
        evt.preventDefault()
      }

      if (OTTAVA_KEYS.has(evt.key) && activeOttavaKey === null) {
        setActiveOttavaKey(evt.key)
      }
    },
    [activeNote, activeOttavaKey]
  )

  const handleKeyUp = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note && noteIsEqual(note, activeNote)) {
        triggerRelease()
        setActiveNote(null)
      }
      if (activeOttavaKey === evt.key) {
        setActiveOttavaKey(null)
      }
    },
    [triggerRelease, activeNote, activeOttavaKey]
  )

  // triggerAttack
  useEffect(() => {
    if (!activeNote) return

    const octaveOffset =
      (activeOttavaKey ? OTTAVA_MAP[activeOttavaKey] : 0) || 0
    const playedNote = [activeNote[0], activeNote[1] + octaveOffset]
    triggerAttack(playedNote.join(''))
  }, [activeNote, triggerAttack, activeOttavaKey])

  // useKeyboardEffect
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return <></>
}
