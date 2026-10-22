// @ts-nocheck
import { deepStrictEqual, notStrictEqual } from 'node:assert/strict'
import { readFileSync, writeFileSync } from 'node:fs'
import { cpus, platform, arch } from 'node:os'
import { Bench } from 'tinybench'
import { LIBRARIES, SCENARIOS } from './scenarios'

const TIME_MS = 500
const WARMUP_MS = 150
const PACKAGES = ['immer', 'mutative', 'immutability-helper', 'object-path-immutable', 'dot-prop-immutable', 'lodash', 'timm', 'tinybench']

/* results go here so the engine can't drop the calls as unused */
let sink

const version = (name) => JSON.parse(readFileSync(new URL(`./node_modules/${name}/package.json`, import.meta.url), 'utf8')).version
const formatOps = (ops) => Math.round(ops).toLocaleString('en-US')
const formatRatio = (ratio) => ratio >= 1 ? `${ratio.toFixed(2)}x faster` : `${(1 / ratio).toFixed(2)}x slower`

/* every library must return the same object as maraj and leave its base state as it was */
const checkScenario = (scenario) => {
   const expected = scenario.implementations['maraj'](scenario.createState())
   for (const [library, run] of Object.entries(scenario.implementations)) {
      const state = scenario.createState()
      const result = run(state)
      notStrictEqual(result, state, `${library} returned the same reference in "${scenario.name}"`)
      deepStrictEqual(result, expected, `${library} returned a different result in "${scenario.name}"`)
      deepStrictEqual(state, scenario.createState(), `${library} changed the base state in "${scenario.name}"`)
   }
}

const runScenario = async (scenario) => {
   const bench = new Bench({ time: TIME_MS, warmupTime: WARMUP_MS, throws: true })
   for (const [library, run] of Object.entries(scenario.implementations)) {
      /* one base state per library, so a frozen or touched state never leaks into another one */
      const state = scenario.createState()
      bench.add(library, () => { sink = run(state) })
   }
   await bench.run()
   return Object.fromEntries(bench.tasks.map((task) => {
      if (task.result.state !== 'completed') throw new Error(`"${task.name}" in "${scenario.name}" did not complete`)
      const { throughput, latency } = task.result
      return [task.name, { ops: throughput.mean, latencyMs: latency.mean, rme: latency.rme }]
   }))
}

const scenarioTable = (scenario, results) => {
   const marajOps = results['maraj'].ops
   const rows = Object.entries(results)
      .sort(([, a], [, b]) => b.ops - a.ops)
      .map(([library, { ops, latencyMs, rme }]) => {
         const name = library === 'maraj' ? '**maraj**' : library
         const vsMaraj = library === 'maraj' ? '—' : formatRatio(ops / marajOps)
         return `| ${name} | ${formatOps(ops)} | ${(latencyMs * 1000).toFixed(3)} | ±${rme.toFixed(2)}% | ${vsMaraj} |`
      })
   return [
      `### ${scenario.name}`,
      '',
      scenario.description,
      '',
      '| Library | ops/s | Mean (µs) | Margin | vs maraj |',
      '|---|---:|---:|---:|---:|',
      ...rows,
   ].join('\n')
}

const formatChange = (now, before) => `${now >= before ? '+' : ''}${((now / before - 1) * 100).toFixed(1)}%`

const summaryTable = (allResults) => {
   const rows = SCENARIOS.map((scenario, i) => {
      const results = allResults[i]
      const now = results['maraj'].ops
      const v3 = results['maraj 3.0.0'].ops
      const v2 = results['maraj 2.11.0'].ops
      const others = Object.entries(results).filter(([library]) => !library.startsWith('maraj') && library !== 'spread by hand')
      const fastest = others.sort(([, a], [, b]) => b.ops - a.ops)[0]
      const fastestCell = fastest ? `${fastest[0]} (${formatOps(fastest[1].ops)})` : '—'
      return `| ${scenario.name} | ${formatOps(now)} | ${formatOps(v3)} | ${formatChange(now, v3)} | ${formatOps(v2)} | ${fastestCell} |`
   })
   return [
      '| Scenario | maraj ops/s | 3.0.0 ops/s | vs 3.0.0 | 2.11.0 ops/s | Fastest other library (ops/s) |',
      '|---|---:|---:|---:|---:|---|',
      ...rows,
   ].join('\n')
}

