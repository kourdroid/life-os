## 2024-05-24 - Destructive Actions Without Confirmation
**Learning:** Destructive actions in this application (such as deletions triggered via `[data-remove]` elements) instantly mutate local state and sync. This can lead to accidental data loss and is a poor user experience.
**Action:** Always wrap destructive actions in a confirmation step (e.g., `window.confirm`) to prevent accidental data loss.
