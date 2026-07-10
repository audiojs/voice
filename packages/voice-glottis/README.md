# @audio/voice-glottis

> Glottal source models — LF model, Rosenberg pulse (excitation for tract/formant synthesis)

LF model (Fant–Liljencrants–Lin 1985, Rd-controlled via Fant 1994's regression) and the
Rosenberg (1971) pulse, cycle-repeated with jitter/shimmer/aspiration noise.

```js
import glottis, { lfCycle, rosenbergCycle } from '@audio/voice-glottis'

let excitation = glottis({ f0: 120, duration: 0.5 })   // → Float32Array
```

`glottis(opts: {f0=120, duration=1, fs=44100, model='lf', Rd=1.7, jitter=0.005, shimmer=0.03, aspiration=0.01, seed}) → Float32Array`

`lfCycle(n, {Rd=1.7})` / `rosenbergCycle(n)` — single-cycle waveforms, for custom sequencing.

## Install

```
npm i @audio/voice-glottis
```
