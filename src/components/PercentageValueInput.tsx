
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
  installmentsCount?: number; // Add optional prop for installments count
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
  percentageInputClassName = "",
  installmentsCount = 1 // Default to 1 if not provided
}) => {
  const handleValueChange = (newValue: number) => {
    onValueChange(newValue);
    
    // Calculate percentage based on the new value
    let newPercentage = 0;
    if (totalValue > 0) {
      if (label === "Parcelas" && installmentsCount > 0) {
        // For installments, calculate percentage based on total installment value
        const totalInstallmentValue = newValue * installmentsCount;
        newPercentage = (totalInstallmentValue / totalValue) * 100;
      } else if (label === "Reforços" && installmentsCount > 0) {
        // For reinforcements, calculate percentage based on total reinforcement value
        const totalReinforcementValue = newValue * installmentsCount;
        newPercentage = (totalReinforcementValue / totalValue) * 100;
      } else {
        // For other cases (entrada, chaves)
        newPercentage = (newValue / totalValue) * 100;
      }
    }
    
    onPercentageChange(newPercentage);
  };

  const handlePercentageChange = (newPercentage: number) => {
    onPercentageChange(newPercentage);
    
    // Calculate value based on the new percentage
    let newValue = 0;
    if (label === "Parcelas" && installmentsCount > 0) {
      // For installments: value = (percentage * totalValue / 100) / installmentsCount
      const totalInstallmentValue = (newPercentage / 100) * totalValue;
      newValue = totalInstallmentValue / installmentsCount;
    } else if (label === "Reforços" && installmentsCount > 0) {
      // For reinforcements: value = (percentage * totalValue / 100) / reinforcementsCount
      const totalReinforcementValue = (newPercentage / 100) * totalValue;
      newValue = totalReinforcementValue / installmentsCount;
    } else {
      // For other cases: value = (percentage * totalValue) / 100
      newValue = (newPercentage / 100) * totalValue;
    }
    
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
