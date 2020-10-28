import React from 'react'
import { useCallback, useEffect, useState, useMemo } from 'react'
import { Group } from '@vx/group'
import * as Tone from 'tone'
import { range } from 'd3'
import { debounce } from 'lodash'

import { AsyncValue } from '../types'

import { BasicEnvelopeCurve, EnvelopeCurve } from './types'
import cs from './styles.module.css'

const WIDTH = 300
const HEIGHT = 100

const INNER_WIDTH = 275
const INNER_HEIGHT = 80

enum Padding {
  Left = (WIDTH - INNER_WIDTH) / 2,
  Top = (HEIGHT - INNER_HEIGHT) / 2,
}

const MAX_ONSET_DURATION = 4
const MAX_RELEASE = 4
const SUSTAIN_DURATION = 0.5
const TOTAL_WIDTH_DURATION = MAX_ONSET_DURATION + SUSTAIN_DURATION + MAX_RELEASE

// NOTE: 3000 seems to be the minimum for at least Chrome
const ENVELOPE_SAMPLE_RATE = 3000
const ENVELOPE_VIZ_NUM_SAMPLES = 500

enum Margin {
  Top = 0,
  Right = 0,
  Bottom = 0,
  Left = 0,
}

interface EnvelopeVizProps {
  onsetDuration: number
  percentAttack: number
  sustain: number
  release: number
  attackCurve: EnvelopeCurve
  decayCurve: BasicEnvelopeCurve
  releaseCurve: EnvelopeCurve
}

export default function EnvelopeViz(props: EnvelopeVizProps): JSX.Element {
  const {
    onsetDuration,
    percentAttack,
    release,
    sustain,
    attackCurve,
    decayCurve,
    releaseCurve,
  } = props

  const [asyncEnvelopeBuffer, setAsyncEnvelopeBuffer] = useState<
    AsyncValue<Tone.ToneAudioBuffer>
  >({ status: 'pending' })

  const updateGraph = useMemo(
    () =>
      debounce(() => {
        Tone.Offline(
          () => {
            const env = new Tone.Envelope({
              attack: percentAttack * onsetDuration,
              decay: (1 - percentAttack) * onsetDuration,
              sustain,
              release,
              attackCurve,
              decayCurve,
              releaseCurve,
            }).toDestination()
            env.triggerAttackRelease(onsetDuration + SUSTAIN_DURATION)
          },
          TOTAL_WIDTH_DURATION,
          1,
          ENVELOPE_SAMPLE_RATE
        )
          .then((buffer) => {
            setAsyncEnvelopeBuffer({ status: 'ready', value: buffer })
          })
          .catch(() => {
            setAsyncEnvelopeBuffer({
              status: 'error',
              error: 'Error creating buffer.',
            })
          })
      }, 100),
    [
      onsetDuration,
      percentAttack,
      release,
      sustain,
      attackCurve,
      decayCurve,
      releaseCurve,
    ]
  )

  useEffect(() => {
    updateGraph()
  }, [updateGraph])

  const path = useMemo(() => {
    if (asyncEnvelopeBuffer.status !== 'ready') return null
    const buffer = asyncEnvelopeBuffer.value.get()

    if (!buffer) return null

    const bufferData = buffer.getChannelData(0)

    const length = buffer.length
    const linePath = new Array(length)
    // We use forEach since typed arrays (here: Float32Array) don't support mapping to arbitrary types
    bufferData.forEach((value, idx) => {
      linePath[idx] = `L ${(idx / length) * INNER_WIDTH} ${
        value * INNER_HEIGHT
      }`
    })
    // Resample the path so that we only draw a small number of points
    const sampleIndexes = range(0, length, length / ENVELOPE_VIZ_NUM_SAMPLES)
    const filteredLinePath = sampleIndexes.map((idx) => linePath[idx])

    return `M 0 0 ${filteredLinePath.join(' ')}`
  }, [asyncEnvelopeBuffer])

  return (
    <svg
      width={WIDTH + Margin.Left + Margin.Right}
      height={HEIGHT + Margin.Top + Margin.Bottom}
      className={cs.envelopeViz}
    >
      <Group left={Margin.Left} top={Margin.Top}>
        <rect className={cs.window} width={WIDTH} height={HEIGHT} />
        {/* Translate/scale so that origin is at bottom left */}
        <Group
          transform={`
            translate(${Padding.Left}, ${Padding.Top + INNER_HEIGHT})
            scale(1, -1)
          `}
        >
          {path && <path d={path} />}
        </Group>
      </Group>
    </svg>
  )
}
