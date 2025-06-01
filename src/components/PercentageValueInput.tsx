
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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
  // Estado para controlar qual modo está ativo: "value" ou "percentage"
  const [fixedMode, setFixedMode] = useState<"value" | "percentage">("value");

  // Handler para valor em R$ (quando modo for 'value')
  const handleValueChange = (newValue: number) => {
    if (fixedMode !== "value") return;
    
    console.log(`[${label}] handleValueChange - newValue:`, newValue, 'mode:', fixedMode);
    
    // O valor digitado SEMPRE é respeitado - nunca alterado
    onValueChange(newValue);
    
    // Calcula o percentual correspondente para exibição
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
    
    console.log(`[${label}] Calculated percentage:`, newPercentage);
    onPercentageChange(newPercentage);
  };

  // Handler para percentual (quando modo for 'percentage')
  const handlePercentageChange = (newPercentage: number) => {
    if (fixedMode !== "percentage") return;
    
    console.log(`[${label}] handlePercentageChange - newPercentage:`, newPercentage, 'mode:', fixedMode);
    
    // Arredonda percentual para 1 casa decimal
    const roundedPercentage = Math.round(newPercentage * 10) / 10;
    onPercentageChange(roundedPercentage);
    
    // Calcula o valor correspondente
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
    
    console.log(`[${label}] Calculated value:`, newValue);
    onValueChange(newValue);
  };

  const handleModeChange = (newMode: string) => {
    if (newMode && (newMode === "value" || newMode === "percentage")) {
      console.log(`[${label}] Mode changed from ${fixedMode} to ${newMode}`);
      setFixedMode(newMode);
    }
  };

  // Percentual calculado para exibição quando modo for 'value'
  const displayPercentage = fixedMode === "value" 
    ? (() => {
        if (totalValue > 0) {
          let calculatedPercentage = 0;
          if (label === "Parcelas" && installmentsCount > 0) {
            const totalInstallmentValue = value * installmentsCount;
            calculatedPercentage = (totalInstallmentValue / totalValue) * 100;
          } else if (label === "Reforços" && installmentsCount > 0) {
            const totalReinforcementValue = value * installmentsCount;
            calculatedPercentage = (totalReinforcementValue / totalValue) * 100;
          } else {
            calculatedPercentage = (value / totalValue) * 100;
          }
          return Math.round(calculatedPercentage * 10) / 10;
        }
        return 0;
      })()
    : percentage;
  
  return (
    <div className={cn(
      "space-y-4 p-3 rounded-lg border-2 transition-colors",
      hasError 
        ? "border-red-300 bg-red-50" 
        : "border-transparent"
    )}>
      <div className="flex flex-col space-y-2">
        <Label className="text-base font-medium">{label}</Label>
        
        {/* Toggle para escolher o modo */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-slate-600">Modo de entrada:</Label>
          <ToggleGroup 
            type="single" 
            value={fixedMode} 
            onValueChange={handleModeChange}
            className="bg-slate-100 rounded-md p-1"
          >
            <ToggleGroupItem 
              value="value" 
              className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              Valor fixo (R$)
            </ToggleGroupItem>
            <ToggleGroupItem 
              value="percentage" 
              className="text-xs px-3 py-1 data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              Percentual fixo (%)
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${label}-value`} className="text-sm text-slate-500 block mb-1">
            {valueLabel} {fixedMode === "value" ? "(editável)" : "(calculado)"}
          </Label>
          <CurrencyInput
            id={`${label}-value`}
            value={value}
            onChange={handleValueChange}
            disabled={fixedMode !== "value"}
            className={cn(
              valueInputClassName,
              hasError && "border-red-500 focus:ring-red-500",
              fixedMode !== "value" && "bg-slate-100 text-slate-600"
            )}
          />
        </div>
        
        <div>
          <Label htmlFor={`${label}-percentage`} className="text-sm text-slate-500 block mb-1">
            Percentual (%) {fixedMode === "percentage" ? "(editável)" : "(calculado)"}
          </Label>
          <PercentageInput
            id={`${label}-percentage`}
            value={displayPercentage}
            onChange={handlePercentageChange}
            disabled={fixedMode !== "percentage"}
            noDecimals={noDecimalsForPercentage}
            className={cn(
              percentageInputClassName,
              hasError && "border-red-500 focus:ring-red-500",
              fixedMode !== "percentage" && "bg-slate-100 text-slate-600"
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default PercentageValueInput;
