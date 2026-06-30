import React from "react";
import cn from "@core/utils/class-names";
import { fieldClass } from "./field-styles";

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type = "text", ...props }, ref) => (
    <input ref={ref} type={type} className={cn(fieldClass, className)} {...props} />
  )
);
TextInput.displayName = "TextInput";
