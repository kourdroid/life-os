## 2023-10-27 - [Add confirmation dialog for delete action]
**Learning:** Destructive actions like deletions in this app instantly mutate local state and sync. It's a common micro-UX improvement to wrap them in a confirmation step to prevent data loss.
**Action:** Use `window.confirm` to wrap destructive actions before performing them.
