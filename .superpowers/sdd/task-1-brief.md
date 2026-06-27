# Task 1 Brief: Create FormHint Component

**Files to Touch:**
- Create: `apps/ksulidia/src/components/ui/form/FormHint.tsx`
- Create/Test: `apps/ksulidia/src/components/ui/form/__tests__/FormHint.test.tsx`

**Requirements:**
- Implement a reusable component for displaying helper text and optional tooltips in forms.
- If `helperText` (string) is provided, render it in muted text (`text-xs text-gray-500`).
- If `tooltipContent` (string) is provided, render a `PiQuestionDuotone` icon inline. Hovering/clicking shows or references the tooltip content.
- Component signature:
  ```typescript
  interface FormHintProps {
    helperText?: string;
    tooltipContent?: string;
  }
  export const FormHint: React.FC<FormHintProps> = ...
  ```
- Write tests in TDD style: write a test verifying rendering of both props, verify it fails/passes.
- Commit changes.
