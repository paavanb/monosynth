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

function immutableSetRemove<T>(set: Set<T>, value: T): Set<T> {
  const values = Array.from(set.values())
  const index = values.indexOf(value)
  return new Set([
    ...values.splice(0, index),
    ...values.splice(index + 1, values.length),
  ])
}

function immutableSetAdd<T>(set: Set<T>, value: T): Set<T> {
  return new Set([...set, value])
}

// Known Issue: For some reason, if B and N are pressed, the spacebar does not register.
const OTTAVA_ALTA_KEYS = new Set(['b', 'n', 'm', ',', '.'])
const OTTAVA_BASSA_KEYS = new Set(['v', 'c', 'x', 'z'])

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
  const [activeOttavaAltaKeys, setActiveOttavaAltaKeys] = useState<Set<string>>(
    new Set([])
  )
  const [activeOttavaBassaKeys, setActiveOttavaBassaKeys] = useState<
    Set<string>
  >(new Set([]))

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note !== undefined && !noteIsEqual(note, activeNote)) {
        setActiveNote(note)
      }

      if (OTTAVA_ALTA_KEYS.has(evt.key) && !activeOttavaAltaKeys.has(evt.key)) {
        setActiveOttavaAltaKeys((prevKeys) =>
          immutableSetAdd(prevKeys, evt.key)
        )
      }

      if (
        OTTAVA_BASSA_KEYS.has(evt.key) &&
        !activeOttavaBassaKeys.has(evt.key)
      ) {
        setActiveOttavaBassaKeys((prevKeys) =>
          immutableSetAdd(prevKeys, evt.key)
        )
      }
    },
    [activeNote, activeOttavaAltaKeys, activeOttavaBassaKeys]
  )

  const handleKeyUp = useCallback(
    (evt: KeyboardEvent) => {
      const note = KEYMAP[evt.key]
      if (note && noteIsEqual(note, activeNote)) {
        synth.triggerRelease()
        setActiveNote(null)
      }
      if (activeOttavaAltaKeys.has(evt.key)) {
        setActiveOttavaAltaKeys((prevKeys) =>
          immutableSetRemove(prevKeys, evt.key)
        )
      }

      if (activeOttavaBassaKeys.has(evt.key)) {
        setActiveOttavaBassaKeys((prevKeys) =>
          immutableSetRemove(prevKeys, evt.key)
        )
      }
    },
    [synth, activeNote, activeOttavaAltaKeys, activeOttavaBassaKeys]
  )

  // triggerAttack
  useEffect(() => {
    if (!activeNote) return

    const octaveOffset = activeOttavaAltaKeys.size - activeOttavaBassaKeys.size
    const playedNote = [activeNote[0], activeNote[1] + octaveOffset]
    synth.triggerAttack(playedNote.join(''))
  }, [activeNote, synth, activeOttavaAltaKeys, activeOttavaBassaKeys])

  // useKeyboardEffect
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  return (
    <div>
      <div>Keyboard!</div>
      <div>{activeNote}</div>
    </div>
  )
}
