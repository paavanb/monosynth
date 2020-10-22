import React from 'react'
import { useMemo, useCallback, useEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'

import Keyboard from './Keyboard'
import RibbonKeyboard from './RibbonKeyboard'
import VCO from './VCO'
import LFOPad from './LFOPad'
import ScaledEnvelope from './ScaledEnvelope'
import FilterController from './FilterController'
import EnvelopeController from './EnvelopeController'
import ScaledEnvelopeController from './ScaledEnvelopeController'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

const positiveSemitoneFormat = format('+')

const detuneFormat = format('.1f')

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => new Tone.MonoSynth().toDestination(), [])

  const detuneLFO = useMemo(
    () => new Tone.LFO({ amplitude: 0, max: 1200, min: -1200 }),
    []
  )

  const pitchEnvelope = useMemo(
    () =>
      new ScaledEnvelope({
        min: -1200,
        max: 1200,
        fixedSustain: 0,
      }),
    []
  )

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

  const changeFrequency = useCallback(
    (hz: number) => {
      synth.oscillator.frequency.setValueAtTime(hz, Tone.now())
    },
    [synth.oscillator]
  )

  const formatDetune = useCallback(
    (detune: number) => `${detuneFormat(detune / 100)} st`,
    []
  )

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
  }, [detuneLFO, pitchEnvelope, synth.detune, pitchEnvelope.context])

  return (
    <div className={cs.synthContainer}>
      <div className={cs.synthControls}>
        <div>
          <header>VCO</header>
          <VCO oscillator={synth.oscillator} />
        </div>
        <div style={{ width: 300 }}>
          <header>Filter</header>
          <FilterController
            filterEnvelope={synth.filterEnvelope}
            filter={synth.filter}
          />
        </div>
        <div>
          <header>LFO</header>
          <LFOPad
            lfo={detuneLFO}
            leftAxisTickFormat={(d) => positiveSemitoneFormat(d.valueOf() * 12)}
            leftAxisLabel="Pitch"
          />
        </div>
      </div>
      <RibbonKeyboard
        onFrequencyChange={changeFrequency}
        triggerAttack={triggerAttack}
        triggerRelease={triggerRelease}
      />
      <div className={cs.synthControls}>
        <div>
          <header>Amplitude Envelope</header>
          <EnvelopeController envelope={synth.envelope} />
        </div>
        <div>
          <header>Pitch Envelope</header>
          <ScaledEnvelopeController
            envelope={pitchEnvelope}
            min={-2400}
            minLabel="Detune Min"
            formatMin={formatDetune}
            max={2400}
            maxLabel="Detune Max"
            formatMax={formatDetune}
            step={10}
          />
        </div>
        <div>
          <header>Filter Envelope</header>
          <EnvelopeController envelope={synth.filterEnvelope} />
        </div>
      </div>
      <Keyboard triggerAttack={triggerAttack} triggerRelease={triggerRelease} />
    </div>
  )
}
