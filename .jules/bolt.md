## 2024-05-18 - Caching Intl formatters in innerHTML redrawing architecture
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture because it completely redraws the main content using `innerHTML` on every interaction.
**Action:** Always cache formatter instances by locale/timezone and ensure cache keys include specific formatting options or a type prefix (e.g., 'time-' vs 'date-') to prevent cache key collisions.
