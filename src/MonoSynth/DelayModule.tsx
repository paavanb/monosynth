import React from 'react'
import { useState, useEffect } from 'react'
import { scalePow } from 'd3-scale'
import { format } from 'd3-format'
import * as Tone from 'tone'

import ScaledRangeInput from '../ScaledRangeInput'

import cs from './styles.module.css'

const scaleDelay = scalePow().exponent(2).domain([0, 1]).range([0, 1])
const scaleFeedback = scalePow().exponent(2).domain([0, 1]).range([0, 1])

const formatNumber = format('.2f')
const formatPercent = format('.0%')

interface DelayModuleProps {
  delayNode: Tone.FeedbackDelay
  disabled: boolean
  onDisabledChange: (disabled: boolean) => void
}

export default function DelayModule(props: DelayModuleProps): JSX.Element {
  const { delayNode, disabled, onDisabledChange } = props

  const [delayTime, setDelayTime] = useState(0.2)
  const [feedback, setFeedback] = useState(0.2)

  // syncDelay
  useEffect(() => {
    const now = Tone.now()
    delayNode.delayTime.setValueAtTime(delayTime, now)
  }, [delayTime, delayNode.delayTime])

  // syncFeedback
  useEffect(() => {
    const now = Tone.now()
    delayNode.feedback.setValueAtTime(feedback, now)
  }, [feedback, delayNode.feedback])

  return (
    <form style={{ textAlign: 'center', width: 300 }}>
      <div className={cs.inlineControl}>
        <label>
          <span>Enabled</span>
          <input
            type="checkbox"
            onChange={(evt) => onDisabledChange(!evt.target.checked)}
            checked={!disabled}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            Delay Time
            <output>{formatNumber(delayTime)}s</output>
          </span>
          <ScaledRangeInput
            scale={scaleDelay}
            min={0}
            max={1}
            step="0.01"
            value={delayTime}
            onUpdate={setDelayTime}
            disabled={disabled}
          />
        </label>
      </div>
      <div className={cs.control}>
        <label>
          <span>
            Feedback
            <output>{formatPercent(feedback)}</output>
          </span>
          <ScaledRangeInput
            scale={scaleFeedback}
            min={0}
            max={0.99}
            step="0.01"
            value={feedback}
            onUpdate={setFeedback}
            disabled={disabled}
          />
        </label>
      </div>
    </form>
  )
}
