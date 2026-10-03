## 2024-05-24 - Intl Formatters Bottleneck
**Learning:** Instantiating Intl.DateTimeFormat or Intl.NumberFormat inside loops or frequent redrawing cycles is a severe performance bottleneck in this app architecture, which relies on innerHTML to completely redraw the main content on every interaction.
**Action:** Always cache formatter instances by locale/timezone. When caching, ensure cache keys include specific formatting options or a type prefix (e.g., "time-" vs "date-") to prevent cache key collisions.
