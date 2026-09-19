## 2024-09-19 - Confirmation for destructive actions
**Learning:** The application immediately processes record deletions when the user clicks the remove icon (the "X" buttons matching `[data-remove]`), which risks accidental data loss. This instant state mutation can be frustrating to users if clicked by mistake.
**Action:** Always wrap destructive actions with a confirmation step (e.g., `window.confirm`) to provide a safety net for users, especially for actions that instantly modify local state and sync.
