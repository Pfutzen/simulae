
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";

interface PropertyValueInputProps {
  value: number;
  onChange: (value: number) => void;
}

const PropertyValueInput: React.FC<PropertyValueInputProps> = ({
  value,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isTextSelected, setIsTextSelected] = useState(false);

  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  useEffect(() => {
    // Set cursor position after the component updates
    if (inputRef.current && cursorPosition !== null) {
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [internalValue, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const selectionStart = e.target.selectionStart || 0;
    
    // Determine if we're adding or removing characters
    const isAdding = newValue.length > internalValue.length;
    const newChar = isAdding ? newValue.charAt(selectionStart - 1) : null;
    
    // Format the number with appropriate cursor position
    const { formattedValue, cursorPosition: newCursorPosition } = formatNumberWithCursor(
      newValue,
      selectionStart,
      newChar,
      isTextSelected
    );
    
    setInternalValue(formattedValue);
    setCursorPosition(newCursorPosition);
    setIsTextSelected(false);
    
    const numericValue = parseBrazilianNumber(formattedValue);
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
    setIsTextSelected(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow only numbers, backspace, delete, arrow keys, tab
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End',
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
    ];
    
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
      <Label htmlFor="property-value" className="text-base font-medium">
        Valor Total do Imóvel
      </Label>
      <Input
        id="property-value"
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onSelect={handleSelect}
        onBlur={handleBlur}
        className="text-right font-bold bg-purple-50 border-purple-200 hover:border-purple-300 focus-visible:ring-purple-400 text-xl"
        suffix="R$"
      />
    </div>
  );
};

export default PropertyValueInput;
