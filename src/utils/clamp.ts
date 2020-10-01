/**
 * Clamp a number between two others.
 */
export default function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
