
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { parseMonthYear, formatToMonthYear } from "@/utils/dateUtils";

interface MonthYearPickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  disablePastDates?: boolean;
  className?: string;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  placeholder = "MM/AAAA",
  disabled = false,
  disablePastDates = false, // Changed default to false
  className
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update input value when prop value changes
  useEffect(() => {
    if (value) {
      setInputValue(formatToMonthYear(value));
      setIsValid(true);
    } else {
      setInputValue("");
      setIsValid(true);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Remove non-numeric characters except slash
    newValue = newValue.replace(/[^\d/]/g, '');
    
    // Auto-insert slash after 2 digits
    if (newValue.length === 2 && !newValue.includes('/')) {
      newValue = newValue + '/';
    }
    
    // Limit to MM/AAAA format
    if (newValue.length > 7) {
      newValue = newValue.substring(0, 7);
    }
    
    setInputValue(newValue);
    
    // Validate and update parent component
    if (newValue.length === 7) {
      const parsedDate = parseMonthYear(newValue);
      if (parsedDate) {
        setIsValid(true);
        onChange(parsedDate);
      } else {
        setIsValid(false);
        onChange(undefined);
      }
    } else if (newValue.length === 0) {
      setIsValid(true);
      onChange(undefined);
    } else {
      setIsValid(true); // Don't show error while typing
    }
  };

  const handleBlur = () => {
    // Validate on blur if there's content
    if (inputValue.length > 0 && inputValue.length !== 7) {
      setIsValid(false);
    } else if (inputValue.length === 7) {
      const parsedDate = parseMonthYear(inputValue);
      setIsValid(!!parsedDate);
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Set to first day of the month
      const monthDate = new Date(date.getFullYear(), date.getMonth(), 1);
      onChange(monthDate);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("flex gap-1", className)}>
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1",
          !isValid && "border-red-500 focus:ring-red-500"
        )}
      />
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={disabled}
            className="shrink-0"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleCalendarSelect}
            disabled={disablePastDates ? (date) => date < today : undefined}
            defaultMonth={value || today}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MonthYearPicker;
