// Kelly-Lochbaum vocal-tract waveguide (Pink Trombone class) — a chain of cylindrical
// sections with scattering at each area discontinuity, lip reflection radiating output,
// glottal reflection at the source end. Vowels = area-function presets (Story 1996
// lineage, coarse 8-point shapes interpolated to the section count).

const VOWELS = {
	// coarse area functions, glottis → lips (cm², normalized on load)
	a: [0.6, 0.4, 0.4, 0.5, 1.3, 2.6, 3.2, 2.4],
	e: [0.9, 1.6, 1.8, 1.4, 0.9, 0.8, 1.3, 2.0],
	i: [1.2, 2.4, 2.8, 1.8, 0.6, 0.3, 0.4, 0.6],
	o: [0.9, 0.6, 0.9, 1.2, 1.8, 2.2, 1.2, 0.5],
	u: [1.0, 0.9, 1.1, 1.0, 1.3, 1.6, 0.6, 0.2],
}

function areasFor (shape, N) {
	let src = typeof shape === 'string' ? VOWELS[shape] : shape
	if (!src) throw new RangeError(`tract: unknown vowel "${shape}"`)
	let out = new Float64Array(N)
	for (let i = 0; i < N; i++) {
		let x = i * (src.length - 1) / (N - 1)
		let a = Math.floor(x), t = x - a
		out[i] = src[a] * (1 - t) + (src[Math.min(src.length - 1, a + 1)] || src[a]) * t
	}
	return out
}

/**
 * Run excitation through the tract. Streaming-friendly: state carried in opts.
 * @param {Float32Array} excitation — glottal source (see @audio/voice-glottis)
 * @param {object} opts — { shape='a' (vowel name | area array), sections=24,
 *   lipReflection=-0.85, glottalReflection=0.75, damping=0.996, fs=44100 }
 * @returns {Float32Array} radiated pressure
 */
export default function tract (excitation, opts = {}) {
	let N = opts.sections ?? 24
	let areas = areasFor(opts.shape ?? 'a', N)
	let kLip = opts.lipReflection ?? -0.85
	let kGlottis = opts.glottalReflection ?? 0.75
	let damp = opts.damping ?? 0.996

	// scattering coefficients at junctions from adjacent areas
	let k = new Float64Array(N - 1)
	for (let i = 0; i < N - 1; i++) k[i] = (areas[i] - areas[i + 1]) / (areas[i] + areas[i + 1])

	if (!opts._fwd || opts._fwd.length !== N) {
		opts._fwd = new Float64Array(N)      // rightward-travelling, per section
		opts._bwd = new Float64Array(N)      // leftward-travelling
		opts._fj = new Float64Array(N)       // junction outputs (double buffer)
		opts._bj = new Float64Array(N)
	}
	let fwd = opts._fwd, bwd = opts._bwd, fj = opts._fj, bj = opts._bj
	let out = new Float32Array(excitation.length)

	for (let s = 0; s < excitation.length; s++) {
		// boundary junctions: glottis injects + reflects, lips reflect
		fj[0] = excitation[s] * 0.1 + kGlottis * bwd[0]
		bj[N - 1] = kLip * fwd[N - 1]
		// interior junctions (Kelly-Lochbaum scattering) — all from current state
		for (let i = 0; i < N - 1; i++) {
			let w = k[i] * (fwd[i] + bwd[i + 1])
			fj[i + 1] = fwd[i] - w
			bj[i] = bwd[i + 1] + w
		}
		for (let i = 0; i < N; i++) {
			fwd[i] = fj[i] * damp
			bwd[i] = bj[i] * damp
		}
		out[s] = fwd[N - 1] * (1 + kLip)
	}
	return out
}

export { VOWELS }
