import React from 'react'
import { useCallback, useEffect } from 'react'
import * as Tone from 'tone'

import { Dictionary } from '../types'

const KEYMAP: Dictionary<string, string> = {
  q: 'Fb3',
  a: 'F3',
  w: 'Gb3',
  s: 'G3',
  e: 'Ab3',
  d: 'A3',
  r: 'Bb3',
  f: 'B3',
  ' ': 'C4', // Middle C
  y: 'C#4',
  h: 'D4',
  u: 'D#4',
  j: 'E4',
  k: 'F4',
  i: 'F#4',
  l: 'G4',
  o: 'G#4',
}

interface KeyboardProps {
  synth: Tone.MonoSynth
}

export default function Keyboard(props: KeyboardProps): JSX.Element {
  const { synth } = props

  const playNote = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note !== undefined) {
        const now = Tone.now()
        synth.triggerAttack(note, now)
      }
    },
    [synth]
  )

  const releaseNote = useCallback(
    (evt: KeyboardEvent) => {
      const now = Tone.now()
      synth.triggerRelease(now)
    },
    [synth]
  )

  useEffect(() => {
    document.addEventListener('keydown', playNote)
    document.addEventListener('keyup', releaseNote)

    return () => {
      document.removeEventListener('keydown', playNote)
      document.removeEventListener('keyup', releaseNote)
    }
  }, [playNote, releaseNote])

  return (<div>Keyboard!</div>)
}
