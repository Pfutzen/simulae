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
import { saveSimulation, getSimulations, SavedSimulation, getActiveSimulation } from "@/utils/simulationHistoryUtils";
import { wouldStartDateBeInPast, formatToMonthYear, calculateInstallmentsFromValuationAndDelivery, safeDateConversion } from "@/utils/dateUtils";
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
import CurrencyInput from "./CurrencyInput";
import PercentageInput from "./PercentageInput";
import { CheckCircle, AlertCircle, DollarSign, Calendar, TrendingUp, Home, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonthYearInput from "./MonthYearInput";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import PropostaButton from "./PropostaButton";

const SimulatorForm: React.FC = () => {
  const { toast } = useToast();
  const [simulationName, setSimulationName] = useState<string>("");
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [activeTab, setActiveTab] = useState<string>("simulator");
  
  // Track which values were manually set by user input (R$ values)
  const [userSetValues, setUserSetValues] = useState<{
    downPaymentValue?: boolean;
    installmentsValue?: boolean;
    reinforcementsValue?: boolean;
    keysValue?: boolean;
  }>({});
  
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

    // Verificar se existe uma simulação ativa e carregar automaticamente
    const activeSimulation = getActiveSimulation();
    if (activeSimulation) {
      console.log('Carregando simulação ativa automaticamente:', activeSimulation.name);
      
      // Converter strings de data de volta para objetos Date
      const formDataWithDates = {
        ...activeSimulation.formData,
        startDate: safeDateConversion(activeSimulation.formData.startDate),
        deliveryDate: safeDateConversion(activeSimulation.formData.deliveryDate),
        valuationDate: safeDateConversion(activeSimulation.formData.valuationDate),
        customReinforcementDates: activeSimulation.formData.customReinforcementDates?.map(date => safeDateConversion(date)).filter(Boolean) as Date[] | undefined
      };
      
      setFormData(formDataWithDates);
      setSchedule(activeSimulation.schedule);
      setResaleResults(activeSimulation.results);
      setBestResaleInfo(activeSimulation.bestResaleInfo);
      setCurrentSimulation(activeSimulation);
      
      toast({
        title: "Simulação ativa carregada",
        description: `"${activeSimulation.name}" foi carregada automaticamente`,
      });
    }
  }, [toast]);

  useEffect(() => {
    // Calculate total percentage EXCLUDING keys
    const totalWithoutKeys = 
      formData.downPaymentPercentage +
      formData.installmentsPercentage +
      formData.reinforcementsPercentage;
    
    // Keys percentage is always the remainder to complete 100%
    const keysPercentage = Math.max(0, 100 - totalWithoutKeys);
    
    // Only update if there's a meaningful change to avoid infinite loops
    if (Math.abs(formData.keysPercentage - keysPercentage) > 0.01) {
      const keysValue = calculateValue(keysPercentage, formData.propertyValue);
      
      setFormData(prev => ({
        ...prev,
        keysValue: keysValue,
        keysPercentage: Math.round(keysPercentage * 10) / 10
      }));
      
      // Reset the manual flag since we're auto-calculating
      setUserSetValues(prev => ({ ...prev, keysValue: false }));
    }
    
    const total = totalWithoutKeys + keysPercentage;
    setTotalPercentage(total);
  }, [
    formData.downPaymentPercentage,
    formData.installmentsPercentage,
    formData.reinforcementsPercentage,
    formData.propertyValue
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
      
      // NUNCA recalcula valores que foram definidos manualmente pelo usuário
      if (!userSetValues.installmentsValue) {
        updatedFormData.installmentsValue = calculatedInstallments > 0 
          ? calculateValue(updatedFormData.installmentsPercentage, updatedFormData.propertyValue) / calculatedInstallments
          : 0;
      } else {
        // Se foi definido manualmente, apenas recalcula o percentual para exibição
        const totalInstallmentValue = updatedFormData.installmentsValue * calculatedInstallments;
        updatedFormData.installmentsPercentage = Math.round(
          (totalInstallmentValue / updatedFormData.propertyValue) * 100 * 10
        ) / 10;
      }
      
      const newReinforcementMonths = getReinforcementMonths(
        calculatedInstallments,
        updatedFormData.reinforcementFrequency,
        updatedFormData.finalMonthsWithoutReinforcement
      );
      const reinforcementCount = newReinforcementMonths.length;
      
      // NUNCA recalcula valores que foram definidos manualmente pelo usuário
      if (!userSetValues.reinforcementsValue) {
        updatedFormData.reinforcementsValue = reinforcementCount > 0
          ? calculateValue(updatedFormData.reinforcementsPercentage, updatedFormData.propertyValue) / reinforcementCount
          : 0;
      } else {
        // Se foi definido manualmente, apenas recalcula o percentual para exibição
        const totalReinforcementValue = updatedFormData.reinforcementsValue * reinforcementCount;
        updatedFormData.reinforcementsPercentage = Math.round(
          (totalReinforcementValue / updatedFormData.propertyValue) * 100 * 10
        ) / 10;
      }
      
      setFormData(updatedFormData);
      setReinforcementMonths(newReinforcementMonths);
    }
  }, [formData.valuationDate, formData.deliveryDate, userSetValues.installmentsValue, userSetValues.reinforcementsValue]);

  const handlePropertyValueChange = (value: number) => {
    const newData = { ...formData, propertyValue: value };
    
    // NUNCA recalcula valores definidos manualmente - apenas atualiza percentuais para exibição
    if (userSetValues.downPaymentValue) {
      // Mantém o valor exato manual, apenas recalcula percentual para exibição
      newData.downPaymentPercentage = Math.round(
        (newData.downPaymentValue / value) * 100 * 10
      ) / 10;
    } else {
      // Só recalcula valor se não foi definido manualmente
      newData.downPaymentValue = calculateValue(
        newData.downPaymentPercentage,
        value
      );
    }
    
    if (userSetValues.installmentsValue) {
      // Mantém o valor exato manual, apenas recalcula percentual para exibição
      const totalInstallmentValue = newData.installmentsValue * newData.installmentsCount;
      newData.installmentsPercentage = Math.round(
        (totalInstallmentValue / value) * 100 * 10
      ) / 10;
    } else {
      // Só recalcula valor se não foi definido manualmente
      newData.installmentsValue = calculateValue(
        newData.installmentsPercentage,
        value
      ) / newData.installmentsCount;
    }
    
    const months = getReinforcementMonths(
      newData.installmentsCount, 
      newData.reinforcementFrequency,
      newData.finalMonthsWithoutReinforcement
    );
    const reinforcementCount = months.length;
    
    if (userSetValues.reinforcementsValue) {
      // Mantém o valor exato manual, apenas recalcula percentual para exibição
      const totalReinforcementValue = newData.reinforcementsValue * reinforcementCount;
      newData.reinforcementsPercentage = Math.round(
        (totalReinforcementValue / value) * 100 * 10
      ) / 10;
    } else {
      // Só recalcula valor se não foi definido manualmente
      newData.reinforcementsValue = reinforcementCount > 0
        ? calculateValue(newData.reinforcementsPercentage, value) / reinforcementCount
        : 0;
    }
    
    // CHAVES sempre será recalculada automaticamente no useEffect
    // Não fazemos nada aqui para as chaves
    
    setFormData(newData);
    setReinforcementMonths(months);
  };

  const handleDownPaymentValueChange = (value: number) => {
    // O valor digitado NUNCA é alterado - fica exatamente como o usuário digitou
    const percentage = calculatePercentage(value, formData.propertyValue);
    setFormData({
      ...formData,
      downPaymentValue: value, // FIXO - nunca muda
      downPaymentPercentage: Math.round(percentage * 10) / 10
    });
    
    // Marca que este valor foi definido manualmente e NUNCA deve ser alterado
    setUserSetValues(prev => ({ ...prev, downPaymentValue: true }));
  };

  const handleDownPaymentPercentageChange = (percentage: number) => {
    const value = calculateValue(percentage, formData.propertyValue);
    setFormData({
      ...formData,
      downPaymentValue: value,
      downPaymentPercentage: Math.round(percentage * 10) / 10
    });
    
    // Remove o flag de manual quando o percentual é alterado
    setUserSetValues(prev => ({ ...prev, downPaymentValue: false }));
  };

  const handleInstallmentsValueChange = (value: number) => {
    // O valor digitado NUNCA é alterado - fica exatamente como o usuário digitou
    const totalValue = value * formData.installmentsCount;
    const percentage = calculatePercentage(totalValue, formData.propertyValue);
    setFormData({
      ...formData,
      installmentsValue: value, // FIXO - nunca muda
      installmentsPercentage: Math.round(percentage * 10) / 10
    });
    
    // Marca que este valor foi definido manualmente e NUNCA deve ser alterado
    setUserSetValues(prev => ({ ...prev, installmentsValue: true }));
  };

  const handleInstallmentsPercentageChange = (percentage: number) => {
    const totalValue = calculateValue(percentage, formData.propertyValue);
    const value = totalValue / formData.installmentsCount;
    setFormData({
      ...formData,
      installmentsValue: value,
      installmentsPercentage: Math.round(percentage * 10) / 10
    });
    
    // Remove o flag de manual quando o percentual é alterado
    setUserSetValues(prev => ({ ...prev, installmentsValue: false }));
  };

  const handleReinforcementsValueChange = (value: number) => {
    // O valor digitado NUNCA é alterado - fica exatamente como o usuário digitou
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
      reinforcementsValue: value, // FIXO - nunca muda
      reinforcementsPercentage: Math.round(percentage * 10) / 10
    });
    
    // Marca que este valor foi definido manualmente e NUNCA deve ser alterado
    setUserSetValues(prev => ({ ...prev, reinforcementsValue: true }));
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
      reinforcementsPercentage: Math.round(percentage * 10) / 10
    });
    
    // Remove o flag de manual quando o percentual é alterado
    setUserSetValues(prev => ({ ...prev, reinforcementsValue: false }));
  };

  const handleReinforcementFrequencyChange = (frequency: number) => {
    const months = getReinforcementMonths(
      formData.installmentsCount, 
      frequency,
      formData.finalMonthsWithoutReinforcement
    );
    const count = months.length;
    
    // NUNCA recalcula valores definidos manualmente
    let newValue = formData.reinforcementsValue;
    let newPercentage = formData.reinforcementsPercentage;
    
    if (userSetValues.reinforcementsValue) {
      // Mantém o valor exato manual, apenas recalcula percentual para exibição
      const totalReinforcementValue = newValue * count;
      newPercentage = Math.round(
        (totalReinforcementValue / formData.propertyValue) * 100 * 10
      ) / 10;
    } else {
      // Só recalcula valor se não foi definido manualmente
      const totalValue = calculateValue(
        formData.reinforcementsPercentage,
        formData.propertyValue
      );
      newValue = count > 0 ? totalValue / count : 0;
    }
    
    setFormData({
      ...formData,
      reinforcementFrequency: frequency,
      reinforcementsValue: newValue,
      reinforcementsPercentage: newPercentage
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
    
    // NUNCA recalcula valores definidos manualmente
    let newValue = formData.reinforcementsValue;
    let newPercentage = formData.reinforcementsPercentage;
    
    if (userSetValues.reinforcementsValue) {
      // Mantém o valor exato manual, apenas recalcula percentual para exibição
      const totalReinforcementValue = newValue * count;
      newPercentage = Math.round(
        (totalReinforcementValue / formData.propertyValue) * 100 * 10
      ) / 10;
    } else {
      // Só recalcula valor se não foi definido manualmente
      const totalValue = calculateValue(
        formData.reinforcementsPercentage,
        formData.propertyValue
      );
      newValue = count > 0 ? totalValue / count : 0;
    }
    
    setFormData({
      ...formData,
      finalMonthsWithoutReinforcement: months,
      reinforcementsValue: newValue,
      reinforcementsPercentage: newPercentage
    });
    
    setReinforcementMonths(newMonths);
  };

  // Remove the keys handlers since they will be auto-calculated
  // const handleKeysValueChange = ... (REMOVED)
  // const handleKeysPercentageChange = ... (REMOVED)

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

                {/* Remove the adjustment message since keys are always auto-calculated */}

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
                      
                      {/* Chaves agora sempre calculado automaticamente */}
                      <div className="space-y-4 p-3 rounded-lg border-2 border-green-200 bg-green-50">
                        <div className="flex flex-col space-y-2">
                          <Label className="text-base font-medium">Chaves (Saldo Automático)</Label>
                          <p className="text-sm text-green-700">
                            Calculado automaticamente para completar 100%
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm text-slate-500 block mb-1">
                              Valor (R$) (calculado)
                            </Label>
                            <CurrencyInput
                              value={formData.keysValue}
                              onChange={() => {}} // Não faz nada - é só visualização
                              disabled={true}
                              className="bg-green-100 text-green-800 font-medium"
                            />
                          </div>
                          
                          <div>
                            <Label className="text-sm text-slate-500 block mb-1">
                              Percentual (%) (calculado)
                            </Label>
                            <PercentageInput
                              value={formData.keysPercentage}
                              onChange={() => {}} // Não faz nada - é só visualização
                              disabled={true}
                              noDecimals={true}
                              className="bg-green-100 text-green-800 font-medium"
                            />
                          </div>
                        </div>
                      </div>
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
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <PercentageSlider
                              id="appreciation-index"
                              label="Índice de valorização mensal"
                              value={formData.appreciationIndex}
                              onChange={handleAppreciationIndexChange}
                              min={0}
                              max={5}
                              step={0.05}
                              suffix="%"
                              showIncrementButtons={true}
                              incrementStep={0.05}
                            />
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                  onClick={() => window.open('https://www.datazap.com.br/conteudos-fipezap/', '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Consultar índices oficiais da FipeZap</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
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
                      showIncrementButtons={true}
                      incrementStep={0.05}
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
              formData={formData}
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
