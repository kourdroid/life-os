## 2024-10-02 - Destructive Action Confirmation
**Learning:** Destructive actions in this app instantly mutate local state and trigger sync. It is crucial to wrap them in a confirmation step, as implemented today, to prevent accidental data loss.
**Action:** Always wrap delete operations triggered via `[data-remove]` or similar UI elements with a confirmation dialog (e.g., `window.confirm`) to ensure the user truly intends the destructive action.
