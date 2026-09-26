## 2024-08-01 - Prevent accidental data loss
**Learning:** Destructive actions in local-first apps with instant-sync (like deletions triggered via `[data-remove]` elements) instantly mutate local state and sync. This can lead to accidental data loss.
**Action:** Always wrap destructive actions in a confirmation step (e.g., `window.confirm`) to prevent accidental data loss.
