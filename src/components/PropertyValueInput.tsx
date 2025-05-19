
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

  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const numericValue = parseBrazilianNumber(newValue);
    onChange(numericValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
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
        onFocus={handleFocus}
        className="text-right"
        suffix="R$"
      />
    </div>
  );
};

export default PropertyValueInput;
