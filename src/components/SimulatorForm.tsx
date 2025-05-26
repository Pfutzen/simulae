
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  calculatePercentage, 
  calculateValue, 
  calculateTotalPercentage, 
  generatePaymentSchedule, 
  calculateResaleProfit,
  getReinforcementMonths,
  SimulationFormData,
  PaymentType
} from "@/utils/calculationUtils";
import PropertyValueInput from "./PropertyValueInput";
import FormValidation from "./FormValidation";
import PaymentInputs from "./PaymentInputs";
import SimulationSettings from "./SimulationSettings";
import SimulationResults from "./SimulationResults";
import { useToast } from "@/hooks/use-toast";

const SimulatorForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SimulationFormData>({
    propertyValue: 500000,
    downPaymentValue: 50000,
    downPaymentPercentage: 10,
    installmentsValue: 6875,
    installmentsPercentage: 55,
    installmentsCount: 40,
    reinforcementsValue: 25000,
    reinforcementsPercentage: 20,
    reinforcementFrequency: 6,
    keysValue: 75000,
    keysPercentage: 15,
    correctionIndex: 0.5,
    appreciationIndex: 0.8,
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
    
    toast({
      title: "Simulação realizada com sucesso",
      description: "Veja os resultados abaixo"
    });
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
            
            <FormValidation totalPercentage={totalPercentage} />
            
            <PaymentInputs
              formData={formData}
              reinforcementMonths={reinforcementMonths}
              onDownPaymentValueChange={handleDownPaymentValueChange}
              onDownPaymentPercentageChange={handleDownPaymentPercentageChange}
              onInstallmentsValueChange={handleInstallmentsValueChange}
              onInstallmentsPercentageChange={handleInstallmentsPercentageChange}
              onInstallmentsCountChange={handleInstallmentsCountChange}
              onReinforcementsValueChange={handleReinforcementsValueChange}
              onReinforcementsPercentageChange={handleReinforcementsPercentageChange}
              onReinforcementFrequencyChange={handleReinforcementFrequencyChange}
              onKeysValueChange={handleKeysValueChange}
              onKeysPercentageChange={handleKeysPercentageChange}
            />
            
            <Separator />
            
            <SimulationSettings
              correctionIndex={formData.correctionIndex}
              appreciationIndex={formData.appreciationIndex}
              resaleMonth={formData.resaleMonth}
              installmentsCount={formData.installmentsCount}
              onCorrectionIndexChange={handleCorrectionIndexChange}
              onAppreciationIndexChange={handleAppreciationIndexChange}
              onResaleMonthChange={handleResaleMonthChange}
            />
            
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
          {...resaleResults}
        />
      )}
    </div>
  );
};

export default SimulatorForm;
