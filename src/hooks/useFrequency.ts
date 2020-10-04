import { useState, useEffect } from 'react'
import * as Tone from 'tone'

export default function useFrequency(
  frequencySignal: Tone.Signal<'frequency'>
): [number, React.Dispatch<React.SetStateAction<number>>] {
  const [freq, setFreq] = useState(() =>
    Tone.Frequency(frequencySignal.value).toFrequency()
  )

  useEffect(() => {
    const now = Tone.now()
    // Make sure we don't accidentally schedule frequency changes at the same time
    frequencySignal.cancelScheduledValues(now)
    frequencySignal.setValueAtTime(freq, now)
  }, [freq, frequencySignal])

  return [freq, setFreq]
}
