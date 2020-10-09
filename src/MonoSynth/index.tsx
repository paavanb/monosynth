import React from 'react'
import { useMemo, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'

import Keyboard from './Keyboard'
import VCO from './VCO'
import LFOPad from './LFOPad'
import PitchEnvelope from './PitchEnvelope'
import FilterController from './FilterController'
import EnvelopeController from './EnvelopeController'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

const semitoneFormat = format('+')

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => new Tone.MonoSynth().toDestination(), [])

  const detuneLFO = useMemo(
    () => new Tone.LFO({ amplitude: 0, max: 1200, min: -1200 }),
    []
  )

  const pitchEnvelope = useMemo(() => {
    const envelope = new PitchEnvelope()
    return envelope
  }, [])

  const triggerAttack = useCallback(
    (note: string | number | Tone.FrequencyClass<number>) => {
      synth.triggerAttack(note)
      pitchEnvelope.triggerAttack()
    },
    [synth, pitchEnvelope]
  )

  const triggerRelease = useCallback(() => {
    synth.triggerRelease()
    pitchEnvelope.triggerRelease()
  }, [synth, pitchEnvelope])

  // manageSynth
  useEffect(() => {
    // Wire up the detune LFO
    detuneLFO.connect(synth.detune).start()

    // Wire up the pitch envelope
    pitchEnvelope.connect(synth.detune)

    return () => {
      // Stop and disconnect from envelope
      detuneLFO.stop().disconnect()
      pitchEnvelope.disconnect()
    }
  }, [detuneLFO, pitchEnvelope, synth.detune])

  return (
    <div className={cs.synthContainer}>
      <div className={cs.synthControls}>
        <VCO oscillator={synth.oscillator} />
      </div>
      <div className={cs.synthControls}>
        <div>
          <header>LFO</header>
          <LFOPad
            lfo={detuneLFO}
            leftAxisTickFormat={(d) => semitoneFormat(d.valueOf() * 12)}
            leftAxisLabel="Pitch"
          />
        </div>
        <div>
          <header>Amplitude Envelope</header>
          <EnvelopeController envelope={synth.envelope} />
        </div>
        <div>
          <header>Pitch Envelope</header>
          <EnvelopeController envelope={pitchEnvelope} />
        </div>
        <div>
          <header>Filter Envelope</header>
          <EnvelopeController envelope={synth.filterEnvelope} />
          <div>
            <header>Filter</header>
            <FilterController
              filterEnvelope={synth.filterEnvelope}
              filter={synth.filter}
            />
          </div>
        </div>
      </div>
      <Keyboard triggerAttack={triggerAttack} triggerRelease={triggerRelease} />
    </div>
  )
}
