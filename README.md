# @audio/voice

> Voice *synthesis* (speech *analysis/processing* lives in `@audio/speech-*`).

| Package | What |
|---|---|
| `@audio/voice-glottis` | LF (Fant–Liljencrants–Lin) / Rosenberg glottal source — generator |
| `@audio/voice-tract` | Kelly-Lochbaum waveguide tract — [Pink Trombone](https://dood.al/pinktrombone/) class ([zakaton fork](https://github.com/zakaton/Pink-Trombone)) — filter |
| `@audio/voice-voder` | Dudley 1939 Voder recreation ([gmoe/voder](https://github.com/gmoe/voder/)) — frame sequencer |

Three distinct signatures, chained glottis → tract for articulatory synthesis, or voder standalone:

```js
import { glottis, tract, voder, VOWELS, BANDS } from '@audio/voice'

let excitation = glottis({ f0: 120, duration: 0.5 })       // → Float32Array (generator)
let vowel = tract(excitation, { shape: 'a' })               // Float32Array → Float32Array (filter)

let speech = voder([
	{ gains: [0,0,1,0,0,0,0,0,0,0], f0: 110, duration: 0.4 },  // frame: 10-band gains
])                                                            // frames[] → Float32Array
```

`glottis(opts: {f0=120, duration=1, fs=44100, model='lf', Rd=1.7, jitter=0.005, shimmer=0.03, aspiration=0.01, seed}) → Float32Array`

`tract(excitation: Float32Array, opts: {shape='a' (vowel name in VOWELS | area array), sections=24, lipReflection=-0.85, glottalReflection=0.75, damping=0.996, fs=44100}) → Float32Array`

`voder(frames: Array<{gains: number[10], voiced=true, f0=110, duration=0.15}>, opts: {fs=44100, amp=0.8, seed}) → Float32Array` — `BANDS` = the 10 channel center frequencies (225 Hz–7.5 kHz).

The site-todo "Voice generator (via natural tract gen)" idea. TTS = external/ML lane (see `@audio/neural`). Consumers: mridangam-syllable experiments, De-Slop resynthesis, `speech-world`.
