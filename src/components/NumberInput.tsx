
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
  noDecimals?: boolean; // New prop to control decimal display
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
  noDecimals = false // Default to showing decimals
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Format the value when it changes externally
    if (noDecimals) {
      setInternalValue(Math.round(value).toLocaleString('pt-BR'));
    } else {
      setInternalValue(formatToBrazilianNumber(value));
    }
  }, [value, noDecimals]);

  useEffect(() => {
    // Set cursor position after the component updates
    if (inputRef.current && cursorPosition !== null) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [internalValue, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    
    // For fields without decimals, use a simpler formatting approach
    if (noDecimals) {
      // Remove non-numeric characters
      const cleanValue = newValue.replace(/\D/g, '');
      
      // Parse as integer
      const numericValue = parseInt(cleanValue) || 0;
      
      // Format with thousand separators but without decimals
      const formattedValue = numericValue.toLocaleString('pt-BR');
      
      // Calculate new cursor position (accounting for thousand separators)
      const thousandSepCount = (formattedValue.match(/\./g) || []).length;
      const newCursorPos = Math.min(
        selectionStart + (formattedValue.length - newValue.length),
        formattedValue.length
      );
      
      setInternalValue(formattedValue);
      setCursorPosition(newCursorPos);
      onChange(numericValue);
    } else {
      // Use existing formatting logic for decimal numbers
      const isAdding = newValue.length > internalValue.length;
      const newChar = isAdding ? newValue.charAt(selectionStart - 1) : null;
      
      const { formattedValue, cursorPosition: newCursorPosition } = formatNumberWithCursor(
        newValue,
        selectionStart,
        newChar
      );
      
      setInternalValue(formattedValue);
      setCursorPosition(newCursorPosition);
      
      const numericValue = parseBrazilianNumber(formattedValue);
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, tab
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.'
    ];
    
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">
        {label}
      </Label>
      <Input 
        id={id} 
        ref={inputRef} 
        type="text" 
        value={internalValue} 
        onChange={handleChange} 
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        disabled={disabled} 
        suffix={suffix}
        className="text-right" 
      />
    </div>;
};

export default NumberInput;
