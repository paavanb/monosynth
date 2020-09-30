import React from 'react'
import { useMemo, useEffect, useCallback } from 'react'
import * as Tone from 'tone'
import cs from './styles.module.css'

function useKeyboard(props: { synth: Tone.MonoSynth }): void {
  const { synth } = props

  const handleKeyDown = useCallback(
    (evt: KeyboardEvent) => {
      const now = Tone.now()
      synth.triggerAttack('C4', now)
    },
    [synth]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])
}

export default function MonoSynth() {
  const synth = useMemo(() => {
    const monosynth = new Tone.MonoSynth().toDestination()
    return monosynth
  }, [])

  useEffect(() => {}, [synth])

  return (
    <div
      className={cs.synthContainer}
      onKeyDown={(evt) => {
        const now = Tone.now()
        synth.triggerAttack('C4', now)
      }}
      onKeyUp={(evt) => {
        const now = Tone.now()
        synth.triggerRelease(now)
      }}
    >
      <button
        onMouseDown={() => {
          const now = Tone.now()
          synth.triggerAttack('C4', now)
        }}
        onMouseUp={() => {
          const now = Tone.now()
          synth.triggerRelease(now)
        }}
      >
        Play Note
      </button>
    </div>
  )
}
