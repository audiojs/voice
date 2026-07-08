// Glottal source models — excitation waveforms for tract/formant synthesis:
// LF model (Fant–Liljencrants–Lin 1985, the standard voice-source parameterization,
// Rd-controlled via Fant 1994's regression) and the Rosenberg (1971) pulse.

let { sin, cos, exp, PI } = Math

/** One LF-model glottal-flow-derivative cycle, n samples. Rd ∈ [0.3..2.7] tense→breathy. */
export function lfCycle (n, { Rd = 1.7 } = {}) {
	// Fant 1994 regression: Rd → timing parameters Ra, Rk, Rg
	let Ra = (-1 + 4.8 * Rd) / 100
	let Rk = (22.4 + 11.8 * Rd) / 100
	let Rg = 1 / (4 * ((0.11 * Rd / (0.5 + 1.2 * Rk)) - Ra) / Rk)
	let Te = (1 + Rk) / (2 * Rg)             // open-phase end (fraction of cycle)
	let Ta = Ra                              // return-phase constant
	let Tp = 1 / (2 * Rg)                    // flow peak

	// solve for epsilon (return phase): ε·Ta = 1 − e^(−ε(1−Te))
	let eps = 1 / Ta
	for (let i = 0; i < 16; i++) eps = (1 - exp(-eps * (1 - Te))) / Ta

	// solve α by bisection on the flow area balance ∫₀¹ E(t) dt = 0 (flow starts and
	// ends at zero). E normalized so the closure spike E(Te) = −1: open phase
	// e^(α(t−Te))·sin(wg·t)/|sin(wg·Te)| — bounded for all α, no overflow.
	let wg = PI / Tp
	let sTe = Math.abs(sin(wg * Te))
	let eRet = 1 - exp(-eps * (1 - Te))      // return-phase normalizer (continuity at Te)
	let open = (t, alpha) => exp(alpha * (t - Te)) * sin(wg * t) / sTe
	let area = (alpha) => {
		let s = 0, N = 400
		for (let k = 0; k < N; k++) {
			let t = Te * (k + 0.5) / N
			s += open(t, alpha) * (Te / N)
		}
		// ∫ over [Te,1] of −(e^(−ε(t−Te)) − e^(−ε(1−Te)))/eRet
		let ret = -((1 - exp(-eps * (1 - Te))) / eps - (1 - Te) * exp(-eps * (1 - Te))) / eRet
		return s + ret
	}
	// area is decreasing in α (larger α discounts the early positive arc)
	let lo = -100, hi = 100
	for (let i = 0; i < 60; i++) {
		let mid = (lo + hi) / 2
		if (area(mid) > 0) lo = mid; else hi = mid
	}
	let alpha = (lo + hi) / 2

	let out = new Float32Array(n)
	for (let i = 0; i < n; i++) {
		let t = i / n
		out[i] = t < Te
			? open(t, alpha)                                                      // open phase
			: -(exp(-eps * (t - Te)) - exp(-eps * (1 - Te))) / eRet               // return phase, −1 → 0
	}
	return out
}

/** One Rosenberg glottal-flow cycle: rise cos ramp, fall cos ramp, closed rest. */
export function rosenbergCycle (n, { open = 0.4, close = 0.16 } = {}) {
	let out = new Float32Array(n)
	let n1 = Math.round(open * n), n2 = Math.round(close * n)
	for (let i = 0; i < n1; i++) out[i] = 0.5 * (1 - cos(PI * i / n1))
	for (let i = 0; i < n2; i++) out[n1 + i] = cos(PI * i / (2 * n2))
	return out
}

/**
 * Continuous glottal source at f0 — LF by default, Rosenberg optional; jitter/shimmer
 * (cycle-wise pitch/amplitude perturbation) + aspiration noise for naturalness.
 * @param {object} opts — { f0=120 | f0(t), duration=1, fs=44100, model='lf', Rd=1.7,
 *   jitter=0.005, shimmer=0.03, aspiration=0.01, seed }
 * @returns {Float32Array}
 */
export default function glottis ({ f0 = 120, duration = 1, fs = 44100, model = 'lf', Rd = 1.7, jitter = 0.005, shimmer = 0.03, aspiration = 0.01, seed = 0x51ab } = {}) {
	let n = Math.ceil(duration * fs)
	let out = new Float32Array(n)
	let rnd = seed >>> 0
	let random = () => ((rnd = (rnd * 1664525 + 1013904223) >>> 0) / 2147483648 - 1)
	let getF0 = typeof f0 === 'function' ? f0 : () => f0

	let pos = 0
	while (pos < n) {
		let f = Math.max(20, getF0(pos / fs) * (1 + jitter * random()))
		let period = Math.max(8, Math.round(fs / f))
		let cyc = model === 'rosenberg' ? rosenbergCycle(period) : lfCycle(period, { Rd })
		let amp = 1 + shimmer * random()
		for (let i = 0; i < period && pos + i < n; i++) {
			out[pos + i] = cyc[i] * amp + aspiration * random()
		}
		pos += period
	}
	return out
}
