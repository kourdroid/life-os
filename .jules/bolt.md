## 2026-09-16 - [Intl.DateTimeFormat Optimization]
**Learning:** Instantiating new `Intl.DateTimeFormat` objects inside loops (like date formatting for heatmaps and activity logs) creates a significant performance bottleneck (e.g., 11x slowdown).
**Action:** Always cache `Intl.DateTimeFormat` instances using a `Map` keyed by timezone or locale when they are needed for repetitive date formatting tasks.
