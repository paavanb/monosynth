import React from 'react'
import { useCallback, useEffect, useState } from 'react'
import * as Tone from 'tone'

import { Dictionary } from '../types'

// Intuition: Hands should feel comfortable above home row. Spacebar is middle C.
const KEYMAP: Dictionary<string, string> = {
  1: 'Db3',
  q: 'D3',
  2: 'Eb3',
  w: 'E3',
  e: 'F3',
  4: 'Gb3',
  r: 'G3',
  5: 'Ab3',
  t: 'A3',
  6: 'Bb3',
  y: 'B3',
  ' ': 'C4', // Middle C
  7: 'C#4',
  u: 'D4',
  8: 'D#4',
  i: 'E4',
  o: 'F4',
  0: 'F#4',
  p: 'G4',
  '-': 'G#4',
  '[': 'A4',
  '=': 'A#4',
  ']': 'B4',
}

interface KeyboardProps {
  synth: Tone.MonoSynth
}

export default function Keyboard(props: KeyboardProps): JSX.Element {
  const { synth } = props
  const [activeNote, setActiveNote] = useState<string | null>(null)

  const playNote = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note !== undefined && note !== activeNote) {
        synth.triggerAttack(note)
        setActiveNote(note)
      }
    },
    [synth, activeNote]
  )

  const releaseNote = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note === activeNote) {
        synth.triggerRelease()
        setActiveNote(null)
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
