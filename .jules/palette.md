## 2024-05-20 - Destructive Action Confirmation
**Learning:** Destructive actions triggered by `[data-remove]` instantly mutate local state and sync. Users lose data accidentally.
**Action:** Wrap them in a `window.confirm` step to prevent accidental data loss.
