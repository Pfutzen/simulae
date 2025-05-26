
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PercentageValueInputProps {
  label: string;
  valueLabel?: string;
  percentageLabel?: string;
  value: number;
  percentage: number;
  totalValue: number;
  onValueChange: (value: number) => void;
  onPercentageChange: (percentage: number) => void;
  disabled?: boolean;
}

const PercentageValueInput: React.FC<PercentageValueInputProps> = ({
  label,
  valueLabel = "Valor (R$)",
  percentageLabel = "Percentual (%)",
  value,
  percentage,
  totalValue,
  onValueChange,
  onPercentageChange,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState<string>(value.toString());
  const [internalPercentage, setInternalPercentage] = useState<string>(percentage.toFixed(2));

  // Update internal state when props change
  useEffect(() => {
    setInternalValue(value.toFixed(2));
  }, [value]);

  useEffect(() => {
    setInternalPercentage(percentage.toFixed(2));
  }, [percentage]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const numericValue = parseFloat(newValue) || 0;
    onValueChange(numericValue);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = e.target.value;
    setInternalPercentage(newPercentage);
    
    const numericPercentage = parseFloat(newPercentage) || 0;
    onPercentageChange(numericPercentage);
  };

  return (
    <div className="space-y-2">
      <Label className="text-base font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor={`${label}-value`} className="text-sm text-muted-foreground">
            {valueLabel}
          </Label>
          <Input
            id={`${label}-value`}
            type="number"
            value={internalValue}
            onChange={handleValueChange}
            className="text-right"
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${label}-percentage`} className="text-sm text-muted-foreground">
            {percentageLabel}
          </Label>
          <Input
            id={`${label}-percentage`}
            type="number"
            value={internalPercentage}
            onChange={handlePercentageChange}
            className="text-right"
            min={0}
            max={100}
            step={0.01}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
