## 2024-05-18 - ARIA Pressed State for Toggle Buttons
**Learning:** Screen readers need explicit state management (`aria-pressed`) to understand which button in a control group (like graph metrics or timeframes) is currently active, as CSS classes alone do not convey this semantic state.
**Action:** Always pair visual active states (like `.ativo`) with semantic `aria-pressed="true"/"false"` attributes on toggle button groups.
