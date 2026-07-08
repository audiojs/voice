import test, { almost, ok, is } from 'tst'
import { glottis, lfCycle, rosenbergCycle, tract, voder, VOWELS, BANDS } from './index.js'

const fs = 44100

function goertzel (d, f, from = 4000, to = d.length - 2000) {
	let w = 2 * Math.PI * f / fs, cw = Math.cos(w), s1 = 0, s2 = 0
	for (let i = from; i < to; i++) { let s0 = d[i] + 2 * cw * s1 - s2; s2 = s1; s1 = s0 }
	return Math.sqrt(Math.max(0, s1 * s1 + s2 * s2 - 2 * cw * s1 * s2)) / (to - from)
}

test('glottis — LF source is periodic at f0, harmonics decay, deterministic', () => {
	let g = glottis({ f0: 120, duration: 0.5, fs, jitter: 0, shimmer: 0, aspiration: 0 })
	let c = 0
	for (let i = 1; i < g.length; i++) if (g[i - 1] <= 0 && g[i] > 0) c++
	almost(c / 0.5, 120, 2, 'cycle rate = f0')
	ok(goertzel(g, 120) > goertzel(g, 1200), 'harmonic rolloff')
	ok(g.every(isFinite))
	let g2 = glottis({ f0: 120, duration: 0.5, fs, jitter: 0, shimmer: 0, aspiration: 0 })
	ok(g.every((x, i) => x === g2[i]), 'deterministic')
})

test('glottis — LF cycle: open-phase rise then sharp negative excursion at closure', () => {
	let c = lfCycle(256, { Rd: 1.7 })
	let peakIdx = c.indexOf(Math.max(...c))
	let minIdx = c.indexOf(Math.min(...c))
	ok(peakIdx < minIdx, 'positive peak precedes the closing negative spike')
	ok(Math.min(...c) < -0.5, 'strong closure excitation')
	let r = rosenbergCycle(256)
	ok(Math.max(...r) > 0.9 && Math.min(...r) >= -1e-9, 'rosenberg is a flow pulse (non-negative)')
})

test('tract — vowel area functions shape formants: /a/ low-F1, /i/ high-F2', () => {
	let e = glottis({ f0: 120, duration: 0.5, fs, seed: 7 })
	let a = tract(Float32Array.from(e), { shape: 'a', fs: 44100 })
	let i = tract(Float32Array.from(e), { shape: 'i', fs: 44100 })
	ok(a.every(isFinite) && i.every(isFinite), 'stable waveguide')
	let aRatio = goertzel(a, 720) / (goertzel(a, 2400) + 1e-12)
	let iRatio = goertzel(i, 720) / (goertzel(i, 2400) + 1e-12)
	ok(aRatio > iRatio * 3, `/a/ concentrates F1, /i/ shifts up (${aRatio.toFixed(1)} vs ${iRatio.toFixed(1)})`)
})

test('tract — custom area function + unknown vowel throws', () => {
	let e = glottis({ f0: 110, duration: 0.2, fs })
	let y = tract(Float32Array.from(e), { shape: [1, 1, 2, 3, 2, 1, 0.5, 0.4] })
	ok(y.every(isFinite))
	let threw = false
	try { tract(e, { shape: 'x' }) } catch { threw = true }
	ok(threw)
})

test('voder — band keys route energy; voiced vs hiss sources differ', () => {
	let v = voder([
		{ gains: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], f0: 110, duration: 0.4 },        // 700 Hz band
		{ gains: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0], voiced: false, duration: 0.4 },  // 3.8 kHz hiss
	], { fs })
	let n = Math.round(0.4 * fs)
	ok(goertzel(v, 700, 2000, n - 2000) > goertzel(v, 3800, 2000, n - 2000) * 3, 'frame 1 keyed to 700')
	ok(goertzel(v, 3800, n + 2000, 2 * n - 2000) > goertzel(v, 700, n + 2000, 2 * n - 2000) * 3, 'frame 2 keyed to 3.8k')
	ok(v.every(isFinite))
	is(BANDS.length, 10)
})
