## 2024-05-28 - Cache Intl Formatters
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture.
**Action:** Always cache formatter instances by locale/timezone and include specific formatting options or a type prefix in the cache key to prevent collisions.
