## 2024-05-15 - [Intl Formatters caching bottleneck]
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture. Always cache formatter instances by locale/timezone.
**Action:** When caching `Intl` formatters, ensure cache keys include specific formatting options or a type prefix (e.g., 'time-' vs 'date-') to prevent cache key collisions between different formats sharing the same timezone or locale.
