## 2024-05-24 - Initial setup
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture. Always cache formatter instances by locale/timezone. When caching `Intl` formatters, ensure cache keys include specific formatting options or a type prefix (e.g., 'time-' vs 'date-') to prevent cache key collisions between different formats sharing the same timezone or locale.
**Action:** Created the journal.
