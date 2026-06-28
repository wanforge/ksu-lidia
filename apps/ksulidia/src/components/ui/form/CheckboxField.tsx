// apps/ksulidia/src/components/ui/form/CheckboxField.tsx
import React from "react";
import { FormHint } from "./FormHint";

interface CheckboxFieldProps {
  name: string;
  label: string;
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  helperText?: string;
  tooltipContent?: string;
  className?: string;
}

export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  description,
  checked,
  defaultChecked,
  onChange,
  helperText,
  tooltipContent,
  className = "",
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3 transition hover:bg-gray-50/50">
        <label
          htmlFor={name}
          className="flex w-full cursor-pointer select-none items-start gap-3"
        >
          <input
            type="checkbox"
            id={name}
            name={name}
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={handleChange}
            className="mt-0.5 h-4 w-4 cursor-pointer rounded border-gray-300 text-red-700 focus:ring-red-700"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
        </label>
      </div>
      {(helperText || tooltipContent) && (
        <FormHint helperText={helperText} tooltipContent={tooltipContent} />
      )}
    </div>
  );
};
