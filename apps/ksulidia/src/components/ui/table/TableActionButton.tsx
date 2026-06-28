// apps/ksulidia/src/components/ui/table/TableActionButton.tsx
import React from "react";
import { IconType } from "react-icons";
import { Button, ButtonVariant, ButtonSize } from "@/components/ui/button";

interface TableActionButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconType;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const TableActionButton: React.FC<TableActionButtonProps> = ({
  icon: Icon,
  label,
  variant = "neutral",
  size = "sm",
  ...rest
}) => {
  return (
    <Button variant={variant} size={size} {...(rest as any)}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
};
