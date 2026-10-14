
## 2024-10-14 - Cache Intl formatters
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture due to `innerHTML` re-renders.
**Action:** Always cache formatter instances by locale/timezone and prefix cache keys by format type (e.g. 'time-' vs 'date-') to prevent cache key collisions.
