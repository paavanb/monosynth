import React from 'react'
import { useState, useEffect } from 'react'
import * as Tone from 'tone'

export default function useNormalRangeParam(
  normalRangeParam: Tone.Param<'normalRange'>
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [value, setValue] = useState(normalRangeParam.value)
  useEffect(() => {
    const now = Tone.now()
    // Make sure we don't accidentally schedule frequency changes at the same time
    normalRangeParam.cancelScheduledValues(now)
    normalRangeParam.setValueAtTime(value, now)
  }, [normalRangeParam, value])

  return [value, setValue]
}
