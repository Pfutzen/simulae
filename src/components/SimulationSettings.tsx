
import React from "react";
import NumberInput from "./NumberInput";

interface SimulationSettingsProps {
  correctionIndex: number;
  appreciationIndex: number;
  resaleMonth: number;
  installmentsCount: number;
  onCorrectionIndexChange: (value: number) => void;
  onAppreciationIndexChange: (value: number) => void;
  onResaleMonthChange: (value: number) => void;
}

const SimulationSettings: React.FC<SimulationSettingsProps> = ({
  correctionIndex,
  appreciationIndex,
  resaleMonth,
  installmentsCount,
  onCorrectionIndexChange,
  onAppreciationIndexChange,
  onResaleMonthChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NumberInput
        id="correction-index"
        label="Índice de correção mensal"
        value={correctionIndex}
        onChange={onCorrectionIndexChange}
        min={0}
        step={0.01}
        suffix="%"
      />
      
      <NumberInput
        id="appreciation-index"
        label="Índice de valorização mensal"
        value={appreciationIndex}
        onChange={onAppreciationIndexChange}
        min={0}
        step={0.01}
        suffix="%"
      />
      
      <NumberInput
        id="resale-month"
        label="Mês para revenda"
        value={resaleMonth}
        onChange={onResaleMonthChange}
        min={1}
        max={installmentsCount}
        suffix="mês"
      />
    </div>
  );
};

export default SimulationSettings;
