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
  calculateRentalEstimate,
  calculateStartDateFromDelivery,
  calculateDeliveryDateFromStart,
  calculateStartDateFromValuation
} from "@/utils/calculationUtils";
import { SimulationFormData, PaymentType, CorrectionMode } from "@/utils/types";
import { saveSimulation, getSimulations, SavedSimulation } from "@/utils/simulationHistoryUtils";
import { wouldStartDateBeInPast, formatToMonthYear, calculateInstallmentsFromValuationAndDelivery } from "@/utils/dateUtils";
import PropertyValueInput from "./PropertyValueInput";
import PercentageValueInput from "./PercentageValueInput";
import PercentageValidationIndicator from "./PercentageValidationIndicator";
import NumberInput from "./NumberInput";
import PercentageSlider from "./PercentageSlider";
import CorrectionSelector from "./CorrectionSelector";
import SimulationResults from "./SimulationResults";
import SimulationHistory from "./SimulationHistory";
import DatePicker from "./DatePicker";
import ReinforcementDatesControl from "./ReinforcementDatesControl";
import { CheckCircle, AlertCircle, DollarSign, Calendar, TrendingUp, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthYearInput from "./MonthYearInput";

import PropostaButton from "./PropostaButton";

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
    finalMonthsWithoutReinforcement: 5,
    keysValue: 250000,
    keysPercentage: 50,
    correctionMode: "manual",
    correctionIndex: 0.5,
    appreciationIndex: 1.35,
    resaleMonth: 24,
    rentalPercentage: 0.5,
    startDate: undefined,
    deliveryDate: undefined,
    valuationDate: undefined,
    customReinforcementDates: undefined
  });

  const [totalPercentage, setTotalPercentage] = useState<number>(0);
  const [schedule, setSchedule] = useState<PaymentType[]>([]);
  const [resaleResults, setResaleResults] = useState({
    investmentValue: 0,
    propertyValue: 0,
    profit: 0,
    profitPercentage: 0,
    remainingBalance: 0,
    rentalEstimate: 0,
    annualRentalReturn: 0
  });
  const [reinforcementMonths, setReinforcementMonths] = useState<number[]>([]);
  const [bestResaleInfo, setBestResaleInfo] = useState<{
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    maxProfitTotalPaid: number;
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    maxRoiTotalPaid: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
    earlyTotalPaid?: number;
  }>({ 
    bestProfitMonth: 0, 
    maxProfit: 0, 
    maxProfitPercentage: 0,
    maxProfitTotalPaid: 0,
    bestRoiMonth: 0,
    maxRoi: 0,
    maxRoiProfit: 0,
    maxRoiTotalPaid: 0
  });
  
  const [currentSimulation, setCurrentSimulation] = useState<SavedSimulation | undefined>(undefined);
  const [customResaleEnabled, setCustomResaleEnabled] = useState<boolean>(true);

  useEffect(() => {
    const savedSimulations = getSimulations();
    setSimulations(savedSimulations);
  }, []);

  useEffect(() => {
    const total = calculateTotalPercentage(formData);
    setTotalPercentage(total);
  }, [
    formData.downPaymentPercentage,
    formData.installmentsPercentage,
    formData.reinforcementsPercentage,
    formData.keysPercentage
  ]);

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

  useEffect(() => {
    if (formData.valuationDate && formData.deliveryDate) {
      const calculatedInstallments = calculateInstallmentsFromValuationAndDelivery(
        formData.valuationDate, 
        formData.deliveryDate
      );
      const calculatedStartDate = calculateStartDateFromValuation(formData.valuationDate);
      
      const updatedFormData = {
        ...formData,
        installmentsCount: calculatedInstallments,
        startDate: calculatedStartDate,
        customReinforcementDates: undefined
      };
      
      updatedFormData.installmentsValue = calculatedInstallments > 0 
        ? calculateValue(updatedFormData.installmentsPercentage, updatedFormData.propertyValue) / calculatedInstallments
        : 0;
      
      const newReinforcementMonths = getReinforcementMonths(
        calculatedInstallments,
        updatedFormData.reinforcementFrequency,
        updatedFormData.finalMonthsWithoutReinforcement
      );
      const reinforcementCount = newReinforcementMonths.length;
      updatedFormData.reinforcementsValue = reinforcementCount > 0
        ? calculateValue(updatedFormData.reinforcementsPercentage, updatedFormData.propertyValue) / reinforcementCount
        : 0;
      
      setFormData(updatedFormData);
      setReinforcementMonths(newReinforcementMonths);
    }
  }, [formData.valuationDate, formData.deliveryDate]);

  const handlePropertyValueChange = (value: number) => {
    const newData = { ...formData, propertyValue: value };
    
    newData.downPaymentValue = calculateValue(
      newData.downPaymentPercentage,
      value
    );
    newData.installmentsValue = calculateValue(
      newData.installmentsPercentage,
      value
    ) / newData.installmentsCount;
    
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

  const handleFinalMonthsWithoutReinforcementChange = (months: number) => {
    const newMonths = getReinforcementMonths(
      formData.installmentsCount,
      formData.reinforcementFrequency,
      months
    );
    const count = newMonths.length;
    
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

  const handleCorrectionModeChange = (mode: CorrectionMode) => {
    setFormData({ ...formData, correctionMode: mode });
  };

  const handleCorrectionIndexChange = (value: number) => {
    setFormData({ ...formData, correctionIndex: value });
  };

  const handleAppreciationIndexChange = (value: number) => {
    setFormData({ ...formData, appreciationIndex: value });
  };

  const handleResaleMonthChange = (value: number) => {
    setFormData({ ...formData, resaleMonth: value });
  };

  const handleCustomResaleToggle = (checked: boolean) => {
    setCustomResaleEnabled(checked);
  };

  const handleSimulationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimulationName(e.target.value);
  };

  const handleRentalPercentageChange = (value: number) => {
    setFormData({ ...formData, rentalPercentage: value });
  };

  const handleValuationDateChange = (date: Date | undefined) => {
    setFormData({
      ...formData,
      valuationDate: date,
      customReinforcementDates: undefined
    });
  };

  const handleDeliveryDateChange = (date: Date | undefined) => {
    setFormData({
      ...formData,
      deliveryDate: date,
      customReinforcementDates: undefined
    });
  };

  const handleCustomReinforcementDatesChange = (dates: Date[] | undefined) => {
    setFormData({
      ...formData,
      customReinforcementDates: dates
    });
  };

  const handleUpdateSimulationWithCustomDates = () => {
    if (!formData.customReinforcementDates || formData.customReinforcementDates.length === 0) {
      toast({
        title: "Nenhuma data personalizada",
        description: "Defina datas personalizadas para os reforços antes de atualizar a simulação",
        variant: "destructive"
      });
      return;
    }

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
    
    const effectiveResaleMonth = customResaleEnabled 
      ? formData.resaleMonth 
      : formData.installmentsCount;
      
    const results = calculateResaleProfit(paymentSchedule, effectiveResaleMonth);
    
    const rentalData = calculateRentalEstimate(
      results.propertyValue, 
      formData.rentalPercentage
    );
    
    setResaleResults({
      ...results,
      rentalEstimate: rentalData.rentalEstimate,
      annualRentalReturn: rentalData.annualRentalReturn
    });
    
    const bestResale = calculateBestResaleMonth(paymentSchedule);
    setBestResaleInfo(bestResale);
    
    setCurrentSimulation(undefined);
    
    toast({
      title: "✅ Reforços atualizados com sucesso",
      description: "A simulação foi recalculada com as novas datas dos reforços"
    });
  };

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
    
    const effectiveResaleMonth = customResaleEnabled 
      ? formData.resaleMonth 
      : formData.installmentsCount;
      
    const results = calculateResaleProfit(paymentSchedule, effectiveResaleMonth);
    
    const rentalData = calculateRentalEstimate(
      results.propertyValue, 
      formData.rentalPercentage
    );
    
    setResaleResults({
      ...results,
      rentalEstimate: rentalData.rentalEstimate,
      annualRentalReturn: rentalData.annualRentalReturn
    });
    
    const bestResale = calculateBestResaleMonth(paymentSchedule);
    setBestResaleInfo(bestResale);
    
    setCurrentSimulation(undefined);
    
    toast({
      title: "✅ Simulação calculada com sucesso",
      description: "Confira os resultados abaixo"
    });
  };

  const handleSaveSimulation = () => {
    if (!simulationName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Digite um nome para a simulação",
        variant: "destructive"
      });
      return;
    }

    if (schedule.length === 0) {
      toast({
        title: "Simule primeiro",
        description: "Execute a simulação antes de salvar",
        variant: "destructive"
      });
      return;
    }

    const simulation: SavedSimulation = {
      id: Date.now().toString(),
      name: simulationName,
      timestamp: Date.now(),
      formData,
      schedule,
      results: resaleResults,
      bestResaleInfo,
      appreciationIndex: formData.appreciationIndex
    };

    saveSimulation(simulation);
    const updatedSimulations = getSimulations();
    setSimulations(updatedSimulations);
    setSimulationName("");
    
    toast({
      title: "✅ Simulação salva",
      description: `"${simulation.name}" foi salva no histórico`
    });
  };

  const handleViewSimulation = (simulation: SavedSimulation) => {
    setFormData(simulation.formData);
    setSchedule(simulation.schedule);
    setResaleResults(simulation.results);
    setBestResaleInfo(simulation.bestResaleInfo);
    setCurrentSimulation(simulation);
    setActiveTab("simulator");
    
    toast({
      title: "Simulação carregada",
      description: `"${simulation.name}" foi carregada`
    });
  };

  const handleDuplicateSimulation = (simulation: SavedSimulation) => {
    setFormData(simulation.formData);
    setSchedule([]);
    setCurrentSimulation(undefined);
    setSimulationName(`${simulation.name} - Cópia`);
    setActiveTab("simulator");
    
    toast({
      title: "Simulação duplicada",
      description: "Os dados foram copiados. Faça os ajustes necessários e simule novamente."
    });
  };

  const handleDeleteSimulation = (id: string) => {
    const updatedSimulations = simulations.filter(sim => sim.id !== id);
    setSimulations(updatedSimulations);
  };

  const isPercentageValid = totalPercentage === 100;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="simulator" className="space-y-8">
          <Card className="shadow">
            <CardContent className="pt-6">
              <div className="space-y-8">
                <PropertyValueInput
                  value={formData.propertyValue}
                  onChange={handlePropertyValueChange}
                />

                <PercentageValidationIndicator 
                  totalPercentage={totalPercentage}
                  className="mb-6"
                />

                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-4 gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Cronograma de Pagamentos</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <MonthYearInput
                        id="valuation-date"
                        label="Data de avaliação"
                        value={formData.valuationDate}
                        onChange={handleValuationDateChange}
                        placeholder="MM/AAAA"
                        required={true}
                        className="w-full md:w-[280px]"
                      />
                      
                      <MonthYearInput
                        id="delivery-date"
                        label="Data prevista de entrega"
                        value={formData.deliveryDate}
                        onChange={handleDeliveryDateChange}
                        placeholder="MM/AAAA"
                        required={true}
                        className="w-full md:w-[280px]"
                      />
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-700">
                          Parcelas mensais (calculado automaticamente)
                        </Label>
                        <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm">
                          {formData.valuationDate && formData.deliveryDate ? (
                            <span className="font-medium text-slate-800">
                              {formData.installmentsCount} parcelas
                            </span>
                          ) : (
                            <span className="text-slate-500">
                              Defina as datas de avaliação e entrega
                            </span>
                          )}
                        </div>
                        {formData.valuationDate && formData.deliveryDate && formData.startDate && (
                          <p className="text-xs text-slate-600">
                            Entrada: {formatToMonthYear(formData.valuationDate)}<br/>
                            Parcelas: {formatToMonthYear(formData.startDate)} até {formatToMonthYear(formData.deliveryDate)}<br/>
                            Chaves: {formatToMonthYear(formData.deliveryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {formData.valuationDate && formData.deliveryDate && formData.startDate && (
                      <div className="flex flex-col justify-center space-y-3">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Entrada paga em:</strong>{" "}
                            {formatToMonthYear(formData.valuationDate)}
                          </p>
                          <p className="text-sm text-blue-800">
                            <strong>Primeira parcela:</strong>{" "}
                            {formatToMonthYear(formData.startDate)}
                          </p>
                          <p className="text-sm text-blue-800">
                            <strong>Entrega das chaves:</strong>{" "}
                            {formatToMonthYear(formData.deliveryDate)}
                          </p>
                        </div>
                        
                        {formData.installmentsCount < 3 && (
                          <Alert className="bg-amber-50">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">
                              Atenção: Prazo muito curto ({formData.installmentsCount} parcelas). Considere uma data de entrega mais distante.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-4 gap-2">
                    <DollarSign className="h-5 w-5 text-simulae-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Entrada e Parcelamento</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PercentageValueInput
                      label="Entrada"
                      value={formData.downPaymentValue}
                      percentage={formData.downPaymentPercentage}
                      totalValue={formData.propertyValue}
                      onValueChange={handleDownPaymentValueChange}
                      onPercentageChange={handleDownPaymentPercentageChange}
                      noDecimalsForPercentage={true}
                      valueInputClassName="w-full md:w-[240px]"
                      percentageInputClassName="w-full md:w-[120px]"
                      hasError={!isPercentageValid}
                    />
                    
                    <div className="space-y-4">
                      <PercentageValueInput
                        label="Parcelas"
                        valueLabel="Valor por parcela (R$)"
                        value={formData.installmentsValue}
                        percentage={formData.installmentsPercentage}
                        totalValue={formData.propertyValue}
                        onValueChange={handleInstallmentsValueChange}
                        onPercentageChange={handleInstallmentsPercentageChange}
                        noDecimalsForPercentage={true}
                        valueInputClassName="w-full md:w-[240px]"
                        percentageInputClassName="w-full md:w-[120px]"
                        installmentsCount={formData.installmentsCount}
                        hasError={!isPercentageValid}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-4 gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Reforços Programados</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <PercentageValueInput
                          label="Reforços"
                          valueLabel="Valor por reforço (R$)"
                          value={formData.reinforcementsValue}
                          percentage={formData.reinforcementsPercentage}
                          totalValue={formData.propertyValue}
                          onValueChange={handleReinforcementsValueChange}
                          onPercentageChange={handleReinforcementsPercentageChange}
                          noDecimalsForPercentage={true}
                          valueInputClassName="w-full md:w-[240px]"
                          percentageInputClassName="w-full md:w-[120px]"
                          installmentsCount={reinforcementMonths.length}
                          hasError={!isPercentageValid}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <NumberInput
                            id="reinforcement-frequency"
                            label="Frequência (meses)"
                            value={formData.reinforcementFrequency}
                            onChange={handleReinforcementFrequencyChange}
                            min={0}
                            suffix="meses"
                            noDecimals={true}
                            className="w-full"
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
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <PercentageValueInput
                        label="Chaves"
                        value={formData.keysValue}
                        percentage={formData.keysPercentage}
                        totalValue={formData.propertyValue}
                        onValueChange={handleKeysValueChange}
                        onPercentageChange={handleKeysPercentageChange}
                        noDecimalsForPercentage={true}
                        valueInputClassName="w-full md:w-[240px]"
                        percentageInputClassName="w-full md:w-[120px]"
                        hasError={!isPercentageValid}
                      />
                    </div>

                    <ReinforcementDatesControl
                      valuationDate={formData.valuationDate}
                      deliveryDate={formData.deliveryDate}
                      installmentsCount={formData.installmentsCount}
                      reinforcementFrequency={formData.reinforcementFrequency}
                      finalMonthsWithoutReinforcement={formData.finalMonthsWithoutReinforcement}
                      customDates={formData.customReinforcementDates}
                      onCustomDatesChange={handleCustomReinforcementDatesChange}
                      onUpdateSimulation={handleUpdateSimulationWithCustomDates}
                      hasSchedule={schedule.length > 0}
                    />
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-4 gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Correção Monetária e Valorização</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                          className="w-full md:w-[240px]"
                        />
                      )}
                    </div>
                    
                    <div className="space-y-4">
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
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center mb-4 gap-2">
                    <Home className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-slate-800">Revenda e Aluguel</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
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
                          className="w-full md:w-[240px]"
                        />
                      )}
                    </div>
                    
                    <PercentageSlider
                      id="rental-percentage"
                      label="Percentual para aluguel mensal"
                      value={formData.rentalPercentage}
                      onChange={handleRentalPercentageChange}
                      min={0.1}
                      max={1}
                      step={0.05}
                      suffix="%"
                    />
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
                      disabled={
                        !isPercentageValid || 
                        !formData.valuationDate || 
                        !formData.deliveryDate ||
                        formData.installmentsCount < 1
                      }
                      className="bg-simulae-600 hover:bg-simulae-700 text-white px-8 py-6 text-lg w-full sm:w-auto"
                    >
                      Simular
                    </Button>
                    
                    {schedule.length > 0 && (
                      <>
                        <Button
                          onClick={handleSaveSimulation}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg w-full sm:w-auto"
                          disabled={!simulationName.trim()}
                        >
                          Salvar Simulação
                        </Button>
                        
                        <PropostaButton
                          simulation={currentSimulation}
                          schedule={schedule}
                          resaleResults={resaleResults}
                          bestResaleInfo={bestResaleInfo}
                          formData={formData}
                          appreciationIndex={formData.appreciationIndex}
                        />
                      </>
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
              rentalPercentage={formData.rentalPercentage}
              rentalEstimate={resaleResults.rentalEstimate}
              annualRentalReturn={resaleResults.annualRentalReturn}
              appreciationIndex={formData.appreciationIndex}
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
