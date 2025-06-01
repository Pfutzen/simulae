
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface PercentageInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  noDecimals?: boolean;
  className?: string;
  disabled?: boolean;
}

const PercentageInput: React.FC<PercentageInputProps> = ({
  id,
  value,
  onChange,
  noDecimals = false,
  className = "",
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    if (!document.activeElement || document.activeElement !== inputRef.current) {
      // Only format when not focused
      if (noDecimals) {
        setInternalValue(Math.round(value).toString());
      } else {
        // Always format to 1 decimal place maximum
        const roundedValue = Math.round(value * 10) / 10;
        const formatted = roundedValue.toLocaleString('pt-BR', {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        });
        setInternalValue(formatted);
      }
      setIsFormatted(true);
    }
  }, [value, noDecimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = e.target.value;
    
    if (noDecimals) {
      // For no decimals, only allow integers
      const cleanValue = newValue.replace(/\D/g, '');
      setInternalValue(cleanValue);
      setIsFormatted(false);
      
      const numericValue = parseInt(cleanValue) || 0;
      onChange(numericValue);
    } else {
      // Allow free typing - only numbers, dots and commas
      const cleanValue = newValue.replace(/[^0-9.,]/g, '');
      setInternalValue(cleanValue);
      setIsFormatted(false);
      
      // Convert to numeric value for callback
      let numericValue = 0;
      if (cleanValue) {
        // Replace comma with dot for parsing
        const normalizedValue = cleanValue.replace(',', '.');
        numericValue = parseFloat(normalizedValue) || 0;
        // Round to 1 decimal place
        numericValue = Math.round(numericValue * 10) / 10;
      }
      
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // On focus, show raw numeric value without formatting
    const displayValue = noDecimals ? value.toString() : (Math.round(value * 10) / 10).toString();
    setInternalValue(displayValue);
    setIsFormatted(false);
    
    // Select all text for easier editing
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  const handleBlur = () => {
    if (disabled) return;
    
    // Format properly on blur
    if (noDecimals) {
      setInternalValue(Math.round(value).toString());
    } else {
      // Always format to 1 decimal place
      const roundedValue = Math.round(value * 10) / 10;
      const formatted = roundedValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      });
      setInternalValue(formatted);
    }
    setIsFormatted(true);
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
      disabled={disabled}
      className={`text-right font-medium ${className}`}
      suffix="%"
    />
  );
};

export default PercentageInput;
