---
'maraj': patch
---

'skip' in onNewProps, onNewIndexes and onPathsIntersectedByPrimitiveValues skips only that path, at any depth (looped forever when the new prop, index or primitive was in the middle of the path)