const median = (values) => {
   const sorted = [...values].sort((a, b) => a - b)
   const middle = Math.floor(sorted.length / 2)
   return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

/* bar chart of each library's median speed against maraj, over the scenarios every library can run */
const SHORT_CHART_SKIPS = ['maraj 3.0.0', 'maraj 2.11.0', 'spread by hand']
const BAR_WIDTH = 30
const shortChart = (allResults) => {
   const shared = allResults.filter((results) => results['spread by hand'])
   const libraries = LIBRARIES.filter((library) => !SHORT_CHART_SKIPS.includes(library))
   const speeds = libraries
      .map((library) => {
         const ratios = shared.filter((results) => results[library]).map((results) => results[library].ops / results['maraj'].ops)
         return { library, speed: median(ratios) }
      })
      .sort((a, b) => b.speed - a.speed)
   const fastest = speeds[0].speed
   const nameWidth = Math.max(...libraries.map((library) => library.length))
   const lines = speeds.map(({ library, speed }) => {
      const bar = '█'.repeat(Math.max(1, Math.round(speed / fastest * BAR_WIDTH)))
      return `${library.padEnd(nameWidth)}  ${bar.padEnd(BAR_WIDTH)}  ${speed.toFixed(2)}x`
   })
   return [
      `Median speed against maraj in ${shared.length} scenarios (higher is faster)`,
      '',
      '```text',
      ...lines,
      '```',
   ].join('\n')
}

const BENCH_START = '<!-- bench:start -->'
const BENCH_END = '<!-- bench:end -->'
/* rewrites only the text between the markers of the root README */
const updateRootReadme = (allResults) => {
   const path = new URL('../README.md', import.meta.url)
   const content = readFileSync(path, 'utf8')
   const start = content.indexOf(BENCH_START)
   const end = content.indexOf(BENCH_END)
   if (start === -1 || end === -1) throw new Error(`README.md has no "${BENCH_START}" and "${BENCH_END}" markers`)
   const chart = `${BENCH_START}\n${shortChart(allResults)}\n${BENCH_END}`
   writeFileSync(path, content.slice(0, start) + chart + content.slice(end + BENCH_END.length))
}

const readme = (allResults) => `# maraj benchmarks

Speed of \`update\` against its earlier versions ([versions/](versions/)) and against other immutable update libraries.
This folder isn't published: the root \`package.json\` only ships \`dist\`, \`README.md\` and \`LICENSE\`,
so none of these libraries are installed with maraj.

> This file is written by \`npm run bench\`. Numbers depend on the machine, compare them only within one run.

${shortChart(allResults)}

## Run

\`\`\`sh
cd benchmarks
npm install
npm run bench
\`\`\`

## How it's measured

- [tinybench](https://github.com/tinylibs/tinybench) runs each library ${TIME_MS} ms per scenario, after ${WARMUP_MS} ms of warm-up.
- Each library gets its own base state, and paths, specs and values are built once, outside the timed code.
- Before timing, every library must return the same object as maraj (\`deepStrictEqual\`), a new reference, and leave its base state unchanged.
- One-path libraries (object-path-immutable, dot-prop-immutable, lodash/fp, timm) chain one call per path when a scenario updates several paths.
- "spread by hand" is the code you would write without a library; it's the upper limit, not a library.
- "immer" freezes its results (its default); "immer (no autofreeze)" doesn't, like the others.
- — means the library has no simple way to do it: immutability-helper can't create a missing path,
  and options like \`onNewProps\` only exist in maraj.
- Immutable.js is left out: it works on its own \`Map\`/\`List\` types, not on plain objects.

## Environment

- ${cpus()[0].model.trim()}, ${platform()} ${arch()}, Node ${process.versions.node}
- ${PACKAGES.map((name) => `${name} ${version(name)}`).join(', ')}

## maraj against 3.0.0 and 2.11.0

- 3.0.0 added two checks per path (\`'__proto__'\` and own props only), with no measurable cost against 2.11.0.
- After 3.0.0, each level of a path costs less: the dotted-key check slices the path instead of joining
  the keys again (\`'a.b.c'\` -> \`'b.c'\` -> \`'c'\`), keys are read by index instead of \`shift()\`,
  and paths already copied skip the type checks.
- Gaps under ~10% change sign from one run to the next on the same machine, so read them as noise.

${summaryTable(allResults)}

## All results

${SCENARIOS.map((scenario, i) => scenarioTable(scenario, allResults[i])).join('\n\n')}
`

SCENARIOS.forEach(checkScenario)
console.log(`All ${SCENARIOS.length} scenarios return the same result in every library`)

const allResults = []
for (const scenario of SCENARIOS) {
   console.log(`Running "${scenario.name}"...`)
   allResults.push(await runScenario(scenario))
}

writeFileSync(new URL('./README.md', import.meta.url), readme(allResults))
updateRootReadme(allResults)
console.log(summaryTable(allResults))
console.log(`\nLibraries: ${LIBRARIES.join(', ')}`)
