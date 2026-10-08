## 2024-05-24 - Protect destructive local state mutations
**Learning:** The Life OS application architecture uses instantaneous local state mutation with optional sync. This means destructive actions (like `[data-remove]`) take effect immediately and irreversibly.
**Action:** Always wrap destructive UI actions in a confirmation step (e.g., `window.confirm`) to prevent accidental data loss.
