
import React from "react";
import { SimulationFormData } from "@/utils/calculationUtils";
import PercentageValueInput from "./PercentageValueInput";
import NumberInput from "./NumberInput";

interface PaymentInputsProps {
  formData: SimulationFormData;
  reinforcementMonths: number[];
  onDownPaymentValueChange: (value: number) => void;
  onDownPaymentPercentageChange: (percentage: number) => void;
  onInstallmentsValueChange: (value: number) => void;
  onInstallmentsPercentageChange: (percentage: number) => void;
  onInstallmentsCountChange: (count: number) => void;
  onReinforcementsValueChange: (value: number) => void;
  onReinforcementsPercentageChange: (percentage: number) => void;
  onReinforcementFrequencyChange: (frequency: number) => void;
  onKeysValueChange: (value: number) => void;
  onKeysPercentageChange: (percentage: number) => void;
}

const PaymentInputs: React.FC<PaymentInputsProps> = ({
  formData,
  reinforcementMonths,
  onDownPaymentValueChange,
  onDownPaymentPercentageChange,
  onInstallmentsValueChange,
  onInstallmentsPercentageChange,
  onInstallmentsCountChange,
  onReinforcementsValueChange,
  onReinforcementsPercentageChange,
  onReinforcementFrequencyChange,
  onKeysValueChange,
  onKeysPercentageChange,
}) => {
  const getReinforcementMonthsText = (): string => {
    if (reinforcementMonths.length === 0) {
      return "Nenhum reforço será aplicado";
    }
    return `Reforços nos meses: ${reinforcementMonths.join(", ")}`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PercentageValueInput
          label="Entrada"
          value={formData.downPaymentValue}
          percentage={formData.downPaymentPercentage}
          totalValue={formData.propertyValue}
          onValueChange={onDownPaymentValueChange}
          onPercentageChange={onDownPaymentPercentageChange}
        />
        
        <div className="space-y-6">
          <PercentageValueInput
            label="Parcelas"
            valueLabel="Valor por parcela (R$)"
            value={formData.installmentsValue}
            percentage={formData.installmentsPercentage}
            totalValue={formData.propertyValue}
            onValueChange={onInstallmentsValueChange}
            onPercentageChange={onInstallmentsPercentageChange}
          />
          <NumberInput
            id="installments-count"
            label="Quantidade de parcelas"
            value={formData.installmentsCount}
            onChange={onInstallmentsCountChange}
            min={1}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PercentageValueInput
            label="Reforços"
            valueLabel="Valor por reforço (R$)"
            value={formData.reinforcementsValue}
            percentage={formData.reinforcementsPercentage}
            totalValue={formData.propertyValue}
            onValueChange={onReinforcementsValueChange}
            onPercentageChange={onReinforcementsPercentageChange}
          />
          <NumberInput
            id="reinforcement-frequency"
            label="Frequência dos reforços (meses)"
            value={formData.reinforcementFrequency}
            onChange={onReinforcementFrequencyChange}
            min={0}
            suffix="meses"
          />
          {reinforcementMonths.length > 0 && (
            <div className="text-sm text-blue-600 mt-1">
              {getReinforcementMonthsText()}
            </div>
          )}
        </div>
        
        <PercentageValueInput
          label="Chaves"
          value={formData.keysValue}
          percentage={formData.keysPercentage}
          totalValue={formData.propertyValue}
          onValueChange={onKeysValueChange}
          onPercentageChange={onKeysPercentageChange}
        />
      </div>
    </>
  );
};

export default PaymentInputs;
