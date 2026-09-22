## 2024-05-24 - Cached Intl Formatters to Prevent Render Blocking
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent `innerHTML` redrawing cycles (like the heatmap component rendering 364 date labels) is a severe performance bottleneck. Vanilla HTML/JS architectures using full re-renders exacerbate this issue.
**Action:** Always extract and cache formatter instances using a `Map` based on their locale, timezone, and options to ensure they are only created once per unique configuration, dramatically reducing CPU time during complete UI redraws.
