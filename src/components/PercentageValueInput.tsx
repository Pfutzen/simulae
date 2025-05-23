import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CurrencyInput from "./CurrencyInput";
import PercentageInput from "./PercentageInput";

interface PercentageValueInputProps {
  label: string;
  valueLabel?: string;
  value: number;
  percentage: number;
  totalValue: number;
  onValueChange: (value: number) => void;
  onPercentageChange: (percentage: number) => void;
  noDecimalsForPercentage?: boolean;
  valueInputClassName?: string;
  percentageInputClassName?: string;
}

const PercentageValueInput: React.FC<PercentageValueInputProps> = ({
  label,
  valueLabel = "Valor (R$)",
  value,
  percentage,
  totalValue,
  onValueChange,
  onPercentageChange,
  noDecimalsForPercentage = false,
  valueInputClassName = "",
  percentageInputClassName = ""
}) => {
  const handleValueChange = (newValue: number) => {
    onValueChange(newValue);
    const newPercentage = (newValue / totalValue) * 100;
    onPercentageChange(newPercentage);
  };

  const handlePercentageChange = (newPercentage: number) => {
    onPercentageChange(newPercentage);
    const newValue = (newPercentage / 100) * totalValue;
    onValueChange(newValue);
  };
  
  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${label}-value`} className="text-sm text-slate-500 block mb-1">
            {valueLabel}
          </Label>
          <CurrencyInput
            id={`${label}-value`}
            value={value}
            onChange={handleValueChange}
            className={`${valueInputClassName}`}
          />
        </div>
        
        <div>
          <Label htmlFor={`${label}-percentage`} className="text-sm text-slate-500 block mb-1">
            Percentual (%)
          </Label>
          <PercentageInput
            id={`${label}-percentage`}
            value={percentage}
            onChange={handlePercentageChange}
            noDecimals={noDecimalsForPercentage}
            className={`${percentageInputClassName}`}
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
