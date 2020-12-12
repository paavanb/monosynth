import React from 'react'
import { useState, useMemo, useCallback, useLayoutEffect } from 'react'
import * as Tone from 'tone'
import { format } from 'd3-format'
import cx from 'classnames'

import RibbonKeyboard from './RibbonKeyboard'
import VCO from './VCO'
import LFOPad from './LFOPad'
import ScaledEnvelope from './ScaledEnvelope'
import FilterController from './FilterController'
import EnvelopeController from './EnvelopeController'
import ScaledEnvelopeController from './ScaledEnvelopeController'
import FFTViz from './FFTViz'
import WaveformViz from './WaveformViz'
import HarmonicsController from './HarmonicsController'
import cs from './styles.module.css'

// Avoid lookAhead delay https://github.com/Tonejs/Tone.js/issues/306
Tone.context.lookAhead = 0

const positiveSemitoneFormat = format('+')

const detuneFormat = format('.1f')

export default function MonoSynth(): JSX.Element {
  const synth = useMemo(() => new Tone.MonoSynth().toDestination(), [])
  const fft = useMemo(() => new Tone.FFT(1024), [])
  const waveform = useMemo(() => new Tone.Waveform(2048), [])
  const subOscillator = useMemo(
    () => new Tone.Oscillator({ type: 'sine', context: synth.context }),
    [synth.context]
  )
  const [subOscEnabled, setSubOscEnabled] = useState(false)
  const subSubOscillator = useMemo(
    () => new Tone.Oscillator({ type: 'sine', context: synth.context }),
    [synth.context]
  )
  const [subSubOscEnabled, setSubSubOscEnabled] = useState(false)

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
      const now = synth.now()
      synth.triggerAttack(note, now)
      pitchEnvelope.triggerAttack(now)

      // Set frequencies for sub oscillators
      const freq = Tone.Frequency(note).toFrequency()
      subOscillator.frequency.setValueAtTime(freq / 2, now)
      subOscillator.start(now)
      subSubOscillator.frequency.setValueAtTime(freq / 4, now)
      subSubOscillator.start(now)
    },
    [synth, subOscillator, subSubOscillator, pitchEnvelope]
  )

  const triggerRelease = useCallback(() => {
    synth.triggerRelease()
    subOscillator.stop()
    subSubOscillator.stop()
    pitchEnvelope.triggerRelease()
  }, [synth, subOscillator, subSubOscillator, pitchEnvelope])

  const changeFrequency = useCallback(
    (hz: number) => {
      const now = Tone.now()
      synth.oscillator.frequency.setValueAtTime(hz, now)
      subOscillator.frequency.setValueAtTime(hz / 2, now)
      subSubOscillator.frequency.setValueAtTime(hz / 4, now)
    },
    [synth.oscillator, subOscillator, subSubOscillator]
  )

  const formatDetune = useCallback(
    (detune: number) => `${detuneFormat(detune / 100)} st`,
    []
  )

  // manageSynth
  // Wire up the detune LFO
  useLayoutEffect(() => {
    detuneLFO.connect(synth.detune).start()
    return () => {
      detuneLFO.stop().disconnect()
    }
  }, [detuneLFO, synth.detune])

  // Wire up the pitch envelope
  useLayoutEffect(() => {
    pitchEnvelope.connect(synth.detune)
    return () => {
      pitchEnvelope.disconnect()
    }
  }, [pitchEnvelope, synth.detune])

  useLayoutEffect(() => {
    // Pass the synth through the FFT so we can record the frequency distribution
    synth.connect(fft)
    synth.connect(waveform)
    synth.toDestination()

    if (subOscEnabled) {
      subOscillator.connect(synth.filter)
    }
    if (subSubOscEnabled) {
      subSubOscillator.connect(synth.filter)
    }

    return () => {
      subOscillator.disconnect()
      subSubOscillator.disconnect()
      synth.disconnect()
      synth.toDestination()
    }
  }, [
    synth,
    fft,
    waveform,
    subOscillator,
    subSubOscillator,
    subOscEnabled,
    subSubOscEnabled,
  ])

  return (
    <div className={cs.synthContainer}>
      <div className={cx(cs.keyboardContainer, cs.fixedFooter)}>
        <RibbonKeyboard
          onFrequencyChange={changeFrequency}
          triggerAttack={triggerAttack}
          triggerRelease={triggerRelease}
        />
      </div>
      <div className={cs.synthControls}>
        <div>
          <header>Spectrum Analyzer</header>
          <FFTViz meter={fft} />
        </div>
        <div>
          <header>Waveform Analyzer</header>
          <WaveformViz meter={waveform} />
        </div>
      </div>
      <div className={cs.synthControls}>
        <div>
          <header>VCO</header>
          <VCO oscillator={synth.oscillator} />
          <HarmonicsController
            subOscEnabled={subOscEnabled}
            subSubOscEnabled={subSubOscEnabled}
            onSubOscEnabledChange={setSubOscEnabled}
            onSubSubOscEnabledChange={setSubSubOscEnabled}
          />
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
    </div>
  )
}
