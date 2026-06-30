import React from "react";
import cn from "@core/utils/class-names";
import { textareaFieldClass } from "./field-styles";

export type TextareaInputProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const TextareaInput = React.forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea ref={ref} rows={rows} className={cn(textareaFieldClass, className)} {...props} />
  )
);
TextareaInput.displayName = "TextareaInput";
