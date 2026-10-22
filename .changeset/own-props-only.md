---
'maraj': major
---

update() reads only own props: 'toString.value' and 'constructor.prototype.x' create those props (were read from Object.prototype, and 'constructor.prototype' paths could change it for the whole app)
