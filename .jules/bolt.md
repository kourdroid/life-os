## 2024-05-24 - Intl Formatter Bottlenecks
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture because it uses `innerHTML` to completely redraw the main content on every interaction.
**Action:** Always cache formatter instances by locale/timezone and options string to prevent unnecessary instantiations.
