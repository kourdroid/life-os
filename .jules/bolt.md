## 2024-05-24 - Intl Formatter Instantiation Bottleneck
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture (which relies heavily on innerHTML redraws).
**Action:** Always cache formatter instances by locale, timezone, and formatting options to prevent redundant, expensive instantiations.
