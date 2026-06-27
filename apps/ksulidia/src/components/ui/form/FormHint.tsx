// apps/ksulidia/src/components/ui/form/FormHint.tsx
import React from 'react';
import { PiQuestionDuotone } from 'react-icons/pi';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Placeholder if ShadCN tooltip exists

interface FormHintProps {
  helperText?: string;
  tooltipContent?: string; // Content for the tooltip
}

export const FormHint: React.FC<FormHintProps> = ({ helperText, tooltipContent }) => {
  return (
    <div className="mt-1 text-xs text-gray-500">
      {helperText && <span>{helperText}</span>}
      {tooltipContent && (
        <span className="ml-1 inline-flex items-center">
          {/* If a Tooltip component (e.g., ShadCN) is available: */}
          {/*
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <PiQuestionDuotone className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltipContent}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          */}
          {/* For now, just the icon with a placeholder comment */}
          <PiQuestionDuotone className="h-3.5 w-3.5 text-gray-400 hover:text-gray-700 cursor-pointer" />
          {/* Tooltip: {tooltipContent} (future implementation) */}
        </span>
      )}
    </div>
  );
};
