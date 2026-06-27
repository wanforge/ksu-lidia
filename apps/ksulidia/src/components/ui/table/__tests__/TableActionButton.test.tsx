// apps/ksulidia/src/components/ui/table/__tests__/TableActionButton.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableActionButton } from '../TableActionButton';
import { PiPlusDuotone } from 'react-icons/pi';

describe('TableActionButton', () => {
  it('should render the label and the icon', () => {
    render(<TableActionButton icon={PiPlusDuotone} label="Add New" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('Add New')).toBeInTheDocument();
    // Verify icon renders (svg element)
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('should pass other button props like disabled', () => {
    render(<TableActionButton icon={PiPlusDuotone} label="Add New" disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
