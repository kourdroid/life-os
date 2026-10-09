## 2024-10-09 - Destructive Actions and Local State
**Learning:** Destructive actions triggered via [data-remove] elements instantly mutate local state and sync in this app.
**Action:** Always wrap them in a confirmation step (e.g., window.confirm) to prevent accidental data loss.
