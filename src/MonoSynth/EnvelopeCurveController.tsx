import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'

import { SelectOption } from '../types'

import { BasicEnvelopeCurve, EnvelopeCurve } from './types'
import cs from './styles.module.css'

const BASIC_CURVE_OPTIONS: SelectOption<BasicEnvelopeCurve>[] = [
  { label: 'Linear', value: 'linear' as const },
  { label: 'Exponential', value: 'exponential' as const },
]

const ALL_CURVE_OPTIONS: SelectOption<EnvelopeCurve>[] = [
  { label: 'Linear', value: 'linear' as const },
  { label: 'Exponential', value: 'exponential' as const },
  { label: 'Sine', value: 'sine' as const },
  { label: 'Cosine', value: 'cosine' as const },
  { label: 'Bounce', value: 'bounce' as const },
  { label: 'Ripple', value: 'ripple' as const },
  { label: 'Step', value: 'step' as const },
]

interface EnvelopeCurveControllerProps {
  attackCurve: EnvelopeCurve
  onAttackCurveChange: (val: EnvelopeCurve) => void
  decayCurve: BasicEnvelopeCurve
  onDecayCurveChange: (val: BasicEnvelopeCurve) => void
  releaseCurve: EnvelopeCurve
  onReleaseCurveChange: (val: EnvelopeCurve) => void
}

export default function EnvelopeCurveController(
  props: EnvelopeCurveControllerProps
): JSX.Element {
  const {
    attackCurve,
    onAttackCurveChange,
    decayCurve,
    onDecayCurveChange,
    releaseCurve,
    onReleaseCurveChange,
  } = props

  return (
    <>
      <div className={cs.inlineControl}>
        <label>
          Attack Curve
          <select
            name="attack-curve"
            value={attackCurve}
            onChange={(evt) =>
              onAttackCurveChange(evt.target.value as EnvelopeCurve)
            }
          >
            {ALL_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={cs.inlineControl}>
        <label>
          Decay Curve
          <select
            name="decay-curve"
            value={decayCurve}
            onChange={(evt) =>
              onDecayCurveChange(evt.target.value as BasicEnvelopeCurve)
            }
          >
            {BASIC_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className={cs.inlineControl}>
        <label>
          Release Curve
          <select
            name="release-curve"
            value={releaseCurve}
            onChange={(evt) =>
              onReleaseCurveChange(evt.target.value as EnvelopeCurve)
            }
          >
            {ALL_CURVE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  )
}
