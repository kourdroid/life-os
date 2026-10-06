## 2026-10-06 - Intl Object Instantiation Overhead
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture (where `innerHTML` is used to completely redraw the main content on every interaction).
**Action:** Always cache formatter instances by locale/timezone and specific formatting options or a type prefix (e.g., 'time-' vs 'date-') to prevent cache key collisions.
