# @audio/voice-voder

> Voder — manual formant/channel speech synthesis (Dudley 1939 recreation)

A buzz (voiced) or hiss (unvoiced) source fed through a bank of 10 parallel bandpass
filters whose per-band gains are the operator's "keys" — sequence phoneme-ish frames of
band gains to speak.

```js
import voder, { BANDS } from '@audio/voice-voder'

let speech = voder([
	{ gains: [0,0,1,0,0,0,0,0,0,0], f0: 110, duration: 0.4 },       // voiced, 700 Hz band
	{ gains: [0,0,0,0,0,0,0,1,0,0], voiced: false, duration: 0.4 }, // hiss, 3.8 kHz band
])   // → Float32Array
```

`voder(frames: Array<{gains: number[10], voiced=true, f0=110, duration=0.15}>, opts: {fs=44100, amp=0.8, seed}) → Float32Array`

`BANDS` — the 10 channel center frequencies, Hz: `[225, 450, 700, 1000, 1400, 2000, 2700, 3800, 5400, 7500]`.

## Install

```
npm i @audio/voice-voder
```
