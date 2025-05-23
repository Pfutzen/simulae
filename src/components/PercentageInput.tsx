
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";

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
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    if (noDecimals) {
      setInternalValue(Math.round(value).toString());
    } else {
      setInternalValue(formatToBrazilianNumber(value));
    }
  }, [value, noDecimals]);

  // Update cursor position after value change
  useEffect(() => {
    if (inputRef.current && document.activeElement === inputRef.current) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [internalValue, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentPosition = e.target.selectionStart || 0;
    const wasSelection = e.target.selectionStart !== e.target.selectionEnd;
    
    if (noDecimals) {
      // For fields without decimals, use simpler logic
      const cleanValue = newValue.replace(/\D/g, '');
      const numericValue = parseInt(cleanValue) || 0;
      const formattedValue = numericValue.toString();
      
      setInternalValue(formattedValue);
      setCursorPosition(currentPosition);
      onChange(numericValue);
    } else {
      // Get the newly typed character (if applicable)
      const newChar = newValue.length > internalValue.length ? 
        newValue.charAt(currentPosition - 1) : null;
      
      // Use our formatter that preserves cursor position
      const result = formatNumberWithCursor(
        newValue, 
        currentPosition,
        newChar,
        wasSelection
      );
      
      setInternalValue(result.formattedValue);
      setCursorPosition(result.cursorPosition);
      onChange(result.numericValue);
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
