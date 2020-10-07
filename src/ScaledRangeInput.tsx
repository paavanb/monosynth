import React from 'react'
import { ScaleContinuousNumeric } from 'd3-scale'

interface ScaledRangeInputProps extends React.HTMLProps<HTMLInputElement> {
  scale: ScaleContinuousNumeric<number, number>
  onUpdate: (newValue: number) => void
  value: number
}

export default function ScaledRangeInput(
  props: ScaledRangeInputProps
): JSX.Element {
  const { scale, value, onUpdate, ...rest } = props

  return (
    <input
      {...rest}
      type="range"
      value={scale.invert(value)}
      onChange={(evt) => {
        const newValue = scale(parseFloat(evt.target.value))
        if (newValue !== undefined) onUpdate(newValue)
      }}
    />
  )
}
