## 2024-10-08 - Caching Intl Formatters in innerHTML Architecture
**Learning:** Instantiating `Intl.DateTimeFormat` or `Intl.NumberFormat` inside loops or frequent UI redrawing cycles (like completely redrawing main content with `innerHTML` on every interaction) is a severe performance bottleneck.
**Action:** Always cache these formatter instances by format options or timezone/locale to prevent instantiation overhead on every render, taking care to include type prefixes in cache keys to avoid collisions.
