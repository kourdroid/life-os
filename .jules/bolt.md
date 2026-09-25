## 2024-05-18 - Caching Intl Formatter Instances
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture.
**Action:** Always cache formatter instances by locale/timezone.
