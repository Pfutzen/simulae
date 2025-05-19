
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatToBrazilianNumber, parseBrazilianNumber } from "@/utils/formatUtils";

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
  const [internalValue, setInternalValue] = useState<string>("");
  const [internalPercentage, setInternalPercentage] = useState<string>("");
  const valueInputRef = useRef<HTMLInputElement>(null);
  const percentageInputRef = useRef<HTMLInputElement>(null);

  // Update internal state when props change
  useEffect(() => {
    setInternalValue(formatToBrazilianNumber(value));
  }, [value]);

  useEffect(() => {
    setInternalPercentage(formatToBrazilianNumber(percentage));
  }, [percentage]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    
    const numericValue = parseBrazilianNumber(newValue);
    onValueChange(numericValue);
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercentage = e.target.value;
    setInternalPercentage(newPercentage);
    
    const numericPercentage = parseBrazilianNumber(newPercentage);
    onPercentageChange(numericPercentage);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for better UX
    e.target.select();
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
            ref={valueInputRef}
            type="text"
            value={internalValue}
            onChange={handleValueChange}
            onFocus={handleFocus}
            className="text-right"
            disabled={disabled}
            suffix="R$"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${label}-percentage`} className="text-sm text-muted-foreground">
            {percentageLabel}
          </Label>
          <Input
            id={`${label}-percentage`}
            ref={percentageInputRef}
            type="text"
            value={internalPercentage}
            onChange={handlePercentageChange}
            onFocus={handleFocus}
            className="text-right"
            disabled={disabled}
            suffix="%"
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
