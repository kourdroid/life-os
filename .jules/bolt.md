
## 2024-05-15 - Intl.DateTimeFormat Instantiation Bottleneck
**Learning:** `Intl.DateTimeFormat` instantiation is notoriously expensive. Calling it on every single loop iteration (like rendering the 365-day heatmap using `dateKey` or `timeKey` which called `zonedParts`) drastically slowed down rendering logic.
**Action:** Always cache instances of `Intl.DateTimeFormat` globally (or at the module level) using a simple dictionary keyed by locale/timezone to significantly reduce overhead for date formatting utilities.
