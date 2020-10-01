import React from 'react'
import { useMemo } from 'react'
import * as Tone from 'tone'

import Keyboard from './Keyboard'
import LFO from './LFO'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => {
    const monosynth = new Tone.MonoSynth().toDestination()
    return monosynth
  }, [])

  return (
    <div className={cs.synthContainer}>
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
      <LFO synth={synth} />
      <Keyboard synth={synth} />
    </div>
  )
}
