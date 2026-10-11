
## 2024-03-20 - Intl Formatter Overhead
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's innerHTML-driven architecture.
**Action:** Always cache formatter instances by locale/timezone and format options (using a prefix to prevent key collisions) instead of recreating them on every call.
