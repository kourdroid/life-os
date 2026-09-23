## 2024-05-18 - Caching Intl Formatters in innerHTML renders
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles (like complete `innerHTML` redraws) is a severe performance bottleneck.
**Action:** Always cache formatter instances by locale/timezone and reuse them when formatting dates or numbers, instead of creating new instances every time.
