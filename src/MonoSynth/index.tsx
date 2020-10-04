import React from 'react'
import { useMemo, useEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'

import Keyboard from './Keyboard'
import VCO from './VCO'
import LFOPad from './LFOPad'
import FilterController from './FilterController'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

const semitoneFormat = format('+')

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => {
    const monosynth = new Tone.MonoSynth().toDestination()
    return monosynth
  }, [])

  const detuneLFO = useMemo(
    () => new Tone.LFO({ amplitude: 0.25, max: 1200, min: -1200 }),
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
      <div style={{display: 'flex'}}>
        <LFOPad
          lfo={detuneLFO}
          leftAxisTickFormat={(d) => semitoneFormat(d.valueOf() * 12)}
          leftAxisLabel="Pitch"
        />
        <FilterController filter={synth.filter} />
      </div>
      <Keyboard synth={synth} />
    </div>
  )
}
