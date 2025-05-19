
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  calculatePercentage, 
  calculateValue, 
  calculateTotalPercentage, 
  generatePaymentSchedule, 
  calculateResaleProfit,
  calculateMaxReinforcementCount,
  getReinforcementMonths,
  calculateBestResaleMonth,
  SimulationFormData,
  PaymentType,
  CorrectionMode
} from "@/utils/calculationUtils";
import PropertyValueInput from "./PropertyValueInput";
import PercentageValueInput from "./PercentageValueInput";
import NumberInput from "./NumberInput";
import PercentageSlider from "./PercentageSlider";
import CorrectionSelector from "./CorrectionSelector";
import SimulationResults from "./SimulationResults";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SimulatorForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SimulationFormData>({
    propertyValue: 500000,
    downPaymentValue: 50000,
    downPaymentPercentage: 10,
    installmentsValue: 2500, // Updated based on 20% over 40 installments
    installmentsPercentage: 20, // Changed from 55% to 20%
    installmentsCount: 40,
    reinforcementsValue: 16666.67, // Adjusted for 20% over typically 6 reinforcements
    reinforcementsPercentage: 20, // Changed from 20% to 20% (unchanged)
    reinforcementFrequency: 6,
    keysValue: 250000, // Changed to reflect 50% of property value
    keysPercentage: 50, // Changed from 15% to 50%
    correctionMode: "manual",
    correctionIndex: 0.5,
    appreciationIndex: 1.35,
    resaleMonth: 24
  });

  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [schedule, setSchedule] = useState<PaymentType[]>([]);
  const [resaleResults, setResaleResults] = useState({
    investmentValue: 0,
    propertyValue: 0,
    profit: 0,
    profitPercentage: 0,
    remainingBalance: 0
  });
  const [reinforcementMonths, setReinforcementMonths] = useState<number[]>([]);
  const [bestResaleInfo, setBestResaleInfo] = useState<{
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
  }>({ 
    bestProfitMonth: 0, 
    maxProfit: 0, 
    maxProfitPercentage: 0,
    bestRoiMonth: 0,
    maxRoi: 0,
    maxRoiProfit: 0
  });

  // Calculate total percentage whenever relevant form values change
  useEffect(() => {
    const total = calculateTotalPercentage(formData);
    setTotalPercentage(total);
  }, [
    formData.downPaymentPercentage,
    formData.installmentsPercentage,
    formData.reinforcementsPercentage,
    formData.keysPercentage
  ]);

  // Calculate reinforcement months whenever the frequency or installment count changes
  useEffect(() => {
    const months = getReinforcementMonths(formData.installmentsCount, formData.reinforcementFrequency);
    setReinforcementMonths(months);
  }, [formData.installmentsCount, formData.reinforcementFrequency]);

  // Handle property value change
  const handlePropertyValueChange = (value: number) => {
    const newData = { ...formData, propertyValue: value };
    
    // Update all values based on percentages
    newData.downPaymentValue = calculateValue(
      newData.downPaymentPercentage,
      value
    );
    newData.installmentsValue = calculateValue(
      newData.installmentsPercentage,
      value
    ) / newData.installmentsCount;
    
    // Calculate reinforcement value based on actual number of reinforcements
    const months = getReinforcementMonths(newData.installmentsCount, newData.reinforcementFrequency);
    const reinforcementCount = months.length;
    newData.reinforcementsValue = reinforcementCount > 0
      ? calculateValue(newData.reinforcementsPercentage, value) / reinforcementCount
      : 0;
    
    newData.keysValue = calculateValue(newData.keysPercentage, value);
    
    setFormData(newData);
    setReinforcementMonths(months);
  };

  // Handle down payment changes
  const handleDownPaymentValueChange = (value: number) => {
    const percentage = calculatePercentage(value, formData.propertyValue);
    setFormData({
      ...formData,
      downPaymentValue: value,
      downPaymentPercentage: percentage
    });
  };

  const handleDownPaymentPercentageChange = (percentage: number) => {
    const value = calculateValue(percentage, formData.propertyValue);
    setFormData({
      ...formData,
      downPaymentValue: value,
      downPaymentPercentage: percentage
    });
  };

  // Handle installments changes
  const handleInstallmentsValueChange = (value: number) => {
    const totalValue = value * formData.installmentsCount;
    const percentage = calculatePercentage(totalValue, formData.propertyValue);
    setFormData({
      ...formData,
      installmentsValue: value,
      installmentsPercentage: percentage
    });
  };

  const handleInstallmentsPercentageChange = (percentage: number) => {
    const totalValue = calculateValue(percentage, formData.propertyValue);
    const value = totalValue / formData.installmentsCount;
    setFormData({
      ...formData,
      installmentsValue: value,
      installmentsPercentage: percentage
    });
  };

  const handleInstallmentsCountChange = (count: number) => {
    const totalValue = calculateValue(
      formData.installmentsPercentage,
      formData.propertyValue
    );
    const value = count > 0 ? totalValue / count : 0;
    
    // Recalculate reinforcement value when installment count changes
    const months = getReinforcementMonths(count, formData.reinforcementFrequency);
    const reinforcementCount = months.length;
    const newReinforcementValue = reinforcementCount > 0
      ? calculateValue(formData.reinforcementsPercentage, formData.propertyValue) / reinforcementCount
      : formData.reinforcementsValue;
    
    setFormData({
      ...formData,
      installmentsCount: count,
      installmentsValue: value,
      reinforcementsValue: newReinforcementValue
    });
    
    setReinforcementMonths(months);
  };

  // Handle reinforcements changes
  const handleReinforcementsValueChange = (value: number) => {
    const months = getReinforcementMonths(formData.installmentsCount, formData.reinforcementFrequency);
    const count = months.length;
    const totalValue = value * count;
    const percentage = calculatePercentage(totalValue, formData.propertyValue);
    
    setFormData({
      ...formData,
      reinforcementsValue: value,
      reinforcementsPercentage: percentage
    });
  };

  const handleReinforcementsPercentageChange = (percentage: number) => {
    const totalValue = calculateValue(percentage, formData.propertyValue);
    const months = getReinforcementMonths(formData.installmentsCount, formData.reinforcementFrequency);
    const count = months.length;
    const value = count > 0 ? totalValue / count : 0;
    
    setFormData({
      ...formData,
      reinforcementsValue: value,
      reinforcementsPercentage: percentage
    });
  };

  const handleReinforcementFrequencyChange = (frequency: number) => {
    const months = getReinforcementMonths(formData.installmentsCount, frequency);
    const count = months.length;
    
    // Calculate new per-reinforcement value
    const totalValue = calculateValue(
      formData.reinforcementsPercentage,
      formData.propertyValue
    );
    const value = count > 0 ? totalValue / count : 0;
    
    setFormData({
      ...formData,
      reinforcementFrequency: frequency,
      reinforcementsValue: value
    });
    
    setReinforcementMonths(months);
  };

  // Handle keys payment changes
  const handleKeysValueChange = (value: number) => {
    const percentage = calculatePercentage(value, formData.propertyValue);
    setFormData({
      ...formData,
      keysValue: value,
      keysPercentage: percentage
    });
  };

  const handleKeysPercentageChange = (percentage: number) => {
    const value = calculateValue(percentage, formData.propertyValue);
    setFormData({
      ...formData,
      keysValue: value,
      keysPercentage: percentage
    });
  };

  // Handle correction mode change
  const handleCorrectionModeChange = (mode: CorrectionMode) => {
    setFormData({ ...formData, correctionMode: mode });
  };

  // Handle other inputs
  const handleCorrectionIndexChange = (value: number) => {
    setFormData({ ...formData, correctionIndex: value });
  };

  const handleAppreciationIndexChange = (value: number) => {
    setFormData({ ...formData, appreciationIndex: value });
  };

  const handleResaleMonthChange = (value: number) => {
    setFormData({ ...formData, resaleMonth: value });
  };

  // Run simulation
  const handleSimulate = () => {
    if (totalPercentage !== 100) {
      toast({
        title: "Percentuais incorretos",
        description: "A soma dos percentuais deve ser exatamente 100%",
        variant: "destructive"
      });
      return;
    }

    const paymentSchedule = generatePaymentSchedule(formData);
    setSchedule(paymentSchedule);
    
    const results = calculateResaleProfit(paymentSchedule, formData.resaleMonth);
    setResaleResults(results);
    
    // Calculate best resale month
    const bestResale = calculateBestResaleMonth(paymentSchedule);
    setBestResaleInfo(bestResale);
    
    toast({
      title: "Simulação realizada com sucesso",
      description: "Veja os resultados abaixo"
    });
  };

  // Format reinforcement months for display
  const getReinforcementMonthsText = (): string => {
    if (reinforcementMonths.length === 0) {
      return "Nenhum reforço será aplicado";
    }
    return `Reforços nos meses: ${reinforcementMonths.join(", ")}`;
  };

  // Calculate difference from 100%
  const calculateDifference = (): string => {
    const difference = totalPercentage - 100;
    if (difference === 0) return "";
    
    const formattedDifference = Math.abs(difference).toFixed(2);
    return difference > 0 
      ? `(${formattedDifference}% acima)` 
      : `(${formattedDifference}% abaixo)`;
  };

  return (
    <div className="space-y-8">
      <Card className="shadow">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <PropertyValueInput
              value={formData.propertyValue}
              onChange={handlePropertyValueChange}
            />
            
            <Separator />
            
            <Alert className={totalPercentage === 100 ? "bg-green-50" : "bg-amber-50"}>
              <div className="flex items-center gap-2">
                {totalPercentage === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                )}
                <AlertDescription className={totalPercentage === 100 ? "text-green-800" : "text-amber-800"}>
                  Total atual: {totalPercentage.toFixed(2)}%
                  {totalPercentage !== 100 && (
                    <span className="font-medium ml-1">
                      {calculateDifference()}
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PercentageValueInput
                label="Entrada"
                value={formData.downPaymentValue}
                percentage={formData.downPaymentPercentage}
                totalValue={formData.propertyValue}
                onValueChange={handleDownPaymentValueChange}
                onPercentageChange={handleDownPaymentPercentageChange}
                noDecimalsForPercentage={true}
              />
              
              <div className="space-y-6">
                <PercentageValueInput
                  label="Parcelas"
                  valueLabel="Valor por parcela (R$)"
                  value={formData.installmentsValue}
                  percentage={formData.installmentsPercentage}
                  totalValue={formData.propertyValue}
                  onValueChange={handleInstallmentsValueChange}
                  onPercentageChange={handleInstallmentsPercentageChange}
                  noDecimalsForPercentage={true}
                />
                <NumberInput
                  id="installments-count"
                  label="Quantidade de parcelas"
                  value={formData.installmentsCount}
                  onChange={handleInstallmentsCountChange}
                  min={1}
                  noDecimals={true}
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
                  onValueChange={handleReinforcementsValueChange}
                  onPercentageChange={handleReinforcementsPercentageChange}
                  noDecimalsForPercentage={true}
                />
                <NumberInput
                  id="reinforcement-frequency"
                  label="Frequência dos reforços (meses)"
                  value={formData.reinforcementFrequency}
                  onChange={handleReinforcementFrequencyChange}
                  min={0}
                  suffix="meses"
                  noDecimals={true}
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
                onValueChange={handleKeysValueChange}
                onPercentageChange={handleKeysPercentageChange}
                noDecimalsForPercentage={true}
              />
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CorrectionSelector
                  value={formData.correctionMode}
                  onChange={handleCorrectionModeChange}
                />
                
                {formData.correctionMode === "manual" && (
                  <NumberInput
                    id="correction-index"
                    label="Índice de correção mensal"
                    value={formData.correctionIndex}
                    onChange={handleCorrectionIndexChange}
                    min={0}
                    step={0.01}
                    suffix="%"
                  />
                )}
              </div>
              
              <div className="space-y-6">
                <PercentageSlider
                  id="appreciation-index"
                  label="Índice de valorização mensal"
                  value={formData.appreciationIndex}
                  onChange={handleAppreciationIndexChange}
                  min={0}
                  max={5}
                  step={0.01}
                  suffix="%"
                />
                
                <NumberInput
                  id="resale-month"
                  label="Mês para revenda"
                  value={formData.resaleMonth}
                  onChange={handleResaleMonthChange}
                  min={1}
                  max={formData.installmentsCount}
                  suffix="mês"
                  noDecimals={true}
                />
              </div>
            </div>
            
            <div className="flex justify-center pt-4">
              <Button 
                onClick={handleSimulate} 
                disabled={totalPercentage !== 100}
                className="bg-simulae-600 hover:bg-simulae-700 text-white px-8 py-6 text-lg"
              >
                Simular
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {schedule.length > 0 && (
        <SimulationResults 
          schedule={schedule}
          resaleMonth={formData.resaleMonth}
          bestResaleInfo={bestResaleInfo}
          {...resaleResults}
        />
      )}
    </div>
  );
};

export default SimulatorForm;
