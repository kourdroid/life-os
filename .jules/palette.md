## 2024-05-18 - Destructive Action Protection
**Learning:** Due to the local-first nature of this app, deletions via `[data-remove]` are instant and immediate. The lack of a confirmation dialog means accidental clicks can permanently delete data without warning.
**Action:** Always wrap destructive actions triggered by event delegation (like `[data-remove]`) with `window.confirm` to protect user data from accidental loss.
