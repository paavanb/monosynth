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
  synth: Tone.MonoSynth
}

export default function Keyboard(props: KeyboardProps): JSX.Element {
  const { synth } = props
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [octaveOffset, setOctaveOffset] = useState<number>(0)

  const playNote = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key.toLowerCase()]
      if (note !== undefined && !noteIsEqual(note, activeNote)) {
        synth.triggerAttack([note[0], note[1] + octaveOffset].join(''))
        setActiveNote(note)
      }

      if (evt.key === 'Shift') {
        setOctaveOffset((prevOffset) => prevOffset + 1)
      }

      if (evt.key === 'Control') {
        setOctaveOffset((prevOffset) => prevOffset - 1)
      }
    },
    [synth, activeNote, octaveOffset]
  )

  const releaseNote = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key.toLowerCase()]
      if (note && noteIsEqual(note, activeNote)) {
        synth.triggerRelease()
        setActiveNote(null)
      }
      if (evt.key === 'Shift') {
        setOctaveOffset((prevOffset) => prevOffset - 1)
      }

      if (evt.key === 'Control') {
        setOctaveOffset((prevOffset) => prevOffset + 1)
      }
    },
    [synth, activeNote]
  )

  // useKeyboardEffect
  useEffect(() => {
    document.addEventListener('keydown', playNote)
    document.addEventListener('keyup', releaseNote)

    return () => {
      document.removeEventListener('keydown', playNote)
      document.removeEventListener('keyup', releaseNote)
    }
  }, [playNote, releaseNote])

  return (
    <div>
      <div>Keyboard!</div>
      <div>{activeNote}</div>
    </div>
  )
}
