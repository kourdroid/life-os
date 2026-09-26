## 2024-05-24 - Intl instances cache
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture because it completely redraws the main content on every interaction using `innerHTML`.
**Action:** Always cache formatter instances by locale/timezone to significantly reduce synchronous overhead during rendering.
