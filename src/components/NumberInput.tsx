
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";

interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  noDecimals?: boolean;
  className?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix = "",
  disabled = false,
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
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <Input 
        id={id} 
        ref={inputRef} 
        type="text" 
        value={internalValue} 
        onChange={handleChange} 
        onBlur={handleBlur}
        onFocus={handleFocus} 
        disabled={disabled} 
        suffix={suffix || undefined} 
        className={`text-right font-medium ${className}`} 
      />
    </div>
  );
};

export default NumberInput;
