/** Glottal source models — LF (Fant-Liljencrants-Lin 1985) and Rosenberg (1971) excitation waveforms. */
export interface LfCycleOptions {
  /** LF shape parameter, tense (0.3) .. breathy (2.7), default 1.7 */
  Rd?: number
}

export interface RosenbergCycleOptions {
  /** open-phase fraction, default 0.4 */
  open?: number
  /** closing-phase fraction, default 0.16 */
  close?: number
}

export interface GlottisOptions {
  /** Hz, constant or a function t(seconds) => Hz, default 120 */
  f0?: number | ((t: number) => number)
  /** seconds, default 1 */
  duration?: number
  /** sample rate, default 44100 */
  fs?: number
  /** default 'lf' */
  model?: 'lf' | 'rosenberg'
  /** LF shape parameter (model: 'lf' only), default 1.7 */
  Rd?: number
  /** cycle-wise pitch perturbation, default 0.005 */
  jitter?: number
  /** cycle-wise amplitude perturbation, default 0.03 */
  shimmer?: number
  /** breath-noise amount, default 0.01 */
  aspiration?: number
  /** PRNG seed */
  seed?: number
}

/** One LF-model glottal-flow-derivative cycle, n samples. */
export function lfCycle(n: number, options?: LfCycleOptions): Float32Array
/** One Rosenberg glottal-flow cycle: rise cos ramp, fall cos ramp, closed rest. */
export function rosenbergCycle(n: number, options?: RosenbergCycleOptions): Float32Array

/** Continuous glottal source at f0 — LF by default, Rosenberg optional. */
export default function glottis(options?: GlottisOptions): Float32Array
