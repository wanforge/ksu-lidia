// apps/ksulidia/src/components/ui/form/FormHint.tsx
import React from "react";
import { PiQuestionDuotone } from "react-icons/pi";
import { Tooltip } from "rizzui";

interface FormHintProps {
  helperText?: string;
  tooltipContent?: string; // Content for the tooltip
}

export const FormHint: React.FC<FormHintProps> = ({
  helperText,
  tooltipContent,
}) => {
  return (
    <div className="mt-1 text-xs text-gray-500">
      {helperText && <span>{helperText}</span>}
      {tooltipContent && (
        <span className="ml-1 inline-flex items-center">
          <Tooltip content={tooltipContent} placement="top" size="sm">
            <span className="inline-flex cursor-pointer items-center">
              <PiQuestionDuotone className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700" />
            </span>
          </Tooltip>
        </span>
      )}
    </div>
  );
};
