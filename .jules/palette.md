## 2024-05-24 - Confirm Destructive Actions
**Learning:** Destructive actions in this application (such as deletions triggered via `[data-remove]` elements) instantly mutate local state and sync. This lack of friction can easily lead to accidental data loss.
**Action:** Always wrap destructive actions in a confirmation step (e.g., `window.confirm`) to prevent accidental data loss and give users a chance to back out.
