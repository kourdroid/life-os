## 2026-10-05 - Instant local state mutation
**Learning:** Destructive actions in this application instantly mutate local state and sync.
**Action:** Always wrap destructive actions (like deletions) in a confirmation step (e.g., `window.confirm`) to prevent accidental data loss.
