
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  className = "",
  placeholder = ""
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Allow free typing - just clean non-numeric characters except comma and dot
    const cleanValue = newValue.replace(/[^\d.,]/g, '');
    
    setInternalValue(cleanValue);
    
    // Convert to numeric value for callback
    const numericValue = parseBrazilianNumber(cleanValue);
    onChange(numericValue);
  };

  const handleBlur = () => {
    // Format properly on blur
    const numericValue = parseBrazilianNumber(internalValue);
    setInternalValue(formatToBrazilianNumber(numericValue));
    onChange(numericValue);
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
      suffix="R$"
      placeholder={placeholder}
    />
  );
};

export default CurrencyInput;
