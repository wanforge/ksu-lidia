// apps/ksulidia/src/components/ui/form/__tests__/CheckboxField.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CheckboxField } from '../CheckboxField';

describe('CheckboxField', () => {
  it('should render label and description', () => {
    render(
      <CheckboxField
        name="agree"
        label="Agree to terms"
        description="Must accept before proceeding"
      />
    );

    expect(screen.getByText('Agree to terms')).toBeInTheDocument();
    expect(screen.getByText('Must accept before proceeding')).toBeInTheDocument();
  });

  it('should toggle when clicking anywhere on the label container', () => {
    const handleChange = vi.fn();
    render(
      <CheckboxField
        name="agree"
        label="Agree to terms"
        onChange={handleChange}
      />
    );

    const labelContainer = screen.getByText('Agree to terms').closest('label');
    expect(labelContainer).not.toBeNull();

    fireEvent.click(labelContainer!);
    expect(handleChange).toHaveBeenCalled();
  });
});
