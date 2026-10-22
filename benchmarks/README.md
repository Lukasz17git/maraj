# maraj benchmarks

Speed of `update` against its earlier versions ([versions/](versions/)) and against other immutable update libraries.
This folder isn't published: the root `package.json` only ships `dist`, `README.md` and `LICENSE`,
so none of these libraries are installed with maraj.

> This file is written by `npm run bench`. Numbers depend on the machine, compare them only within one run.

Median speed against maraj in 11 scenarios (higher is faster)

```text
dot-prop-immutable     ██████████████████████████████  1.26x
maraj                  ████████████████████████        1.00x
timm                   ██████████████████              0.77x
object-path-immutable  ██████████████                  0.58x
immer (no autofreeze)  ████████████                    0.49x
immutability-helper    ██████████                      0.41x
lodash/fp              █████████                       0.38x
mutative               ████████                        0.35x
immer                  ███████                         0.30x
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
  paths already copied skip the type checks, and an update with one path skips the tracker of copied paths.
- Gaps under ~10% change sign from one run to the next on the same machine, so read them as noise.

| Scenario | maraj ops/s | 3.0.0 ops/s | vs 3.0.0 | 2.11.0 ops/s | Fastest other library (ops/s) |
|---|---:|---:|---:|---:|---|
| Top-level prop | 4,433,347 | 4,226,104 | +4.9% | 4,384,429 | dot-prop-immutable (5,018,073) |
| Nested prop (depth 3) | 1,867,121 | 1,184,422 | +57.6% | 1,196,447 | dot-prop-immutable (3,116,279) |
| Deep prop (depth 11) | 620,103 | 296,020 | +109.5% | 312,216 | dot-prop-immutable (1,292,266) |
| Item in a 1,000-item array | 1,351,718 | 695,080 | +94.5% | 665,110 | dot-prop-immutable (1,706,554) |
| 5 updates at once | 449,917 | 232,216 | +93.7% | 211,535 | dot-prop-immutable (562,937) |
| Function update | 1,608,421 | 1,055,028 | +52.5% | 962,930 | dot-prop-immutable (1,736,332) |
| Append to a 1,000-item array | 579,208 | 644,178 | -10.1% | 578,484 | timm (1,443,188) |
| Wide object (1,000 keys) | 6,196 | 6,645 | -6.8% | 7,297 | immer (no autofreeze) (7,066) |
| 100 items in a 1,000-item array | 17,188 | 10,634 | +61.6% | 10,584 | timm (12,009) |
| Create a missing path | 1,648,113 | 967,465 | +70.4% | 1,038,437 | dot-prop-immutable (3,272,046) |
| Reducer action | 497,425 | 392,019 | +26.9% | 391,366 | dot-prop-immutable (772,941) |
| Options set to 'error' | 696,888 | 416,657 | +67.3% | 399,658 | — |

## All results

### Top-level prop

Sets `active` on a small user object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 11,131,946 | 0.072 | ±0.31% | 2.51x faster |
| dot-prop-immutable | 5,018,073 | 0.225 | ±0.69% | 1.13x faster |
| **maraj** | 4,433,347 | 0.246 | ±1.27% | — |
| maraj 2.11.0 | 4,384,429 | 0.250 | ±0.83% | 1.01x slower |
| maraj 3.0.0 | 4,226,104 | 0.266 | ±0.86% | 1.05x slower |
| timm | 2,982,004 | 0.373 | ±0.21% | 1.49x slower |
| object-path-immutable | 2,381,483 | 0.454 | ±1.36% | 1.86x slower |
| immutability-helper | 1,660,582 | 0.686 | ±4.56% | 2.67x slower |
| lodash/fp | 1,549,676 | 0.690 | ±1.66% | 2.86x slower |
| immer (no autofreeze) | 1,400,044 | 0.772 | ±4.38% | 3.17x slower |
| mutative | 1,225,620 | 0.906 | ±1.60% | 3.62x slower |
| immer | 1,088,263 | 0.974 | ±4.79% | 4.07x slower |

### Nested prop (depth 3)

Sets `profile.address.city`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,793,529 | 0.077 | ±1.23% | 5.78x faster |
| dot-prop-immutable | 3,116,279 | 0.374 | ±3.47% | 1.67x faster |
| **maraj** | 1,867,121 | 0.565 | ±0.59% | — |
| timm | 1,474,751 | 0.716 | ±2.28% | 1.27x slower |
| maraj 2.11.0 | 1,196,447 | 0.874 | ±2.67% | 1.56x slower |
| maraj 3.0.0 | 1,184,422 | 0.873 | ±0.28% | 1.58x slower |
| object-path-immutable | 1,145,099 | 0.945 | ±1.31% | 1.63x slower |
| immutability-helper | 831,064 | 1.297 | ±1.29% | 2.25x slower |
| immer (no autofreeze) | 773,003 | 1.401 | ±1.34% | 2.42x slower |
| lodash/fp | 734,382 | 1.454 | ±6.81% | 2.54x slower |
| immer | 558,210 | 2.075 | ±5.89% | 3.34x slower |
| mutative | 550,600 | 1.987 | ±1.27% | 3.39x slower |

### Deep prop (depth 11)

Sets `level1.level2…level10.value`, every level has a sibling object.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| dot-prop-immutable | 1,292,266 | 0.801 | ±0.31% | 2.08x faster |
| spread by hand | 745,319 | 1.425 | ±0.79% | 1.20x faster |
| **maraj** | 620,103 | 1.667 | ±0.54% | — |
| timm | 343,942 | 3.344 | ±1.45% | 1.80x slower |
| object-path-immutable | 330,325 | 3.160 | ±0.59% | 1.88x slower |
| immutability-helper | 328,484 | 3.242 | ±1.09% | 1.89x slower |
| maraj 2.11.0 | 312,216 | 3.339 | ±0.65% | 1.99x slower |
| immer (no autofreeze) | 301,672 | 3.508 | ±0.84% | 2.06x slower |
| maraj 3.0.0 | 296,020 | 3.574 | ±1.98% | 2.09x slower |
| lodash/fp | 266,714 | 3.999 | ±3.17% | 2.32x slower |
| immer | 207,078 | 5.150 | ±0.80% | 2.99x slower |
| mutative | 191,386 | 5.677 | ±1.46% | 3.24x slower |

### Item in a 1,000-item array

Sets `items.500.done`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 4,887,034 | 0.324 | ±1.42% | 3.62x faster |
| dot-prop-immutable | 1,706,554 | 0.781 | ±2.08% | 1.26x faster |
| **maraj** | 1,351,718 | 0.878 | ±1.07% | — |
| timm | 1,246,555 | 1.043 | ±1.92% | 1.08x slower |
| maraj 3.0.0 | 695,080 | 1.689 | ±1.33% | 1.94x slower |
| maraj 2.11.0 | 665,110 | 1.741 | ±1.22% | 2.03x slower |
| object-path-immutable | 627,542 | 2.148 | ±2.33% | 2.15x slower |
| immer (no autofreeze) | 496,137 | 2.294 | ±1.27% | 2.72x slower |
| lodash/fp | 320,106 | 3.555 | ±1.27% | 4.22x slower |
| mutative | 305,148 | 4.269 | ±2.37% | 4.43x slower |
| immer | 20,484 | 57.752 | ±13.20% | 65.99x slower |
| immutability-helper | 7,381 | 152.497 | ±1.62% | 183.13x slower |

### 5 updates at once

Sets `name`, `profile.address.city`, `profile.address.zip`, `profile.tags.0` and `settings.theme`; one-path libraries chain 5 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 6,666,862 | 0.207 | ±2.00% | 14.82x faster |
| dot-prop-immutable | 562,937 | 2.110 | ±1.58% | 1.25x faster |
| **maraj** | 449,917 | 2.728 | ±0.93% | — |
| timm | 366,464 | 3.122 | ±1.20% | 1.23x slower |
| object-path-immutable | 244,835 | 4.485 | ±0.75% | 1.84x slower |
| immutability-helper | 234,412 | 4.643 | ±0.55% | 1.92x slower |
| maraj 3.0.0 | 232,216 | 4.946 | ±0.78% | 1.94x slower |
| immer (no autofreeze) | 232,170 | 4.820 | ±1.50% | 1.94x slower |
| maraj 2.11.0 | 211,535 | 5.258 | ±2.07% | 2.13x slower |
| mutative | 201,776 | 5.426 | ±0.99% | 2.23x slower |
| immer | 170,912 | 6.659 | ±1.14% | 2.63x slower |
| lodash/fp | 165,094 | 6.666 | ±0.87% | 2.73x slower |

### Function update

Uppercases `profile.address.city` with a function of the current value.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 9,026,788 | 0.127 | ±1.36% | 5.61x faster |
| dot-prop-immutable | 1,736,332 | 0.711 | ±2.00% | 1.08x faster |
| **maraj** | 1,608,421 | 0.671 | ±0.18% | — |
| maraj 3.0.0 | 1,055,028 | 1.080 | ±3.60% | 1.52x slower |
| maraj 2.11.0 | 962,930 | 1.180 | ±1.32% | 1.67x slower |
| object-path-immutable | 925,105 | 1.199 | ±1.12% | 1.74x slower |
| timm | 863,872 | 1.375 | ±2.73% | 1.86x slower |
| immer (no autofreeze) | 539,571 | 2.081 | ±0.36% | 2.98x slower |
| immutability-helper | 525,565 | 2.361 | ±2.12% | 3.06x slower |
| lodash/fp | 414,797 | 2.971 | ±7.60% | 3.88x slower |
| immer | 383,989 | 3.700 | ±17.11% | 4.19x slower |
| mutative | 347,683 | 3.565 | ±2.63% | 4.63x slower |

### Append to a 1,000-item array

Adds one item at the end of `items`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| timm | 1,443,188 | 0.868 | ±1.34% | 2.49x faster |
| object-path-immutable | 1,061,294 | 1.134 | ±1.30% | 1.83x faster |
| immutability-helper | 835,523 | 1.571 | ±2.71% | 1.44x faster |
| dot-prop-immutable | 733,552 | 1.666 | ±3.50% | 1.27x faster |
| spread by hand | 672,365 | 1.990 | ±2.11% | 1.16x faster |
| maraj 3.0.0 | 644,178 | 2.065 | ±9.80% | 1.11x faster |
| **maraj** | 579,208 | 2.499 | ±3.17% | — |
| maraj 2.11.0 | 578,484 | 2.280 | ±2.77% | 1.00x slower |
| mutative | 252,122 | 4.594 | ±1.18% | 2.30x slower |
| lodash/fp | 229,368 | 4.946 | ±2.21% | 2.53x slower |
| immer (no autofreeze) | 190,817 | 6.210 | ±1.55% | 3.04x slower |
| immer | 14,477 | 77.825 | ±1.40% | 40.01x slower |

### Wide object (1,000 keys)

Sets `key500.index` in an object with 1,000 top-level keys.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 807,649 | 1.472 | ±1.30% | 130.36x faster |
| maraj 2.11.0 | 7,297 | 154.897 | ±1.74% | 1.18x faster |
| immer (no autofreeze) | 7,066 | 154.531 | ±1.54% | 1.14x faster |
| immutability-helper | 6,746 | 163.466 | ±1.53% | 1.09x faster |
| maraj 3.0.0 | 6,645 | 173.802 | ±1.97% | 1.07x faster |
| dot-prop-immutable | 6,452 | 171.780 | ±1.60% | 1.04x faster |
| **maraj** | 6,196 | 181.258 | ±1.81% | — |
| object-path-immutable | 5,980 | 190.859 | ±1.94% | 1.04x slower |
| immer | 5,745 | 190.808 | ±1.61% | 1.08x slower |
| mutative | 4,936 | 246.238 | ±2.39% | 1.26x slower |
| timm | 4,290 | 267.152 | ±2.18% | 1.44x slower |
| lodash/fp | 2,680 | 400.466 | ±1.88% | 2.31x slower |

### 100 items in a 1,000-item array

Sets `done` on every 10th item in one call; one-path libraries chain 100 calls.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 725,525 | 1.712 | ±2.30% | 42.21x faster |
| **maraj** | 17,188 | 63.926 | ±1.67% | — |
| timm | 12,009 | 99.275 | ±1.70% | 1.43x slower |
| maraj 3.0.0 | 10,634 | 103.041 | ±1.28% | 1.62x slower |
| maraj 2.11.0 | 10,584 | 105.091 | ±1.34% | 1.62x slower |
| dot-prop-immutable | 10,523 | 111.833 | ±1.77% | 1.63x slower |
| immer (no autofreeze) | 9,185 | 124.133 | ±1.61% | 1.87x slower |
| mutative | 7,741 | 137.484 | ±1.06% | 2.22x slower |
| immer | 5,959 | 189.043 | ±1.83% | 2.88x slower |
| object-path-immutable | 4,749 | 239.959 | ±1.99% | 3.62x slower |
| immutability-helper | 4,451 | 253.358 | ±1.70% | 3.86x slower |
| lodash/fp | 3,029 | 356.723 | ±1.74% | 5.68x slower |

### Create a missing path

Sets `address.location.city` on a user without `address`.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 10,616,629 | 0.079 | ±1.74% | 6.44x faster |
| dot-prop-immutable | 3,272,046 | 0.341 | ±0.18% | 1.99x faster |
| timm | 1,905,156 | 0.610 | ±0.86% | 1.16x faster |
| **maraj** | 1,648,113 | 0.668 | ±0.38% | — |
| object-path-immutable | 1,122,053 | 0.982 | ±1.78% | 1.47x slower |
| lodash/fp | 1,069,403 | 1.214 | ±10.80% | 1.54x slower |
| maraj 2.11.0 | 1,038,437 | 1.049 | ±0.51% | 1.59x slower |
| maraj 3.0.0 | 967,465 | 1.226 | ±6.10% | 1.70x slower |
| immer (no autofreeze) | 959,104 | 1.165 | ±0.77% | 1.72x slower |
| mutative | 732,279 | 1.628 | ±1.17% | 2.25x slower |
| immer | 685,028 | 1.794 | ±7.08% | 2.41x slower |

### Reducer action

Toggles `todos.42.done` (100 todos) and renames `users.byId.u7` (50 users), like a Redux reducer.

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| spread by hand | 7,241,997 | 0.185 | ±2.58% | 14.56x faster |
| dot-prop-immutable | 772,941 | 1.393 | ±1.48% | 1.55x faster |
| **maraj** | 497,425 | 2.161 | ±0.75% | — |
| maraj 3.0.0 | 392,019 | 2.679 | ±0.93% | 1.27x slower |
| maraj 2.11.0 | 391,366 | 2.697 | ±0.75% | 1.27x slower |
| timm | 383,543 | 2.789 | ±1.02% | 1.30x slower |
| object-path-immutable | 377,467 | 2.848 | ±1.06% | 1.32x slower |
| immer (no autofreeze) | 257,714 | 4.102 | ±0.87% | 1.93x slower |
| lodash/fp | 191,446 | 5.523 | ±1.88% | 2.60x slower |
| mutative | 171,938 | 6.000 | ±1.14% | 2.89x slower |
| immer | 96,638 | 11.399 | ±7.87% | 5.15x slower |
| immutability-helper | 67,606 | 15.415 | ±0.83% | 7.36x slower |

### Options set to 'error'

Same as "5 updates at once" with `onNewProps` and `onNewIndexes` set to `'error'` (maraj only).

| Library | ops/s | Mean (µs) | Margin | vs maraj |
|---|---:|---:|---:|---:|
| **maraj** | 696,888 | 1.518 | ±0.80% | — |
| maraj 3.0.0 | 416,657 | 2.523 | ±1.06% | 1.67x slower |
| maraj 2.11.0 | 399,658 | 2.626 | ±1.76% | 1.74x slower |
