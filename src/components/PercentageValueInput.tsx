
import React, { useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CurrencyInput from "./CurrencyInput";
import PercentageInput from "./PercentageInput";
import { cn } from "@/lib/utils";

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
  installmentsCount?: number;
  hasError?: boolean;
  isKeysInput?: boolean;
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
  installmentsCount = 1,
  hasError = false,
  isKeysInput = false
}) => {
  // Ref para controlar qual campo foi alterado por último
  const lastChangedRef = useRef<'value' | 'percentage' | null>(null);

  const handleValueChange = (newValue: number) => {
    // Marca que o último campo alterado foi o valor
    lastChangedRef.current = 'value';
    
    // O valor digitado SEMPRE é respeitado - nunca alterado
    onValueChange(newValue);
    
    // Calcula o percentual correspondente com alta precisão interna
    let newPercentage = 0;
    if (totalValue > 0) {
      if (label === "Parcelas" && installmentsCount > 0) {
        const totalInstallmentValue = newValue * installmentsCount;
        newPercentage = (totalInstallmentValue / totalValue) * 100;
      } else if (label === "Reforços" && installmentsCount > 0) {
        const totalReinforcementValue = newValue * installmentsCount;
        newPercentage = (totalReinforcementValue / totalValue) * 100;
      } else {
        newPercentage = (newValue / totalValue) * 100;
      }
      
      // Arredonda apenas para exibição (1 casa decimal)
      newPercentage = Math.round(newPercentage * 10) / 10;
    }
    
    // Informa o percentual calculado (apenas para exibição)
    onPercentageChange(newPercentage);
  };

  const handlePercentageChange = (newPercentage: number) => {
    // Marca que o último campo alterado foi o percentual
    lastChangedRef.current = 'percentage';
    
    // Arredonda percentual para 1 casa decimal
    const roundedPercentage = Math.round(newPercentage * 10) / 10;
    onPercentageChange(roundedPercentage);
    
    // APENAS recalcula o valor se o usuário alterou o percentual
    // (não recalcula se o percentual foi alterado programaticamente)
    let newValue = 0;
    if (label === "Parcelas" && installmentsCount > 0) {
      const totalInstallmentValue = (roundedPercentage / 100) * totalValue;
      newValue = totalInstallmentValue / installmentsCount;
    } else if (label === "Reforços" && installmentsCount > 0) {
      const totalReinforcementValue = (roundedPercentage / 100) * totalValue;
      newValue = totalReinforcementValue / installmentsCount;
    } else {
      newValue = (roundedPercentage / 100) * totalValue;
    }
    
    onValueChange(newValue);
  };
  
  return (
    <div className={cn(
      "space-y-4 p-3 rounded-lg border-2 transition-colors",
      hasError 
        ? "border-red-300 bg-red-50" 
        : "border-transparent"
    )}>
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
            className={cn(
              valueInputClassName,
              hasError && "border-red-500 focus:ring-red-500"
            )}
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
            className={cn(
              percentageInputClassName,
              hasError && "border-red-500 focus:ring-red-500"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
