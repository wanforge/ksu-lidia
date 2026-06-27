// apps/ksulidia/src/components/ui/form/DateInput.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { PiCalendarDuotone } from 'react-icons/pi';

import { FormHint } from './FormHint'; // Assume FormHint is in the same directory

interface DateInputProps {
  name: string;
  label: string;
  defaultValue?: Date;
  required?: boolean;
  helperText?: string;
  tooltipContent?: string;
  onChange?: (date: Date | undefined) => void;
  className?: string; // To allow external styling
}

export const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  defaultValue = new Date(), // Default to today
  required,
  helperText,
  tooltipContent,
  onChange,
  className,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(defaultValue);

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date || undefined);
    }
  };

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-sm font-semibold text-gray-800">
        {label}
      </label>
      <div className="relative">
        <DatePicker
          id={name}
          name={name}
          selected={selectedDate}
          onChange={handleDateChange}
          dateFormat="MM/dd/yyyy" // Consistent format for react-datepicker
          required={required}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition focus:border-red-700 cursor-pointer"
          wrapperClassName="w-full"
        />
        <PiCalendarDuotone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
      {(helperText || tooltipContent) && (
        <FormHint helperText={helperText} tooltipContent={tooltipContent} />
      )}
    </div>
  );
};
