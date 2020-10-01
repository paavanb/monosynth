import React from 'react'
import { useMemo, useEffect } from 'react'
import * as Tone from 'tone'

import Keyboard from './Keyboard'
import VCO from './VCO'
import LFO from './LFO'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => {
    const monosynth = new Tone.MonoSynth().toDestination()
    return monosynth
  }, [])

  const autoFilter = useMemo(
    () =>
      new Tone.AutoFilter({
        frequency: 2,
        depth: 0.6,
      }),
    []
  )

  // manageSynth
  useEffect(() => {
    // Wire up the auto filter
    synth.oscillator.disconnect().connect(autoFilter)
    autoFilter.connect(synth.envelope).start()

    return () => {
      // Stop and disconnect from envelope
      autoFilter.stop().disconnect()

      // Disconnect from autofilter and reconnect to envelope
      synth.oscillator.disconnect().connect(synth.envelope)
    }
  }, [autoFilter, synth.oscillator, synth.envelope])

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
      <LFO autoFilter={autoFilter} />
      <Keyboard synth={synth} />
    </div>
  )
}
