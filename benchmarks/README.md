# maraj benchmarks

Speed of `update` against the code before the fixes ([legacy/](legacy/)) and against other immutable update libraries.
This folder isn't published: the root `package.json` only ships `dist`, `README.md` and `LICENSE`,
so none of these libraries are installed with maraj.

> This file is written by `npm run bench`. Numbers depend on the machine, compare them only within one run.

Median speed against maraj in 11 scenarios (higher is faster)

```text
dot-prop-immutable     ██████████████████████████████  1.90x
timm                   ███████████████████             1.21x
maraj                  ████████████████                1.00x
object-path-immutable  ███████████████                 0.96x
immer (no autofreeze)  ███████████                     0.67x
immutability-helper    █████████                       0.60x
mutative               ████████                        0.53x
immer                  ███████                         0.46x
lodash/fp              ███████                         0.46x
```

## Run

```sh
cd benchmarks
npm install
npm run bench
```

## How it's measured

- [tinybench](https://github.com/tinylibs/tinybench) runs each library 500 ms per scenario, after 150 ms of warm-up.
- Each library gets its own base state, and paths, specs and values are built once, outside the timed code.
- Before timing, every library must return the same object as maraj (`deepStrictEqual`), a new reference, and leave its base state unchanged.
- One-path libraries (object-path-immutable, dot-prop-immutable, lodash/fp, timm) chain one call per path when a scenario updates several paths.
- "spread by hand" is the code you would write without a library; it's the upper limit, not a library.
- "immer" freezes its results (its default); "immer (no autofreeze)" doesn't, like the others.
- — means the library has no simple way to do it: immutability-helper can't create a missing path,
  and options like `onNewProps` only exist in maraj.
- Immutable.js is left out: it works on its own `Map`/`List` types, not on plain objects.

## Environment

- AMD Ryzen AI 9 HX 370 w/ Radeon 890M, win32 x64, Node 22.22.2
- immer 11.1.21, mutative 1.3.0, immutability-helper 3.1.1, object-path-immutable 4.1.2, dot-prop-immutable 2.1.1, lodash 4.18.1, timm 1.7.1, tinybench 6.2.1

## maraj before vs after the fixes

The fixes add two checks per path (`'__proto__'` and own props only, with `Object.hasOwn`).
Gaps under ~10% change sign from one run to the next on the same machine, so read them as noise.

| Scenario | maraj ops/s | Before fixes ops/s | Change | Fastest other library (ops/s) |
|---|---:|---:|---:|---|
| Top-level prop | 4,308,796 | 4,140,238 | +4.1% | dot-prop-immutable (6,132,068) |
| Nested prop (depth 3) | 1,238,407 | 1,167,290 | +6.1% | dot-prop-immutable (3,100,740) |
| Deep prop (depth 11) | 289,235 | 309,126 | -6.4% | dot-prop-immutable (1,257,549) |
| Item in a 1,000-item array | 720,515 | 761,469 | -5.4% | dot-prop-immutable (1,980,465) |
| 5 updates at once | 419,372 | 417,096 | +0.5% | dot-prop-immutable (798,645) |
| Function update | 1,117,590 | 1,100,291 | +1.6% | dot-prop-immutable (2,846,416) |
| Append to a 1,000-item array | 706,018 | 699,500 | +0.9% | timm (1,586,218) |
| Wide object (1,000 keys) | 7,963 | 7,583 | +5.0% | immer (no autofreeze) (8,403) |
| 100 items in a 1,000-item array | 11,031 | 11,594 | -4.9% | timm (15,787) |
| Create a missing path | 1,155,544 | 1,169,541 | -1.2% | dot-prop-immutable (4,002,306) |
| Reducer action | 409,652 | 404,117 | +1.4% | dot-prop-immutable (772,422) |
| Options set to 'error' | 414,143 | 418,777 | -1.1% | — |

## All results

### Top-level prop

Sets `active` on a small user object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 11,580,104 | 0.068 | ±4.38% | 2.69x faster |
| dot-prop-immutable | 6,132,068 | 0.187 | ±0.30% | 1.42x faster |
| **maraj** | 4,308,796 | 0.260 | ±1.51% | — |
| maraj (before fixes) | 4,140,238 | 0.290 | ±12.52% | 1.04x slower |
| timm | 3,197,055 | 0.342 | ±0.16% | 1.35x slower |
| object-path-immutable | 2,370,940 | 0.462 | ±3.92% | 1.82x slower |
| immutability-helper | 1,650,791 | 0.678 | ±2.16% | 2.61x slower |
| lodash/fp | 1,534,571 | 0.706 | ±4.65% | 2.81x slower |
| immer (no autofreeze) | 1,490,082 | 0.694 | ±0.63% | 2.89x slower |
| mutative | 1,288,917 | 0.931 | ±5.35% | 3.34x slower |
| immer | 1,100,846 | 0.975 | ±8.11% | 3.91x slower |

### Nested prop (depth 3)

Sets `profile.address.city`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,935,984 | 0.075 | ±1.58% | 8.83x faster |
| dot-prop-immutable | 3,100,740 | 0.369 | ±1.90% | 2.50x faster |
| timm | 1,494,760 | 0.702 | ±2.24% | 1.21x faster |
| **maraj** | 1,238,407 | 0.831 | ±0.29% | — |
| maraj (before fixes) | 1,167,290 | 0.887 | ±0.13% | 1.06x slower |
| object-path-immutable | 1,153,318 | 0.949 | ±1.71% | 1.07x slower |
| immer (no autofreeze) | 833,063 | 1.298 | ±1.35% | 1.49x slower |
| immutability-helper | 826,336 | 1.332 | ±1.69% | 1.50x slower |
| lodash/fp | 746,144 | 1.403 | ±4.34% | 1.66x slower |
| immer | 575,250 | 1.964 | ±7.09% | 2.15x slower |
| mutative | 563,253 | 1.873 | ±2.87% | 2.20x slower |

### Deep prop (depth 11)

Sets `level1.level2…level10.value`, every level has a sibling object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| dot-prop-immutable | 1,257,549 | 0.855 | ±1.04% | 4.35x faster |
| spread by hand | 758,460 | 1.389 | ±0.72% | 2.62x faster |
| timm | 373,361 | 3.149 | ±2.05% | 1.29x faster |
| object-path-immutable | 346,614 | 2.982 | ±0.62% | 1.20x faster |
| immer (no autofreeze) | 310,248 | 3.454 | ±0.91% | 1.07x faster |
| maraj (before fixes) | 309,126 | 3.381 | ±1.02% | 1.07x faster |
| immutability-helper | 304,268 | 3.695 | ±1.61% | 1.05x faster |
| **maraj** | 289,235 | 3.638 | ±0.60% | — |
| lodash/fp | 249,690 | 4.307 | ±0.83% | 1.16x slower |
| immer | 215,899 | 4.891 | ±0.86% | 1.34x slower |
| mutative | 170,998 | 6.750 | ±1.34% | 1.69x slower |

### Item in a 1,000-item array

Sets `items.500.done`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 5,225,181 | 0.303 | ±2.05% | 7.25x faster |
| dot-prop-immutable | 1,980,465 | 0.645 | ±1.41% | 2.75x faster |
| timm | 1,427,356 | 0.836 | ±1.62% | 1.98x faster |
| object-path-immutable | 990,292 | 1.136 | ±0.94% | 1.37x faster |
| maraj (before fixes) | 761,469 | 1.463 | ±0.93% | 1.06x faster |
| **maraj** | 720,515 | 1.572 | ±1.00% | — |
| immer (no autofreeze) | 535,042 | 2.069 | ±0.99% | 1.35x slower |
| mutative | 442,908 | 2.421 | ±0.85% | 1.63x slower |
| lodash/fp | 361,918 | 2.995 | ±3.83% | 1.99x slower |
| immer | 23,752 | 43.250 | ±0.62% | 30.33x slower |
| immutability-helper | 8,856 | 114.916 | ±0.68% | 81.36x slower |

### 5 updates at once

Sets `name`, `profile.address.city`, `profile.address.zip`, `profile.tags.0` and `settings.theme`; one-path libraries chain 5 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 9,804,405 | 0.099 | ±0.61% | 23.38x faster |
| dot-prop-immutable | 798,645 | 1.321 | ±0.79% | 1.90x faster |
| **maraj** | 419,372 | 2.542 | ±4.11% | — |
| maraj (before fixes) | 417,096 | 2.456 | ±0.20% | 1.01x slower |
| timm | 400,339 | 2.636 | ±0.84% | 1.05x slower |
| object-path-immutable | 280,865 | 3.718 | ±1.68% | 1.49x slower |
| immer (no autofreeze) | 268,088 | 3.916 | ±0.89% | 1.56x slower |
| immutability-helper | 262,046 | 3.897 | ±0.72% | 1.60x slower |
| immer | 224,467 | 4.841 | ±6.95% | 1.87x slower |
| mutative | 220,238 | 4.733 | ±0.73% | 1.90x slower |
| lodash/fp | 179,261 | 5.827 | ±0.90% | 2.34x slower |

### Function update

Uppercases `profile.address.city` with a function of the current value.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 9,818,981 | 0.101 | ±0.43% | 8.79x faster |
| dot-prop-immutable | 2,846,416 | 0.406 | ±3.60% | 2.55x faster |
| timm | 1,326,823 | 0.793 | ±0.92% | 1.19x faster |
| object-path-immutable | 1,126,445 | 0.950 | ±2.09% | 1.01x faster |
| **maraj** | 1,117,590 | 0.944 | ±0.59% | — |
| maraj (before fixes) | 1,100,291 | 0.947 | ±0.56% | 1.02x slower |
| immutability-helper | 639,367 | 1.708 | ±1.98% | 1.75x slower |
| lodash/fp | 635,373 | 1.737 | ±3.53% | 1.76x slower |
| immer (no autofreeze) | 622,224 | 1.677 | ±1.26% | 1.80x slower |
| immer | 450,221 | 2.553 | ±11.62% | 2.48x slower |
| mutative | 417,050 | 2.628 | ±1.50% | 2.68x slower |

### Append to a 1,000-item array

Adds one item at the end of `items`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| timm | 1,586,218 | 0.768 | ±2.33% | 2.25x faster |
| immutability-helper | 1,072,696 | 1.075 | ±2.13% | 1.52x faster |
| object-path-immutable | 968,882 | 1.365 | ±3.35% | 1.37x faster |
| spread by hand | 813,274 | 1.434 | ±1.18% | 1.15x faster |
| **maraj** | 706,018 | 1.668 | ±1.28% | — |
| maraj (before fixes) | 699,500 | 1.685 | ±2.95% | 1.01x slower |
| dot-prop-immutable | 694,288 | 1.722 | ±1.15% | 1.02x slower |
| mutative | 314,603 | 3.457 | ±1.19% | 2.24x slower |
| immer (no autofreeze) | 288,376 | 3.705 | ±0.77% | 2.45x slower |
| lodash/fp | 240,280 | 4.575 | ±2.54% | 2.94x slower |
| immer | 22,190 | 46.652 | ±0.71% | 31.82x slower |

### Wide object (1,000 keys)

Sets `key500.index` in an object with 1,000 top-level keys.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 873,817 | 1.255 | ±0.93% | 109.73x faster |
| immer (no autofreeze) | 8,403 | 124.684 | ±0.89% | 1.06x faster |
| **maraj** | 7,963 | 132.412 | ±1.00% | — |
| object-path-immutable | 7,670 | 139.370 | ±1.20% | 1.04x slower |
| immutability-helper | 7,584 | 138.072 | ±0.92% | 1.05x slower |
| maraj (before fixes) | 7,583 | 139.445 | ±1.04% | 1.05x slower |
| dot-prop-immutable | 7,294 | 144.068 | ±0.98% | 1.09x slower |
| mutative | 7,053 | 150.332 | ±1.14% | 1.13x slower |
| immer | 6,301 | 167.935 | ±2.43% | 1.26x slower |
| timm | 6,213 | 174.322 | ±1.41% | 1.28x slower |
| lodash/fp | 2,926 | 353.243 | ±1.15% | 2.72x slower |

### 100 items in a 1,000-item array

Sets `done` on every 10th item in one call; one-path libraries chain 100 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 766,380 | 1.519 | ±1.29% | 69.48x faster |
| timm | 15,787 | 69.629 | ±1.15% | 1.43x faster |
| dot-prop-immutable | 12,824 | 84.383 | ±1.15% | 1.16x faster |
| maraj (before fixes) | 11,594 | 89.567 | ±0.92% | 1.05x faster |
| immer (no autofreeze) | 11,339 | 91.609 | ±0.94% | 1.03x faster |
| **maraj** | 11,031 | 94.448 | ±0.99% | — |
| mutative | 10,519 | 98.532 | ±0.93% | 1.05x slower |
| object-path-immutable | 7,814 | 134.293 | ±1.07% | 1.41x slower |
| immer | 7,255 | 141.873 | ±0.97% | 1.52x slower |
| immutability-helper | 5,804 | 179.654 | ±1.06% | 1.90x slower |
| lodash/fp | 3,569 | 289.364 | ±1.09% | 3.09x slower |

### Create a missing path

Sets `address.location.city` on a user without `address`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,907,946 | 0.075 | ±0.53% | 9.44x faster |
| dot-prop-immutable | 4,002,306 | 0.264 | ±0.19% | 3.46x faster |
| timm | 2,170,756 | 0.485 | ±0.65% | 1.88x faster |
| object-path-immutable | 1,299,805 | 0.805 | ±1.03% | 1.12x faster |
| lodash/fp | 1,298,670 | 0.863 | ±6.71% | 1.12x faster |
| maraj (before fixes) | 1,169,541 | 0.901 | ±3.23% | 1.01x faster |
| **maraj** | 1,155,544 | 0.904 | ±0.26% | — |
| immer (no autofreeze) | 1,127,546 | 0.960 | ±1.20% | 1.02x slower |
| mutative | 936,639 | 1.113 | ±0.62% | 1.23x slower |
| immer | 760,368 | 1.496 | ±8.12% | 1.52x slower |

### Reducer action

Toggles `todos.42.done` (100 todos) and renames `users.byId.u7` (50 users), like a Redux reducer.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 7,325,078 | 0.183 | ±2.32% | 17.88x faster |
| dot-prop-immutable | 772,422 | 1.416 | ±1.10% | 1.89x faster |
| **maraj** | 409,652 | 2.562 | ±0.70% | — |
| maraj (before fixes) | 404,117 | 2.645 | ±1.86% | 1.01x slower |
| object-path-immutable | 389,164 | 2.720 | ±0.90% | 1.05x slower |
| timm | 383,745 | 2.792 | ±1.09% | 1.07x slower |
| immer (no autofreeze) | 263,023 | 4.021 | ±0.88% | 1.56x slower |
| lodash/fp | 187,913 | 5.580 | ±0.94% | 2.18x slower |
| mutative | 174,413 | 6.126 | ±1.27% | 2.35x slower |
| immer | 98,085 | 10.729 | ±0.95% | 4.18x slower |
| immutability-helper | 62,811 | 16.594 | ±0.73% | 6.52x slower |

### Options set to 'error'

Same as "5 updates at once" with `onNewProps` and `onNewIndexes` set to `'error'` (maraj only).

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| maraj (before fixes) | 418,777 | 2.486 | ±1.56% | 1.01x faster |
| **maraj** | 414,143 | 2.520 | ±0.83% | — |
