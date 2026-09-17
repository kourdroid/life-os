## 2026-09-17 - Destructive actions in vanilla JS app architecture

**Learning:** This app uses event delegation on the document body for actions like deletion (`[data-remove]`). Because it's a vanilla JS app without complex state management intercepting events, native browser dialogs like `window.confirm()` are an extremely efficient, low-overhead way to add safety guards to destructive actions without needing to manage complex modal states or z-indexes.

**Action:** Look for global event listeners (`document.addEventListener('click')`) as prime targets for intercepting potentially dangerous actions before they reach their handlers.
