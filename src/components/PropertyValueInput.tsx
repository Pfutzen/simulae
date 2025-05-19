
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
        Valor Total do Imóvel (R$)
      </Label>
      <div className="relative">
        <Input
          id="property-value"
          ref={inputRef}
          type="text"
          value={internalValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className="text-right pr-6"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
          R$
        </div>
      </div>
    </div>
  );
};

export default PropertyValueInput;
