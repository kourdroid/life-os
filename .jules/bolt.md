## 2024-05-24 - Intl Formatters Performance
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent redrawing cycles is a severe performance bottleneck in this app's architecture. The app uses `innerHTML` to redraw the main content on every interaction, causing these to be instantiated many times.
**Action:** Always cache formatter instances by locale/timezone and currency to avoid expensive instantiations on every redraw.
