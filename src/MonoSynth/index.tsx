import React from 'react'
import { useMemo, useEffect } from 'react'
import * as Tone from 'tone'

import Keyboard from './Keyboard'
import VCO from './VCO'
import LFOPad from './LFOPad'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => {
    const monosynth = new Tone.MonoSynth().toDestination()
    return monosynth
  }, [])

  const detuneLFO = useMemo(
    () => new Tone.LFO({ amplitude: 0.2, max: 600, min: -600 }),
    []
  )

  // manageSynth
  useEffect(() => {
    // Wire up the detune LFO
    detuneLFO.connect(synth.detune).start()

    return () => {
      // Stop and disconnect from envelope
      detuneLFO.stop().disconnect()
    }
  }, [detuneLFO, synth.detune])

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
      <VCO oscillator={synth.oscillator} />
      {/* TODO Replace props with just LFO? */}
      <LFOPad
        frequencySignal={detuneLFO.frequency}
        depthParam={detuneLFO.amplitude}
      />
      <Keyboard synth={synth} />
    </div>
  )
}
