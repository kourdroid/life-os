## 2026-10-07 - Playwright Dialog Handling Scope
**Learning:** When writing Playwright UI verification scripts in Python, using `nonlocal` primitives inside asynchronous callbacks (like dialog handlers) can cause scope binding syntax errors.
**Action:** Use mutable objects like dictionaries (e.g., `state = {'handled': False}`) to track state across asynchronous callbacks in Playwright scripts.
