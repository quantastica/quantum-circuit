To avoid node.js default 1.5 GB memory limit, run tests with `--max-old-space-size=MEMORY_MB`

Example:

```
node --max-old-space-size=4096 benchmark3.js
```
