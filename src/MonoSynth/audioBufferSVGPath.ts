import * as Tone from 'tone'
import { range } from 'd3'
import { scaleLinear, ScaleContinuousNumeric } from 'd3-scale'

/**
 * Return the string for an SVG path representing the data in the provided
 * ToneAudioBuffer. Values are scaled to a width x height rectangle.
 */
export default function audioBufferSVGPath(
  toneBuffer: Tone.ToneAudioBuffer,
  width: number,
  height: number,
  numSamples = 500,
  // Function to normalize the values in toneBuffer to [0, 1]
  scaleNormalize: ScaleContinuousNumeric<number, number> = scaleLinear()
): string | null {
  const buffer = toneBuffer.get()
  if (!buffer) return null

  const bufferData = buffer.getChannelData(0)

  const length = buffer.length
  // Resample the path so that we only draw a small number of points
  const sampleIndexes = range(0, length, Math.ceil(length / numSamples))
  const linePath = sampleIndexes.map((index) => {
    const value = bufferData[index]
    return `L ${(index / length) * width} ${
      (scaleNormalize(value) as number) * height
    }`
  })

  // Update the first instruction to be a (M)ove command
  // A little messy but these are large arrays
  linePath[0] = linePath[0].replace('L', 'M')

  return linePath.join(' ')
}
