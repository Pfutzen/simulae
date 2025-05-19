import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";

interface PropertyValueInputProps {
  value: number;
  onChange: (value: number) => void;
}

const PropertyValueInput: React.FC<PropertyValueInputProps> = ({
  value,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal display value when prop value changes
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Remove all formatting except digits, comma and period
    const cleanedValue = newValue.replace(/[^\d.,]/g, '');
    
    // Keep raw input, but ensure it has proper format
    setInternalValue(cleanedValue);
    
    // Only parse and update parent component if the value is meaningful
    if (cleanedValue) {
      // Convert Brazilian format to standard number
      const numericValue = parseBrazilianNumber(cleanedValue);
      onChange(numericValue);
    } else {
      onChange(0);
    }
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
        onBlur={handleBlur}
        onFocus={handleFocus}
        className="text-right font-bold bg-purple-50 border-purple-200 hover:border-purple-300 focus-visible:ring-purple-400 text-xl"
        suffix="R$"
      />
    </div>
  );
};

export default PropertyValueInput;
