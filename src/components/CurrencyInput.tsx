
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  value,
  onChange,
  className = "",
  placeholder = "0",
  disabled = false
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [isFormatted, setIsFormatted] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    if (!document.activeElement || document.activeElement !== inputRef.current) {
      // Only format when not focused
      const formatted = value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setInternalValue(formatted);
      setIsFormatted(true);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const newValue = e.target.value;
    
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
    }
    
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    // On focus, show raw numeric value without formatting
    setInternalValue(value.toString());
    setIsFormatted(false);
    
    // Select all text for easier editing
    setTimeout(() => {
      e.target.select();
    }, 0);
  };

  const handleBlur = () => {
    if (disabled) return;
    
    // Format properly on blur
    const formatted = value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setInternalValue(formatted);
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
      suffix="R$"
      placeholder={placeholder}
    />
  );
};

export default CurrencyInput;
