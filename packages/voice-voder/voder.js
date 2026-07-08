// Voder (Dudley 1939) — channel speech synthesis: a buzz (voiced) or hiss (unvoiced)
// source fed through a bank of parallel bandpass filters whose per-band gains are the
// operator's "keys". Sequence phoneme-ish frames of band gains to speak.

let { sin, cos, exp, PI } = Math

// classic 10-band Voder layout, Hz
export const BANDS = [225, 450, 700, 1000, 1400, 2000, 2700, 3800, 5400, 7500]

// state-variable bandpass per band (Q ≈ 4)
function makeBank (fs) {
	return BANDS.map(fc => ({ f: 2 * sin(PI * Math.min(fc, fs / 2.5) / fs), q: 0.25, l: 0, b: 0 }))
}

/**
 * @param {Array} frames — [{ gains: number[10], voiced=true, f0=110, duration=0.15 }]
 * @param {object} opts — { fs=44100, amp=0.8, seed }
 * @returns {Float32Array}
 */
export default function voder (frames, opts = {}) {
	let fs = opts.fs ?? 44100
	let amp = opts.amp ?? 0.8
	let total = Math.ceil(frames.reduce((s, f) => s + (f.duration ?? 0.15), 0) * fs)
	let out = new Float32Array(total)
	let bank = makeBank(fs)
	let rnd = (opts.seed ?? 0xdea1) >>> 0
	let random = () => ((rnd = (rnd * 1664525 + 1013904223) >>> 0) / 2147483648 - 1)

	let pos = 0, phase = 0
	let gains = new Float64Array(BANDS.length)
	for (let fr of frames) {
		let n = Math.round((fr.duration ?? 0.15) * fs)
		let target = fr.gains ?? []
		let f0 = fr.f0 ?? 110
		let voiced = fr.voiced ?? true
		for (let i = 0; i < n && pos < total; i++, pos++) {
			// source: pulse-ish buzz or white hiss
			let src
			if (voiced) {
				phase += f0 / fs
				if (phase >= 1) phase -= 1
				src = phase < 0.1 ? 1 - phase / 0.05 : 0   // narrow decaying pulse, harmonic-rich
			} else src = random() * 0.7
			// per-band: smooth gains (5 ms), filter, sum
			let y = 0
			for (let b = 0; b < BANDS.length; b++) {
				gains[b] += (Math.min(1, (target[b] ?? 0)) - gains[b]) * (1 - exp(-1 / (0.005 * fs)))
				let st = bank[b]
				st.l += st.f * st.b
				let h = src - st.l - st.q * st.b
				st.b += st.f * h
				y += st.b * gains[b]
			}
			out[pos] = y * amp
		}
	}
	return out
}
