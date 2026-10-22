# maraj benchmarks

Speed of `update` against its earlier versions ([versions/](versions/)) and against other immutable update libraries.
This folder isn't published: the root `package.json` only ships `dist`, `README.md` and `LICENSE`,
so none of these libraries are installed with maraj.

> This file is written by `npm run bench`. Numbers depend on the machine, compare them only within one run.

Median speed against maraj in 11 scenarios (higher is faster)

```text
dot-prop-immutable     ██████████████████████████████  1.32x
maraj                  ███████████████████████         1.00x
timm                   ████████████████                0.71x
object-path-immutable  ████████████                    0.54x
immer (no autofreeze)  █████████                       0.42x
mutative               ████████                        0.35x
lodash/fp              ████████                        0.33x
immutability-helper    ████████                        0.33x
immer                  ██████                          0.24x
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

## maraj against 3.0.0 and 2.11.0

- 3.0.0 added two checks per path (`'__proto__'` and own props only), with no measurable cost against 2.11.0.
- After 3.0.0, each level of a path costs less: the dotted-key check slices the path instead of joining
  the keys again (`'a.b.c'` -> `'b.c'` -> `'c'`), keys are read by index instead of `shift()`,
  and paths already copied skip the type checks.
- Gaps under ~10% change sign from one run to the next on the same machine, so read them as noise.

| Scenario | maraj ops/s | 3.0.0 ops/s | vs 3.0.0 | 2.11.0 ops/s | Fastest other library (ops/s) |
|---|---:|---:|---:|---:|---|
| Top-level prop | 4,595,716 | 4,601,907 | -0.1% | 4,343,236 | dot-prop-immutable (6,023,359) |
| Nested prop (depth 3) | 2,230,374 | 1,339,680 | +66.5% | 1,330,240 | dot-prop-immutable (2,981,138) |
| Deep prop (depth 11) | 644,099 | 308,188 | +109.0% | 312,810 | dot-prop-immutable (1,320,415) |
| Item in a 1,000-item array | 1,033,302 | 759,214 | +36.1% | 781,008 | dot-prop-immutable (1,965,515) |
| 5 updates at once | 837,765 | 440,416 | +90.2% | 452,938 | dot-prop-immutable (770,455) |
| Function update | 1,929,741 | 1,225,264 | +57.5% | 1,161,867 | dot-prop-immutable (2,551,035) |
| Append to a 1,000-item array | 757,075 | 750,494 | +0.9% | 651,246 | timm (1,648,401) |
| Wide object (1,000 keys) | 7,156 | 6,480 | +10.4% | 6,858 | object-path-immutable (7,378) |
| 100 items in a 1,000-item array | 16,835 | 12,408 | +35.7% | 11,136 | timm (16,045) |
| Create a missing path | 2,209,028 | 1,241,095 | +78.0% | 1,144,693 | dot-prop-immutable (3,115,128) |
| Reducer action | 314,354 | 214,355 | +46.7% | 228,422 | dot-prop-immutable (413,591) |
| Options set to 'error' | 464,457 | 243,074 | +91.1% | 235,998 | — |

## All results

### Top-level prop

Sets `active` on a small user object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 11,845,916 | 0.067 | ±10.42% | 2.58x faster |
| dot-prop-immutable | 6,023,359 | 0.194 | ±4.22% | 1.31x faster |
| maraj 3.0.0 | 4,601,907 | 0.236 | ±1.23% | 1.00x faster |
| **maraj** | 4,595,716 | 0.232 | ±0.26% | — |
| maraj 2.11.0 | 4,343,236 | 0.250 | ±0.44% | 1.06x slower |
| timm | 3,268,777 | 0.315 | ±0.12% | 1.41x slower |
| object-path-immutable | 2,462,763 | 0.430 | ±1.46% | 1.87x slower |
| immutability-helper | 1,615,148 | 0.683 | ±1.71% | 2.85x slower |
| lodash/fp | 1,539,810 | 0.718 | ±9.07% | 2.98x slower |
| immer (no autofreeze) | 1,387,251 | 0.759 | ±3.37% | 3.31x slower |
| mutative | 1,291,205 | 0.869 | ±1.78% | 3.56x slower |
| immer | 1,051,657 | 1.004 | ±4.11% | 4.37x slower |

### Nested prop (depth 3)

Sets `profile.address.city`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,826,841 | 0.076 | ±2.25% | 4.85x faster |
| dot-prop-immutable | 2,981,138 | 0.406 | ±3.02% | 1.34x faster |
| **maraj** | 2,230,374 | 0.485 | ±0.93% | — |
| timm | 1,511,653 | 0.690 | ±1.52% | 1.48x slower |
| maraj 3.0.0 | 1,339,680 | 0.785 | ±0.85% | 1.66x slower |
| maraj 2.11.0 | 1,330,240 | 0.773 | ±0.29% | 1.68x slower |
| object-path-immutable | 1,079,885 | 1.008 | ±1.47% | 2.07x slower |
| immutability-helper | 781,946 | 1.415 | ±2.38% | 2.85x slower |
| immer (no autofreeze) | 746,214 | 1.500 | ±1.71% | 2.99x slower |
| lodash/fp | 738,175 | 1.395 | ±0.16% | 3.02x slower |
| immer | 535,505 | 2.173 | ±5.26% | 4.16x slower |
| mutative | 523,021 | 2.111 | ±1.73% | 4.26x slower |

### Deep prop (depth 11)

Sets `level1.level2…level10.value`, every level has a sibling object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| dot-prop-immutable | 1,320,415 | 0.792 | ±0.96% | 2.05x faster |
| spread by hand | 757,984 | 1.413 | ±1.21% | 1.18x faster |
| **maraj** | 644,099 | 1.603 | ±0.52% | — |
| timm | 452,909 | 2.303 | ±0.66% | 1.42x slower |
| object-path-immutable | 344,140 | 2.999 | ±0.44% | 1.87x slower |
| immutability-helper | 338,709 | 3.072 | ±0.62% | 1.90x slower |
| maraj 2.11.0 | 312,810 | 3.362 | ±1.54% | 2.06x slower |
| immer (no autofreeze) | 310,785 | 3.402 | ±1.10% | 2.07x slower |
| maraj 3.0.0 | 308,188 | 3.401 | ±1.79% | 2.09x slower |
| lodash/fp | 265,496 | 3.914 | ±0.58% | 2.43x slower |
| immer | 214,020 | 4.897 | ±1.83% | 3.01x slower |
| mutative | 186,663 | 5.613 | ±0.68% | 3.45x slower |

### Item in a 1,000-item array

Sets `items.500.done`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 4,845,628 | 0.342 | ±2.82% | 4.69x faster |
| dot-prop-immutable | 1,965,515 | 0.642 | ±1.28% | 1.90x faster |
| timm | 1,424,099 | 0.815 | ±1.70% | 1.38x faster |
| **maraj** | 1,033,302 | 1.119 | ±1.45% | — |
| object-path-immutable | 1,024,178 | 1.063 | ±0.76% | 1.01x slower |
| maraj 2.11.0 | 781,008 | 1.472 | ±3.40% | 1.32x slower |
| maraj 3.0.0 | 759,214 | 1.559 | ±2.76% | 1.36x slower |
| immer (no autofreeze) | 520,163 | 2.077 | ±0.85% | 1.99x slower |
| mutative | 435,423 | 2.442 | ±0.77% | 2.37x slower |
| lodash/fp | 346,616 | 3.149 | ±4.22% | 2.98x slower |
| immer | 22,931 | 48.601 | ±9.14% | 45.06x slower |
| immutability-helper | 8,863 | 115.426 | ±0.72% | 116.59x slower |

### 5 updates at once

Sets `name`, `profile.address.city`, `profile.address.zip`, `profile.tags.0` and `settings.theme`; one-path libraries chain 5 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 9,626,926 | 0.103 | ±1.38% | 11.49x faster |
| **maraj** | 837,765 | 1.260 | ±0.66% | — |
| dot-prop-immutable | 770,455 | 1.433 | ±1.64% | 1.09x slower |
| maraj 2.11.0 | 452,938 | 2.334 | ±0.63% | 1.85x slower |
| maraj 3.0.0 | 440,416 | 2.404 | ±1.02% | 1.90x slower |
| timm | 408,982 | 2.605 | ±1.39% | 2.05x slower |
| object-path-immutable | 279,135 | 3.779 | ±1.63% | 3.00x slower |
| immutability-helper | 258,446 | 4.029 | ±1.16% | 3.24x slower |
| immer (no autofreeze) | 249,686 | 4.302 | ±1.17% | 3.36x slower |
| mutative | 222,503 | 4.828 | ±2.30% | 3.77x slower |
| immer | 214,492 | 5.378 | ±11.87% | 3.91x slower |
| lodash/fp | 176,260 | 6.045 | ±1.17% | 4.75x slower |

### Function update

Uppercases `profile.address.city` with a function of the current value.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 9,639,345 | 0.107 | ±0.54% | 5.00x faster |
| dot-prop-immutable | 2,551,035 | 0.469 | ±3.15% | 1.32x faster |
| **maraj** | 1,929,741 | 0.551 | ±0.27% | — |
| timm | 1,284,685 | 0.814 | ±0.52% | 1.50x slower |
| maraj 3.0.0 | 1,225,264 | 0.908 | ±4.81% | 1.57x slower |
| maraj 2.11.0 | 1,161,867 | 0.921 | ±1.58% | 1.66x slower |
| object-path-immutable | 1,054,545 | 1.017 | ±1.11% | 1.83x slower |
| immutability-helper | 596,469 | 1.784 | ±0.99% | 3.24x slower |
| immer (no autofreeze) | 590,680 | 1.768 | ±0.40% | 3.27x slower |
| lodash/fp | 585,466 | 1.839 | ±0.84% | 3.30x slower |
| immer | 470,875 | 2.333 | ±7.28% | 4.10x slower |
| mutative | 410,761 | 2.593 | ±1.08% | 4.70x slower |

### Append to a 1,000-item array

Adds one item at the end of `items`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| timm | 1,648,401 | 0.745 | ±1.61% | 2.18x faster |
| object-path-immutable | 1,260,877 | 0.891 | ±0.97% | 1.67x faster |
| immutability-helper | 1,095,087 | 1.039 | ±1.57% | 1.45x faster |
| spread by hand | 855,436 | 1.358 | ±2.55% | 1.13x faster |
| dot-prop-immutable | 772,905 | 1.494 | ±3.30% | 1.02x faster |
| **maraj** | 757,075 | 1.486 | ±0.84% | — |
| maraj 3.0.0 | 750,494 | 1.531 | ±2.36% | 1.01x slower |
| maraj 2.11.0 | 651,246 | 1.845 | ±1.43% | 1.16x slower |
| mutative | 315,741 | 3.445 | ±1.20% | 2.40x slower |
| immer (no autofreeze) | 281,445 | 3.798 | ±0.75% | 2.69x slower |
| lodash/fp | 252,763 | 4.274 | ±0.81% | 3.00x slower |
| immer | 21,498 | 48.272 | ±0.73% | 35.22x slower |

### Wide object (1,000 keys)

Sets `key500.index` in an object with 1,000 top-level keys.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 839,934 | 1.305 | ±0.95% | 117.38x faster |
| object-path-immutable | 7,378 | 141.225 | ±0.86% | 1.03x faster |
| **maraj** | 7,156 | 147.474 | ±1.03% | — |
| immer (no autofreeze) | 7,032 | 149.726 | ±1.02% | 1.02x slower |
| dot-prop-immutable | 6,898 | 151.397 | ±0.91% | 1.04x slower |
| maraj 2.11.0 | 6,858 | 156.011 | ±1.29% | 1.04x slower |
| immutability-helper | 6,575 | 162.377 | ±1.20% | 1.09x slower |
| maraj 3.0.0 | 6,480 | 168.453 | ±1.51% | 1.10x slower |
| timm | 6,339 | 168.924 | ±1.28% | 1.13x slower |
| mutative | 5,763 | 190.758 | ±1.67% | 1.24x slower |
| immer | 5,538 | 189.603 | ±1.07% | 1.29x slower |
| lodash/fp | 2,755 | 375.109 | ±1.21% | 2.60x slower |

### 100 items in a 1,000-item array

Sets `done` on every 10th item in one call; one-path libraries chain 100 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 762,289 | 1.441 | ±0.83% | 45.28x faster |
| **maraj** | 16,835 | 61.464 | ±0.80% | — |
| timm | 16,045 | 67.219 | ±0.98% | 1.05x slower |
| maraj 3.0.0 | 12,408 | 84.122 | ±0.96% | 1.36x slower |
| dot-prop-immutable | 12,372 | 87.559 | ±1.08% | 1.36x slower |
| immer (no autofreeze) | 11,193 | 92.094 | ±0.84% | 1.50x slower |
| maraj 2.11.0 | 11,136 | 95.296 | ±1.00% | 1.51x slower |
| mutative | 10,230 | 102.746 | ±0.99% | 1.65x slower |
| object-path-immutable | 7,362 | 146.399 | ±1.36% | 2.29x slower |
| immer | 6,960 | 147.235 | ±0.84% | 2.42x slower |
| immutability-helper | 5,251 | 203.214 | ±1.26% | 3.21x slower |
| lodash/fp | 3,588 | 284.120 | ±0.84% | 4.69x slower |

### Create a missing path

Sets `address.location.city` on a user without `address`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,636,256 | 0.080 | ±5.08% | 4.81x faster |
| dot-prop-immutable | 3,115,128 | 0.334 | ±0.30% | 1.41x faster |
| **maraj** | 2,209,028 | 0.485 | ±0.75% | — |
| timm | 1,859,337 | 0.591 | ±2.80% | 1.19x slower |
| maraj 3.0.0 | 1,241,095 | 0.867 | ±0.32% | 1.78x slower |
| object-path-immutable | 1,165,153 | 0.910 | ±0.62% | 1.90x slower |
| maraj 2.11.0 | 1,144,693 | 0.969 | ±1.56% | 1.93x slower |
| lodash/fp | 1,045,730 | 1.121 | ±3.91% | 2.11x slower |
| immer (no autofreeze) | 919,181 | 1.204 | ±0.91% | 2.40x slower |
| mutative | 782,260 | 1.438 | ±1.02% | 2.82x slower |
| immer | 682,451 | 1.666 | ±6.63% | 3.24x slower |

### Reducer action

Toggles `todos.42.done` (100 todos) and renames `users.byId.u7` (50 users), like a Redux reducer.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 4,007,167 | 0.360 | ±3.17% | 12.75x faster |
| dot-prop-immutable | 413,591 | 2.937 | ±2.28% | 1.32x faster |
| **maraj** | 314,354 | 3.951 | ±2.04% | — |
| object-path-immutable | 234,531 | 4.939 | ±1.13% | 1.34x slower |
| maraj 2.11.0 | 228,422 | 5.215 | ±2.32% | 1.38x slower |
| maraj 3.0.0 | 214,355 | 5.379 | ±3.01% | 1.47x slower |
| timm | 183,900 | 6.438 | ±4.10% | 1.71x slower |
| immer (no autofreeze) | 162,418 | 6.934 | ±1.12% | 1.94x slower |
| mutative | 110,475 | 9.754 | ±0.67% | 2.85x slower |
| lodash/fp | 90,285 | 12.599 | ±1.57% | 3.48x slower |
| immer | 56,267 | 19.887 | ±1.19% | 5.59x slower |
| immutability-helper | 41,654 | 25.555 | ±1.18% | 7.55x slower |

### Options set to 'error'

Same as "5 updates at once" with `onNewProps` and `onNewIndexes` set to `'error'` (maraj only).

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| **maraj** | 464,457 | 2.539 | ±1.90% | — |
| maraj 3.0.0 | 243,074 | 4.853 | ±3.05% | 1.91x slower |
| maraj 2.11.0 | 235,998 | 4.698 | ±1.55% | 1.97x slower |
