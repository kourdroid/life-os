
## 2023-10-13 - Caching Intl formatters in frequent redraw architectures
**Learning:** In vanilla JS architectures that rely on frequent full-view redraws (like replacing innerHTML), repeatedly instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` causes significant synchronous blocking (over 10x slower than cached usage in a tight loop).
**Action:** Always inspect the formatting utilities in such codebases and ensure `Intl` instances are cached using a `Map` keyed by locale/timezone/options to prevent redundant overhead on every render cycle.
