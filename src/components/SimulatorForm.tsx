
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PropertyValueInput from "./PropertyValueInput";
import PercentageValueInput from "./PercentageValueInput";
import NumberInput from "./NumberInput";
import PercentageInput from "./PercentageInput";
import CorrectionSelector from "./CorrectionSelector";
import MonthYearInput from "./MonthYearInput";
import ReinforcementDatesControl from "./ReinforcementDatesControl";
import SimulationResults from "./SimulationResults";
import SimulationHistory from "./SimulationHistory";
import { Calculator, TrendingUp, Calendar, Home } from "lucide-react";
import { calculateSimulation, SimulationParams } from "@/utils/calculationUtils";
import { calculateInstallmentsFromDeliveryDate } from "@/utils/dateUtils";

const SimulatorForm = () => {
  const [propertyValue, setPropertyValue] = useState<number>(300000);
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<number>(20);
  const [downPaymentValue, setDownPaymentValue] = useState<number>(60000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(120);
  const [installmentsValue, setInstallmentsValue] = useState<number>(2000);
  const [reinforcementFrequency, setReinforcementFrequency] = useState<number>(12);
  const [reinforcementsValue, setReinforcementsValue] = useState<number>(10000);
  const [finalMonthsWithoutReinforcement, setFinalMonthsWithoutReinforcement] = useState<number>(6);
  const [keysPercentage, setKeysPercentage] = useState<number>(5);
  const [keysValue, setKeysValue] = useState<number>(15000);
  const [correctionIndex, setCorrectionIndex] = useState<number>(0.5);
  const [appreciationIndex, setAppreciationIndex] = useState<number>(0.8);
  const [resaleMonth, setResaleMonth] = useState<number>(60);
  const [rentalPercentage, setRentalPercentage] = useState<number>(0.5);
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined);
  const [customReinforcementDates, setCustomReinforcementDates] = useState<Date[] | undefined>(undefined);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [simulationParams, setSimulationParams] = useState<SimulationParams | null>(null);
  const [simulationHistory, setSimulationHistory] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  
  // Calculate installments automatically from delivery date
  const calculatedInstallments = deliveryDate ? calculateInstallmentsFromDeliveryDate(deliveryDate) : 0;
  
  useEffect(() => {
    // Update absolute value when percentage changes
    setDownPaymentValue((propertyValue * downPaymentPercentage) / 100);
  }, [downPaymentPercentage, propertyValue]);

  useEffect(() => {
    // Update percentage when absolute value changes
    setDownPaymentPercentage((downPaymentValue / propertyValue) * 100);
  }, [downPaymentValue, propertyValue]);

  useEffect(() => {
    // Update keys absolute value when percentage changes
    setKeysValue((propertyValue * keysPercentage) / 100);
  }, [keysPercentage, propertyValue]);

  useEffect(() => {
    // Update keys percentage when absolute value changes
    setKeysPercentage((keysValue / propertyValue) * 100);
  }, [keysValue, propertyValue]);

  const handleCalculate = async () => {
    setIsCalculating(true);

    const params: SimulationParams = {
      propertyValue,
      downPaymentPercentage,
      downPaymentValue,
      installmentsCount: calculatedInstallments,
      installmentsValue,
      reinforcementFrequency,
      reinforcementsValue,
      finalMonthsWithoutReinforcement,
      keysPercentage,
      keysValue,
      correctionIndex,
      appreciationIndex,
      resaleMonth,
      rentalPercentage,
      startDate: deliveryDate ? new Date(deliveryDate.getFullYear(), deliveryDate.getMonth() - calculatedInstallments - 1, 1) : undefined,
      customReinforcementDates,
      deliveryDate,
      // Required fields for SimulationFormData interface
      installmentsPercentage: 0,
      reinforcementsPercentage: 0,
      correctionMode: "manual" as const
    };

    setSimulationParams(params);

    try {
      const results = await calculateSimulation(params);
      setSimulationResults(results);

      // Save simulation to history
      const newSimulation = {
        id: Date.now(),
        name: `Simulação ${simulationHistory.length + 1}`,
        timestamp: new Date(),
        formData: params,
        results: results,
        schedule: results.schedule,
        bestResaleInfo: results.bestResaleInfo
      };

      setSimulationHistory([newSimulation, ...simulationHistory]);
      localStorage.setItem('simulationHistory', JSON.stringify([newSimulation, ...simulationHistory]));
    } catch (error) {
      console.error("Error calculating simulation:", error);
      // Handle error appropriately
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Simulador de Investimento Imobiliário
        </h1>
        <p className="text-gray-600">
          Planeje seu investimento em imóveis na planta de forma inteligente.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Property Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-600" />
                Informações do Imóvel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PropertyValueInput
                value={propertyValue}
                onChange={setPropertyValue}
              />

              <PercentageValueInput
                label="Entrada"
                percentage={downPaymentPercentage}
                onPercentageChange={setDownPaymentPercentage}
                absoluteValue={downPaymentValue}
                onAbsoluteChange={setDownPaymentValue}
                baseValue={propertyValue}
                required
              />

              <MonthYearInput
                label="Data de entrega"
                value={deliveryDate}
                onChange={setDeliveryDate}
                placeholder="MM/AAAA"
                required
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Parcelas mensais
                </label>
                <div className="p-3 bg-slate-50 rounded-lg border">
                  <div className="text-lg font-semibold text-blue-600">
                    {calculatedInstallments} parcelas
                  </div>
                  <div className="text-sm text-slate-600">
                    {deliveryDate ? (
                      `Calculado automaticamente até ${deliveryDate.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}`
                    ) : (
                      'Defina a data de entrega para calcular'
                    )}
                  </div>
                </div>
              </div>

              <PropertyValueInput
                value={installmentsValue}
                onChange={setInstallmentsValue}
              />
            </CardContent>
          </Card>

          {/* Reinforcement Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Configuração dos Reforços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <NumberInput
                id="reinforcement-frequency"
                label="Frequência dos reforços (meses)"
                value={reinforcementFrequency}
                onChange={setReinforcementFrequency}
                min={0}
                max={120}
              />
              <PropertyValueInput
                value={reinforcementsValue}
                onChange={setReinforcementsValue}
              />
              <NumberInput
                id="final-months"
                label="Meses finais sem reforço"
                value={finalMonthsWithoutReinforcement}
                onChange={setFinalMonthsWithoutReinforcement}
                min={0}
                max={120}
              />
              <PercentageValueInput
                label="Chaves"
                percentage={keysPercentage}
                onPercentageChange={setKeysPercentage}
                absoluteValue={keysValue}
                onAbsoluteChange={setKeysValue}
                baseValue={propertyValue}
                required
              />
            </CardContent>
          </Card>

          {/* Correction and Appreciation Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Correção e Valorização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CorrectionSelector
                value="manual"
                onChange={() => {}}
              />
              <PercentageInput
                id="appreciation"
                label="Valorização anual do imóvel"
                value={appreciationIndex}
                onChange={setAppreciationIndex}
              />
              <NumberInput
                id="resale-month"
                label="Mês para revenda"
                value={resaleMonth}
                onChange={setResaleMonth}
                min={0}
                max={600}
              />
              <PercentageInput
                id="rental"
                label="Percentual para aluguel"
                value={rentalPercentage}
                onChange={setRentalPercentage}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results and Calculation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Simulação</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                onClick={handleCalculate}
                disabled={isCalculating}
              >
                {isCalculating ? "Calculando..." : "Calcular"}
              </Button>
              {simulationResults && (
                <SimulationResults 
                  data={simulationResults}
                  formData={simulationParams}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reinforcement Dates Control */}
      {deliveryDate && (
        <ReinforcementDatesControl
          deliveryDate={deliveryDate}
          installmentsCount={calculatedInstallments}
          reinforcementFrequency={reinforcementFrequency}
          finalMonthsWithoutReinforcement={finalMonthsWithoutReinforcement}
          customDates={customReinforcementDates}
          onCustomDatesChange={setCustomReinforcementDates}
        />
      )}

      {/* Simulation History */}
      <SimulationHistory 
        simulations={simulationHistory}
        onLoadSimulation={(simulation) => {
          // Load simulation logic here
        }}
      />
    </div>
  );
};

export default SimulatorForm;
