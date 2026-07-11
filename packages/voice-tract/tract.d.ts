/** Kelly-Lochbaum vocal-tract waveguide (Pink Trombone class) — cylindrical sections, scattering junctions, lip/glottal reflection. */
export interface TractOptions {
  /** vowel name (see VOWELS) or a custom area-function array, default 'a' */
  shape?: string | number[]
  /** waveguide sections, default 24 */
  sections?: number
  /** lip-end reflection coefficient, default -0.85 */
  lipReflection?: number
  /** glottis-end reflection coefficient, default 0.75 */
  glottalReflection?: number
  /** per-junction damping, default 0.996 */
  damping?: number
  /** sample rate, default 44100 */
  fs?: number
  /** internal — waveguide state, carried across calls for streaming */
  _fwd?: Float64Array
  _bwd?: Float64Array
  _fj?: Float64Array
  _bj?: Float64Array
  [key: string]: unknown
}

/** Coarse 8-point area-function presets (glottis to lips, cm^2), interpolated to `sections`. */
export const VOWELS: Record<'a' | 'e' | 'i' | 'o' | 'u', number[]>

/** excitation: glottal source (see @audio/voice-glottis). Returns the radiated pressure signal. */
export default function tract(excitation: Float32Array, options?: TractOptions): Float32Array
