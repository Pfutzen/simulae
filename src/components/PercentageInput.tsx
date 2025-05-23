
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";

interface PercentageInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  noDecimals?: boolean;
  className?: string;
}

const PercentageInput: React.FC<PercentageInputProps> = ({
  id,
  value,
  onChange,
  noDecimals = false,
  className = ""
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    if (noDecimals) {
      setInternalValue(Math.round(value).toString());
    } else {
      setInternalValue(formatToBrazilianNumber(value));
    }
  }, [value, noDecimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (noDecimals) {
      // For no decimals, only allow integers
      const cleanValue = newValue.replace(/\D/g, '');
      setInternalValue(cleanValue);
      
      const numericValue = parseInt(cleanValue) || 0;
      onChange(numericValue);
    } else {
      // Allow free typing - just clean non-numeric characters except comma and dot
      const cleanValue = newValue.replace(/[^\d.,]/g, '');
      setInternalValue(cleanValue);
      
      // Convert to numeric value for callback
      const numericValue = parseBrazilianNumber(cleanValue);
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Format properly on blur
    if (noDecimals) {
      const numericValue = parseInt(internalValue) || 0;
      setInternalValue(numericValue.toString());
      onChange(numericValue);
    } else {
      const numericValue = parseBrazilianNumber(internalValue);
      setInternalValue(formatToBrazilianNumber(numericValue));
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // On focus, select all text for easier editing
    e.target.select();
  };

  return (
    <Input
      id={id}
      ref={inputRef}
      type="text"
      value={internalValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={`text-right font-medium ${className}`}
      suffix="%"
    />
  );
};

export default PercentageInput;
