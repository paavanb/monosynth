import React from 'react'
import { useState, useMemo, useCallback, useLayoutEffect } from 'react'
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
import ToneViz from './ToneViz'
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
  // Since Tonejs objects are mutable, change events instead trigger a change
  // in this state variable, which we can then use as dependencies for hooks
  const [oscillatorChangeId, setOscillatorChangeId] = useState(0)
  const fft = useMemo(() => new Tone.FFT(1024), [])
  const waveform = useMemo(() => new Tone.Waveform(2048), [])
  const [subOscEnabled, setSubOscEnabled] = useState(false)
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

  const recordOscillator = useCallback(
    (context: Tone.Context) => {
      const now = Tone.now()

      // Clone the oscillator
      const { harmonicity, width } = synth.oscillator
      const osc = new Tone.OmniOscillator({
        context,
        frequency: 440,
        type: synth.oscillator.type,
        harmonicity: harmonicity && harmonicity.getValueAtTime(now),
        width: width && width.getValueAtTime(now),
      })

      // Clone the filter
      const { Q, gain, type: filterType } = synth.filter
      const { baseFrequency } = synth.filterEnvelope
      const filter = new Tone.Filter({
        type: filterType,
        frequency: Tone.Frequency(baseFrequency).toFrequency(),
        Q: Q.getValueAtTime(now),
        gain: gain.getValueAtTime(now),
      })
      osc.chain(filter, context.destination).start()
    },
    // CAREFUL: Since we need oscillatorChangeId as a hook dep, we have to disable
    // the rule. Watch dependencies carefully!
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [synth.oscillator, oscillatorChangeId] // Re-record if oscillator changed
  )

  const triggerOscillatorChange = useCallback(() => {
    // 1000 is just to avoid integer overflow, large enough that multiple
    // calls still trigger a change.
    setOscillatorChangeId((prevId) => (prevId + 1) % 1000)
  }, [])

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
    synth.chain(fft, waveform, Tone.Destination)

    // The last component before Tone.Destination
    const lastComponent = waveform
    const subOscPitchShift = new Tone.PitchShift({
      pitch: -12,
      context: lastComponent.context,
    })
    const subSubOscPitchShift = new Tone.PitchShift({
      pitch: -24,
      context: lastComponent.context,
    })
    if (subOscEnabled) {
      lastComponent.chain(subOscPitchShift, Tone.Destination)
    }
    if (subSubOscEnabled) {
      lastComponent.chain(subSubOscPitchShift, Tone.Destination)
    }

    return () => {
      synth.toDestination()
      fft.disconnect()
      waveform.disconnect()
      subOscPitchShift.disconnect().dispose()
      subSubOscPitchShift.disconnect().dispose()
    }
  }, [synth, fft, waveform, subOscEnabled, subSubOscEnabled])

  return (
    <div className={cs.synthContainer}>
      <div className={cs.synthControls}>
        <FFTViz meter={fft} />
        <WaveformViz meter={waveform} />
      </div>
      <div className={cs.synthControls}>
        <ToneViz
          contextRecorder={recordOscillator}
          recordDuration={0.01}
          bounds={[-1, 1]}
        />
        <div>
          <header>VCO</header>
          <VCO
            oscillator={synth.oscillator}
            onChange={triggerOscillatorChange}
          />
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
            onChange={triggerOscillatorChange}
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
