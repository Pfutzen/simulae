
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseMonthYear, formatToMonthYear } from "@/utils/dateUtils";
import { cn } from "@/lib/utils";

interface MonthYearInputProps {
  id?: string;
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const MonthYearInput: React.FC<MonthYearInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "MM/AAAA",
  className,
  required = false,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(true);

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

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
          {label}
        </Label>
      )}
      <Input
        id={id}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full",
          !isValid && "border-red-500 focus:ring-red-500"
        )}
      />
      {!isValid && (
        <p className="text-sm text-red-500">
          Digite uma data válida no formato MM/AAAA
        </p>
      )}
    </div>
  );
};

export default MonthYearInput;
