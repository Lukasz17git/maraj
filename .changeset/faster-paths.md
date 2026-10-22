---
'maraj': patch
---

update() is faster on nested paths (1.4x to 2x at depth 3 and more, same results): each level slices the path instead of joining its keys again
