# @audio/voice-tract

> Articulatory vocal-tract synthesis — Kelly-Lochbaum waveguide (Pink Trombone class)

A chain of cylindrical sections with scattering at each area discontinuity, lip reflection
radiating output, glottal reflection at the source end. Vowels are area-function presets
(Story 1996 lineage, coarse 8-point shapes interpolated to the section count).

```js
import tract, { VOWELS } from '@audio/voice-tract'
import glottis from '@audio/voice-glottis'

let excitation = glottis({ f0: 120, duration: 0.5 })
let vowel = tract(excitation, { shape: 'a' })   // → Float32Array
```

`tract(excitation: Float32Array, opts: {shape='a' (vowel name in VOWELS | area array), sections=24, lipReflection=-0.85, glottalReflection=0.75, damping=0.996, fs=44100}) → Float32Array`

`VOWELS` — the built-in area-function presets: `a`, `e`, `i`, `o`, `u`.

## Install

```
npm i @audio/voice-tract
```
