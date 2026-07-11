/** Dudley 1939 Voder recreation — buzz/hiss source through a 10-band parallel bandpass bank, per-band gains keyed by frame. */
export interface VoderFrame {
  /** 10 band gains, 0..1 */
  gains?: number[]
  /** default true */
  voiced?: boolean
  /** Hz, default 110 */
  f0?: number
  /** seconds, default 0.15 */
  duration?: number
}

export interface VoderOptions {
  /** sample rate, default 44100 */
  fs?: number
  /** default 0.8 */
  amp?: number
  /** PRNG seed for the unvoiced (hiss) source */
  seed?: number
}

/** Classic 10-band Voder layout, Hz. */
export const BANDS: number[]

export default function voder(frames: VoderFrame[], options?: VoderOptions): Float32Array
