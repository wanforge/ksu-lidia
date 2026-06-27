// apps/ksulidia/src/components/ui/table/TableActionButton.tsx
import React from 'react';
import { IconType } from 'react-icons';
import { Button, ButtonProps } from '@/components/ui/button';

interface TableActionButtonProps extends Omit<ButtonProps, 'as' | 'children'> {
  icon: IconType;
  label: string;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({
  icon: Icon,
  label,
  variant = 'neutral',
  size = 'sm',
  ...rest
}) => {
  return (
    <Button variant={variant} size={size} {...rest}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};
