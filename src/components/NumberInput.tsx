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
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);

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

      // Handle case where all text was selected and user started typing
      let numericValue = parseInt(cleanValue) || 0;

      // Format with thousand separators but without decimals
      const formattedValue = numericValue.toLocaleString('pt-BR');
      let newCursorPos = 1;

      // If not selecting all text, calculate cursor position normally
      if (!isTextSelected) {
        // Calculate new cursor position (accounting for thousand separators)
        const newThousandSepCount = (formattedValue.match(/\./g) || []).length;
        const oldThousandSepCount = (newValue.match(/\./g) || []).length;
        const thousandSepDiff = newThousandSepCount - oldThousandSepCount;
        newCursorPos = selectionStart + thousandSepDiff;
      }

      setInternalValue(formattedValue);
      setCursorPosition(newCursorPos);
      setIsTextSelected(false);
      onChange(numericValue);
    } else {
      // Use improved formatting logic for decimal numbers
      const isAdding = newValue.length > internalValue.length;
      const newChar = isAdding ? newValue.charAt(selectionStart - 1) : null;
      const {
        formattedValue,
        cursorPosition: newCursorPosition,
        numericValue
      } = formatNumberWithCursor(newValue, selectionStart, newChar, isTextSelected);

      setInternalValue(formattedValue);
      setCursorPosition(newCursorPosition);
      setIsTextSelected(false);
      onChange(numericValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
    setIsTextSelected(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '.'];
    if (!allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleSelect = () => {
    setIsTextSelected(true);
  };

  const handleBlur = () => {
    setIsTextSelected(false);
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
        onFocus={handleFocus} 
        onKeyDown={handleKeyDown} 
        onSelect={handleSelect} 
        onBlur={handleBlur} 
        disabled={disabled} 
        suffix={suffix || undefined} 
        className={`text-left font-medium ${className}`} 
      />
    </div>
  );
};

export default NumberInput;
