import { execSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'

// Stops a publish when the version wasn't bumped by `changeset version`,
// which always adds a '## <version>' heading to CHANGELOG.md (a version changed by hand has none)
const { name, version } = JSON.parse(readFileSync('package.json', 'utf8'))

// A version already on npm is skipped by `changeset publish`, so it needs no check (e.g. a first '0.0.0')
const isPublished = () => {
   try {
      const command = `npm view ${name}@${version} version`
      return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() === version
   } catch {
      return false
   }
}

const changelog = existsSync('CHANGELOG.md') ? readFileSync('CHANGELOG.md', 'utf8') : ''
const hasEntry = changelog.split(/\r?\n/).includes(`## ${version}`)

if (!hasEntry && !isPublished()) {
   console.error(`CHANGELOG.md has no '## ${version}' heading: bump the version with changesets, not by hand`)
   process.exit(1)
}
