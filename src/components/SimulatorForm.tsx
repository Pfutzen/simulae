import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { saveSimulation, getSimulations, SavedSimulation } from "@/utils/simulationHistoryUtils";
import PropertyValueInput from "./PropertyValueInput";
import PercentageValueInput from "./PercentageValueInput";
import NumberInput from "./NumberInput";
import PercentageSlider from "./PercentageSlider";
import CorrectionSelector from "./CorrectionSelector";
import SimulationResults from "./SimulationResults";
import SimulationHistory from "./SimulationHistory";
import { CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SimulatorForm: React.FC = () => {
  const { toast } = useToast();
  const [simulationName, setSimulationName] = useState<string>("");
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [activeTab, setActiveTab] = useState<string>("simulator");
  const [formData, setFormData] = useState<SimulationFormData>({
    propertyValue: 500000,
    downPaymentValue: 50000,
    downPaymentPercentage: 10,
    installmentsValue: 2500,
    installmentsPercentage: 20,
    installmentsCount: 40,
    reinforcementsValue: 16666.67,
    reinforcementsPercentage: 20,
    reinforcementFrequency: 6,
    finalMonthsWithoutReinforcement: 5, // Default to 5 months without reinforcement at the end
    keysValue: 250000,
    keysPercentage: 50,
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
  
  const [currentSimulation, setCurrentSimulation] = useState<SavedSimulation | undefined>(undefined);
  const [customResaleEnabled, setCustomResaleEnabled] = useState<boolean>(true);

  // Load saved simulations on component mount
  useEffect(() => {
    const savedSimulations = getSimulations();
    setSimulations(savedSimulations);
  }, []);

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

  // Calculate reinforcement months whenever the frequency, installment count, or finalMonthsWithoutReinforcement changes
  useEffect(() => {
    const months = getReinforcementMonths(
      formData.installmentsCount, 
      formData.reinforcementFrequency,
      formData.finalMonthsWithoutReinforcement
    );
    setReinforcementMonths(months);
  }, [
    formData.installmentsCount, 
    formData.reinforcementFrequency,
    formData.finalMonthsWithoutReinforcement
  ]);

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
    const months = getReinforcementMonths(
      newData.installmentsCount, 
      newData.reinforcementFrequency,
      newData.finalMonthsWithoutReinforcement
    );
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
    const months = getReinforcementMonths(
      count, 
      formData.reinforcementFrequency,
      formData.finalMonthsWithoutReinforcement
    );
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
    const months = getReinforcementMonths(
      formData.installmentsCount,
      formData.reinforcementFrequency,
      formData.finalMonthsWithoutReinforcement
    );
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
    const months = getReinforcementMonths(
      formData.installmentsCount,
      formData.reinforcementFrequency,
      formData.finalMonthsWithoutReinforcement
    );
    const count = months.length;
    const value = count > 0 ? totalValue / count : 0;
    
    setFormData({
      ...formData,
      reinforcementsValue: value,
      reinforcementsPercentage: percentage
    });
  };

  const handleReinforcementFrequencyChange = (frequency: number) => {
    const months = getReinforcementMonths(
      formData.installmentsCount, 
      frequency,
      formData.finalMonthsWithoutReinforcement
    );
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

  // Handle final months without reinforcement change
  const handleFinalMonthsWithoutReinforcementChange = (months: number) => {
    const newMonths = getReinforcementMonths(
      formData.installmentsCount,
      formData.reinforcementFrequency,
      months
    );
    const count = newMonths.length;
    
    // Recalculate reinforcement value based on new count of reinforcement months
    const totalValue = calculateValue(
      formData.reinforcementsPercentage,
      formData.propertyValue
    );
    const value = count > 0 ? totalValue / count : 0;
    
    setFormData({
      ...formData,
      finalMonthsWithoutReinforcement: months,
      reinforcementsValue: value
    });
    
    setReinforcementMonths(newMonths);
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

  // Toggle custom resale month
  const handleCustomResaleToggle = (checked: boolean) => {
    setCustomResaleEnabled(checked);
  };

  // Handle simulation name change
  const handleSimulationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulationName(e.target.value);
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
    
    // If custom resale is not enabled, use the last installment month (keys payment)
    const effectiveResaleMonth = customResaleEnabled 
      ? formData.resaleMonth 
      : formData.installmentsCount;
      
    const results = calculateResaleProfit(paymentSchedule, effectiveResaleMonth);
    setResaleResults(results);
    
    // Calculate best resale month
    const bestResale = calculateBestResaleMonth(paymentSchedule);
    setBestResaleInfo(bestResale);
    
    // Reset current simulation when running a new simulation
    setCurrentSimulation(undefined);
    
    toast({
      title: "Simulação realizada com sucesso",
      description: "Veja os resultados abaixo"
    });
  };

  // Save the current simulation
  const handleSaveSimulation = () => {
    if (!simulationName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, dê um nome para esta simulação",
        variant: "destructive"
      });
      return;
    }

    if (schedule.length === 0) {
      toast({
        title: "Simulação não realizada",
        description: "Execute a simulação antes de salvar",
        variant: "destructive"
      });
      return;
    }

    const simulation = saveSimulation({
      name: simulationName,
      timestamp: Date.now(),
      formData,
      results: resaleResults,
      bestResaleInfo
    });

    // Update local state with the new simulation
    setSimulations([simulation, ...simulations]);
    setCurrentSimulation(simulation);
    
    toast({
      title: "Simulação salva",
      description: "A simulação foi salva no histórico"
    });
  };

  // View a saved simulation
  const handleViewSimulation = (simulation: SavedSimulation) => {
    setFormData(simulation.formData);
    setSchedule(generatePaymentSchedule(simulation.formData));
    setResaleResults(simulation.results);
    setBestResaleInfo(simulation.bestResaleInfo);
    setSimulationName(`Cópia de: ${simulation.name}`);
    setCurrentSimulation(simulation);
    setActiveTab("simulator");
    setCustomResaleEnabled(true); // Enable custom resale when loading a simulation

    toast({
      title: "Simulação carregada",
      description: "A simulação foi carregada com sucesso"
    });
  };

  // Duplicate a simulation
  const handleDuplicateSimulation = (simulation: SavedSimulation) => {
    setFormData(simulation.formData);
    setSchedule(generatePaymentSchedule(simulation.formData));
    setResaleResults(simulation.results);
    setBestResaleInfo(simulation.bestResaleInfo);
    setSimulationName(`Cópia de: ${simulation.name}`);
    setActiveTab("simulator");
    setCurrentSimulation(undefined); // Reset current simulation when duplicating

    toast({
      title: "Simulação duplicada",
      description: "Edite a simulação conforme necessário e salve"
    });
  };

  // Delete a simulation from state
  const handleDeleteSimulation = (id: string) => {
    setSimulations(simulations.filter(sim => sim.id !== id));
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="space-y-8">
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
                    <NumberInput
                      id="final-months-without-reinforcement"
                      label="Meses finais sem reforço"
                      value={formData.finalMonthsWithoutReinforcement}
                      onChange={handleFinalMonthsWithoutReinforcementChange}
                      min={0}
                      max={formData.installmentsCount - 1}
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
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="custom-resale-toggle" className="flex items-center gap-2 cursor-pointer">
                          Quero simular a venda em um mês específico
                        </Label>
                        <Switch 
                          id="custom-resale-toggle"
                          checked={customResaleEnabled} 
                          onCheckedChange={handleCustomResaleToggle}
                        />
                      </div>
                      
                      {customResaleEnabled && (
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
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <div className="mb-4">
                    <Label htmlFor="simulation-name">Nome da Simulação</Label>
                    <Input
                      id="simulation-name"
                      placeholder="Ex: Cliente João - Apto 802"
                      value={simulationName}
                      onChange={handleSimulationNameChange}
                      className="mt-1"
                    />
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleSimulate} 
                      disabled={totalPercentage !== 100}
                      className="bg-simulae-600 hover:bg-simulae-700 text-white px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      Simular
                    </Button>
                    
                    {schedule.length > 0 && (
                      <Button
                        onClick={handleSaveSimulation}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg w-full sm:w-auto"
                        disabled={!simulationName.trim()}
                      >
                        Salvar Simulação
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {schedule.length > 0 && (
            <SimulationResults 
              schedule={schedule}
              resaleMonth={customResaleEnabled ? formData.resaleMonth : formData.installmentsCount}
              bestResaleInfo={bestResaleInfo}
              simulationData={currentSimulation}
              {...resaleResults}
            />
          )}
        </TabsContent>
        
        <TabsContent value="history">
          <SimulationHistory 
            simulations={simulations}
            onViewSimulation={handleViewSimulation}
            onDuplicateSimulation={handleDuplicateSimulation}
            onDeleteSimulation={handleDeleteSimulation}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulatorForm;
