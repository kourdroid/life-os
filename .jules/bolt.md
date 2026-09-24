## 2026-09-24 - Intl Formatters in innerHTML Architecture
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture because it completely redraws the main content using `innerHTML` on every interaction.
**Action:** Always cache formatter instances by locale/timezone and options when formatting dates and numbers in this codebase to prevent re-instantiation on every render.
