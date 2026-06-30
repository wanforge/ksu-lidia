import React from "react";
import { FormHint } from "./FormHint";

interface FormFieldProps {
  name: string;
  label?: string;
  required?: boolean;
  helperText?: string;
  tooltipContent?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  required,
  helperText,
  tooltipContent,
  error,
  className,
  children,
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="ml-0.5 text-red-700">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        (helperText || tooltipContent) && (
          <FormHint helperText={helperText} tooltipContent={tooltipContent} />
        )
      )}
    </div>
  );
};
