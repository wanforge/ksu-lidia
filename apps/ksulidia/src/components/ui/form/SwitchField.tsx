// apps/ksulidia/src/components/ui/form/SwitchField.tsx
import React from "react";
import { FormHint } from "./FormHint";

interface SwitchFieldProps {
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

export const SwitchField: React.FC<SwitchFieldProps> = ({
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
          className="flex w-full cursor-pointer select-none items-center justify-between gap-3"
        >
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
          {/* Custom styled switch using tailwind peer classes */}
          <div className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              id={name}
              name={name}
              role="switch"
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={handleChange}
              className="peer sr-only"
            />
            <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-red-700 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-700/50 dark:border-gray-600 dark:bg-gray-700"></div>
          </div>
        </label>
      </div>
      {(helperText || tooltipContent) && (
        <FormHint helperText={helperText} tooltipContent={tooltipContent} />
      )}
    </div>
  );
};
