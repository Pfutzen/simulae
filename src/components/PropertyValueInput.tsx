
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber, formatNumberWithCursor } from "@/utils/formatUtils";
import { Home } from "lucide-react";

interface PropertyValueInputProps {
  value: number;
  onChange: (value: number) => void;
}

const PropertyValueInput: React.FC<PropertyValueInputProps> = ({
  value,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

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
    <div className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <Home className="h-5 w-5 text-blue-600" />
        <Label htmlFor="property-value" className="text-lg font-semibold text-blue-800">
          Valor Total do Imóvel
        </Label>
      </div>
      <p className="text-sm text-blue-600 mb-3">Valor base para toda a simulação</p>
      <Input
        id="property-value"
        ref={inputRef}
        type="text"
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="text-right font-bold text-xl h-12 bg-white border-blue-300 hover:border-blue-400 focus-visible:ring-blue-500 focus-visible:border-blue-500 shadow-sm"
        suffix="R$"
      />
    </div>
  );
};

export default PropertyValueInput;
