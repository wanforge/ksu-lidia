// apps/ksulidia/src/components/ui/form/SwitchField.tsx
import React from 'react';
import { FormHint } from './FormHint';

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
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.checked);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50/50 transition cursor-pointer">
        <label
          htmlFor={name}
          className="flex w-full cursor-pointer items-center justify-between gap-3 select-none"
        >
          <div className="flex flex-col flex-1">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {description && (
              <span className="text-xs text-gray-500">{description}</span>
            )}
          </div>
          {/* Custom styled switch using tailwind peer classes */}
          <div className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id={name}
              name={name}
              role="switch"
              checked={checked}
              defaultChecked={defaultChecked}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-700/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-red-700"></div>
          </div>
        </label>
      </div>
      {(helperText || tooltipContent) && (
        <FormHint helperText={helperText} tooltipContent={tooltipContent} />
      )}
    </div>
  );
};
