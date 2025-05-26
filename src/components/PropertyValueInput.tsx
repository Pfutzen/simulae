
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertyValueInputProps {
  value: number;
  onChange: (value: number) => void;
}

const PropertyValueInput: React.FC<PropertyValueInputProps> = ({
  value,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());

  useEffect(() => {
    setInternalValue(value.toFixed(2));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const numericValue = parseFloat(newValue) || 0;
    onChange(numericValue);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="property-value" className="text-base font-medium">
        Valor Total do Imóvel (R$)
      </Label>
      <Input
        id="property-value"
        type="number"
        value={internalValue}
        onChange={handleChange}
        className="text-right"
        min={0}
      />
    </div>
  );
};

export default PropertyValueInput;
