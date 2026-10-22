import { defineConfig } from 'tsdown'

export default defineConfig({
   entry: 'src/index.ts',
   format: ['cjs', 'esm'],
   minify: true,
   dts: true,
   /* index.js and index.d.ts, the names main and types use in package.json (default: .cjs and .d.cts) */
   fixedExtension: false,
})
