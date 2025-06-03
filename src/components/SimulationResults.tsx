import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  Home,
  Download,
  AlertCircle,
  FileText,
  Percent,
  CreditCard,
  Building,
  FileSpreadsheet,
  Calculator,
  Info,
  Zap,
  BarChart3
} from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { PaymentType } from "@/utils/calculationUtils";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { generatePDF } from "@/utils/pdfExport";
import { calculateAnnualAppreciation, calculateRentalEstimate } from "@/utils/calculationHelpers";
import ResultsChart from "./ResultsChart";
import FinancingSimulator from "./FinancingSimulator";
import { exportScheduleToCSV, exportScheduleToExcel, exportScheduleToPDF } from "@/utils/scheduleExport";
import { SimulationFormData } from "@/utils/types";

interface SimulationResultsProps {
  schedule: PaymentType[];
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
  resaleMonth: number;
  bestResaleInfo: {
    // Novas estratégias estruturadas
    rapidResale?: {
      month: number;
      profit: number;
      profitPercentage: number;
      investmentValue: number;
      propertyValue: number;
      remainingBalance: number;
      perfil: string;
      score: number;
    } | null;
    balancedResale?: {
      month: number;
      profit: number;
      profitPercentage: number;
      investmentValue: number;
      propertyValue: number;
      remainingBalance: number;
      perfil: string;
      score: number;
    } | null;
    maximumResale?: {
      month: number;
      profit: number;
      profitPercentage: number;
      investmentValue: number;
      propertyValue: number;
      remainingBalance: number;
      perfil: string;
      score: number;
    } | null;
    
    // Dados legados (mantidos para compatibilidade)
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
  };
  simulationData?: SavedSimulation;
  rentalPercentage: number;
  rentalEstimate: number;
  annualRentalReturn: number;
  appreciationIndex?: number;
  formData?: SimulationFormData;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  schedule,
  investmentValue,
  propertyValue,
  profit,
  profitPercentage,
  remainingBalance,
  resaleMonth,
  bestResaleInfo,
  simulationData,
  rentalPercentage,
  rentalEstimate,
  annualRentalReturn,
  appreciationIndex,
  formData
}) => {
  // Estados para os checkboxes dos custos
  const [includeCommission, setIncludeCommission] = useState(true);
  const [includeIRPF, setIncludeIRPF] = useState(true);

  // Handler functions for exports
  const handleExportPDF = () => {
    if (simulationData) {
      generatePDF(simulationData);
    } else if (formData) {
      // Create a temporary SavedSimulation object for PDF generation
      const tempSimulation: SavedSimulation = {
        id: 'temp',
        name: 'Simulação Atual',
        timestamp: Date.now(),
        formData,
        schedule,
        results: {
          investmentValue,
          propertyValue,
          profit,
          profitPercentage,
          remainingBalance,
          rentalEstimate,
          annualRentalReturn
        },
        bestResaleInfo,
        appreciationIndex
      };
      generatePDF(tempSimulation);
    }
  };

  const handleExportScheduleCSV = () => {
    exportScheduleToCSV(schedule, `cronograma-pagamentos-mes-${resaleMonth}`);
  };

  const handleExportScheduleExcel = () => {
    exportScheduleToExcel(schedule, `cronograma-pagamentos-mes-${resaleMonth}`);
  };

  const handleExportSchedulePDF = () => {
    exportScheduleToPDF(schedule, `cronograma-pagamentos-mes-${resaleMonth}`);
  };

  // Cálculos dos custos
  const saleValue = propertyValue;
  const totalInvested = investmentValue;
  const grossProfit = profit;
  const commissionRate = 0.05; // 5%
  const irpfRate = 0.15; // 15%
  
  const commissionValue = includeCommission ? saleValue * commissionRate : 0;
  const irpfValue = includeIRPF ? Math.max(0, grossProfit * irpfRate) : 0;
  const netProfitAfterCosts = grossProfit - commissionValue - irpfValue;

  // Helper function to get property value at specific month
  const getPropertyValueAtMonth = (month: number) => {
    const payment = schedule.find(p => p.month === month);
    return payment?.propertyValue || 0;
  };

  // Get the property value at delivery (last month in the schedule)
  const deliveryPropertyValue = schedule.length > 0 ? schedule[schedule.length - 1].propertyValue : propertyValue;
  
  // Calculate the correct rental estimate based on delivery property value
  const correctRentalCalculation = calculateRentalEstimate(deliveryPropertyValue, rentalPercentage);
  const correctedRentalEstimate = correctRentalCalculation.rentalEstimate;
  const correctedAnnualRentalReturn = correctRentalCalculation.annualRentalReturn;

  // Get the appreciation index from multiple sources (prop, simulationData, or default)
  console.log('SimulationData:', simulationData);
  console.log('FormData:', simulationData?.formData);
  console.log('AppreciationIndex from simulationData:', simulationData?.formData?.appreciationIndex);
  console.log('AppreciationIndex from prop:', appreciationIndex);
  
  const monthlyAppreciationIndex = appreciationIndex || simulationData?.formData?.appreciationIndex || 0;
  const annualPropertyAppreciation = calculateAnnualAppreciation(monthlyAppreciationIndex);
  const totalAnnualReturn = correctedAnnualRentalReturn + annualPropertyAppreciation;

  console.log('Final Monthly Appreciation Index:', monthlyAppreciationIndex);
  console.log('Final Annual Property Appreciation:', annualPropertyAppreciation);
  console.log('Delivery Property Value:', deliveryPropertyValue);
  console.log('Corrected Rental Estimate:', correctedRentalEstimate);

  return (
    <div className="space-y-6">
      {/* Profit Card */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resultado da Revenda - Mês {resaleMonth}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Mês de referência:</strong> {resaleMonth} | 
              <strong> Fórmula aplicada:</strong> Lucro = Valor de venda - Valores pagos - Saldo devedor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Valor investido (pago até o mês {resaleMonth})</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(investmentValue)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Valor do imóvel (revenda mês {resaleMonth})</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(propertyValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Saldo devedor (mês {resaleMonth})</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(remainingBalance)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Lucro líquido obtido</p>
              <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(profit)}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-slate-600 mb-1">Lucratividade sobre valor investido</p>
            <p className={`text-2xl font-bold ${profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercentage(profitPercentage)}
            </p>
          </div>

          {remainingBalance > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atenção:</strong> ainda há um saldo devedor de{" "}
                {formatCurrency(remainingBalance)} no mês {resaleMonth}.
                Este valor foi descontado do cálculo de lucro.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleExportPDF} 
              variant="secondary"
              className="gap-2"
              disabled={!formData && !simulationData}
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Venda com Custos */}
      <TooltipProvider>
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Resumo da Venda com Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Opções de custos */}
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h4 className="text-sm font-medium text-slate-800 mb-3">Custos a considerar:</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeCommission"
                    checked={includeCommission}
                    onCheckedChange={(checked) => setIncludeCommission(checked as boolean)}
                  />
                  <label htmlFor="includeCommission" className="text-sm text-slate-700">
                    Comissão de corretagem (5%)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeIRPF"
                    checked={includeIRPF}
                    onCheckedChange={(checked) => setIncludeIRPF(checked as boolean)}
                  />
                  <label htmlFor="includeIRPF" className="text-sm text-slate-700">
                    IRPF sobre lucro (15%)
                  </label>
                </div>
              </div>
            </div>

            {/* Cálculos detalhados */}
            <div className="space-y-4">
              {/* Valor de Venda Previsto */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">1. Valor de Venda Previsto</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Valor que o investidor definiu como preço de revenda do imóvel</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-lg font-bold text-slate-800">
                  {formatCurrency(saleValue)}
                </span>
              </div>

              {/* Total Investido */}
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">2. Total Investido até a Revenda</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Soma de todas as parcelas pagas até a data da revenda</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(totalInvested)}
                </span>
              </div>

              {/* Lucro Bruto */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-green-800 font-medium">3. Lucro Bruto</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-green-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>(Valor de Venda) - (Total Investido até a revenda)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(grossProfit)}
                </span>
              </div>

              {/* Custos deduzidos */}
              <div className="bg-slate-50 p-4 rounded-lg border space-y-3">
                <h4 className="text-sm font-medium text-slate-800">Custos deduzidos:</h4>
                
                {/* Comissão */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      {includeCommission ? '– ' : ''}Comissão de Corretagem (5%)
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>5% sobre o valor de venda (R$ {formatCurrency(saleValue * commissionRate).replace('R$ ', '')})</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className={`text-sm font-medium ${includeCommission ? 'text-red-600' : 'text-slate-400'}`}>
                    {includeCommission ? formatCurrency(commissionValue) : 'Não aplicado'}
                  </span>
                </div>

                {/* IRPF */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">
                      {includeIRPF ? '– ' : ''}IRPF (15% sobre Lucro)
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>15% sobre o lucro bruto (R$ {formatCurrency(Math.max(0, grossProfit * irpfRate)).replace('R$ ', '')})</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <span className={`text-sm font-medium ${includeIRPF && grossProfit > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                    {includeIRPF && grossProfit > 0 ? formatCurrency(irpfValue) : 'Não aplicado'}
                  </span>
                </div>
              </div>

              {/* Lucro Líquido Final */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-blue-800">= Lucro Líquido após Custos</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-blue-600" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>(Lucro Bruto) - (Comissão) - (IRPF)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <span className={`text-2xl font-bold ${netProfitAfterCosts >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {formatCurrency(netProfitAfterCosts)}
                </span>
              </div>

              {/* Comparação com lucro bruto */}
              {(includeCommission || includeIRPF) && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-amber-800">
                      <strong>Impacto dos custos:</strong> Redução de {formatCurrency(grossProfit - netProfitAfterCosts)} no lucro 
                      ({formatPercentage(grossProfit > 0 ? ((grossProfit - netProfitAfterCosts) / grossProfit) * 100 : 0)} do lucro bruto)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Novas Estratégias de Revenda Estruturadas */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            🎯 Estratégias de Revenda Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Algoritmo inteligente:</strong> Baseado na valorização mensal configurada e análise de risco/retorno para diferentes perfis de investidor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Revenda Rápida */}
            {bestResaleInfo.rapidResale && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                  <div>
                    <h3 className="font-bold text-green-800 text-lg">Revenda Rápida</h3>
                    <p className="text-sm text-green-600">Perfil Conservador</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Prazo ideal</span>
                      <span className="font-bold text-green-600">{bestResaleInfo.rapidResale.month} meses</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">ROI</span>
                      <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.rapidResale.profitPercentage)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Lucro estimado</span>
                      <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.rapidResale.profit)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Investimento</span>
                      <span className="font-medium text-slate-800">{formatCurrency(bestResaleInfo.rapidResale.investmentValue)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-100 rounded border border-green-200">
                  <p className="text-xs text-green-800">
                    <strong>Ideal para:</strong> Investidores que priorizam liquidez e segurança, com foco em retorno rápido e menor exposição ao risco de mercado.
                  </p>
                </div>
              </div>
            )}

            {/* Revenda Equilibrada */}
            {bestResaleInfo.balancedResale && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-blue-800 text-lg">Revenda Equilibrada</h3>
                    <p className="text-sm text-blue-600">Perfil Moderado</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Prazo ideal</span>
                      <span className="font-bold text-blue-600">{bestResaleInfo.balancedResale.month} meses</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">ROI</span>
                      <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.balancedResale.profitPercentage)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Lucro estimado</span>
                      <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.balancedResale.profit)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Investimento</span>
                      <span className="font-medium text-slate-800">{formatCurrency(bestResaleInfo.balancedResale.investmentValue)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-200">
                  <p className="text-xs text-blue-800">
                    <strong>Ideal para:</strong> Investidores que buscam equilíbrio entre risco e retorno, com prazo médio e boa rentabilidade sem exposição excessiva.
                  </p>
                </div>
              </div>
            )}

            {/* Revenda Máxima */}
            {bestResaleInfo.maximumResale && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-purple-800 text-lg">Revenda Máxima</h3>
                    <p className="text-sm text-purple-600">Perfil Arrojado</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Prazo ideal</span>
                      <span className="font-bold text-purple-600">{bestResaleInfo.maximumResale.month} meses</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">ROI</span>
                      <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.maximumResale.profitPercentage)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Lucro estimado</span>
                      <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.maximumResale.profit)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Investimento</span>
                      <span className="font-medium text-slate-800">{formatCurrency(bestResaleInfo.maximumResale.investmentValue)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-purple-100 rounded border border-purple-200">
                  <p className="text-xs text-purple-800">
                    <strong>Ideal para:</strong> Investidores com maior tolerância ao risco e prazo, focados no máximo retorno absoluto do investimento.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumo comparativo */}
          <div className="bg-slate-50 p-4 rounded-lg border">
            <h4 className="font-semibold text-slate-800 mb-3">📊 Resumo Comparativo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              {bestResaleInfo.rapidResale && (
                <div>
                  <span className="font-medium text-green-600">Rápida:</span>
                  <span className="ml-2">{bestResaleInfo.rapidResale.month}m → {formatPercentage(bestResaleInfo.rapidResale.profitPercentage)}</span>
                </div>
              )}
              {bestResaleInfo.balancedResale && (
                <div>
                  <span className="font-medium text-blue-600">Equilibrada:</span>
                  <span className="ml-2">{bestResaleInfo.balancedResale.month}m → {formatPercentage(bestResaleInfo.balancedResale.profitPercentage)}</span>
                </div>
              )}
              {bestResaleInfo.maximumResale && (
                <div>
                  <span className="font-medium text-purple-600">Máxima:</span>
                  <span className="ml-2">{bestResaleInfo.maximumResale.month}m → {formatPercentage(bestResaleInfo.maximumResale.profitPercentage)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financing Simulation */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Simulação de Financiamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FinancingSimulator keysValue={schedule.find(p => p.description === "Chaves")?.amount || 0} />
        </CardContent>
      </Card>

      {/* Estimativa de Aluguel */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Estimativa de Aluguel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Base de cálculo:</strong> Valor do imóvel na entrega (mês {schedule.length > 0 ? schedule[schedule.length - 1].month : 'N/A'}) - {formatCurrency(deliveryPropertyValue)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Aluguel mensal estimado</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(correctedRentalEstimate)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {formatPercentage(rentalPercentage)} do valor na entrega
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Retorno anual do aluguel</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(correctedAnnualRentalReturn)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Valorização anual do imóvel</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(annualPropertyAppreciation)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Baseado em {formatPercentage(monthlyAppreciationIndex)} mensal
              </p>
              {monthlyAppreciationIndex === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ Índice de valorização não informado
                </p>
              )}
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Retorno total anual (aluguel + valorização)</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(totalAnnualReturn)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma de Pagamentos */}
      <Card className="shadow">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Cronograma de Pagamentos
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={handleExportScheduleCSV}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button
                onClick={handleExportScheduleExcel}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleExportSchedulePDF}
                variant="outline"
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <table className="w-full text-xs border-collapse">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[12%]">
                    Data
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[15%]">
                    Tipo
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[13%]">
                    Valor
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[13%]">
                    Reforço
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[13%]">
                    Saldo
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider border-r w-[13%]">
                    Total Pago
                  </th>
                  <th className="px-1 py-2 text-left font-medium text-slate-500 uppercase tracking-wider w-[21%]">
                    Valor do Imóvel
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {schedule.map((payment, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    <td className="px-1 py-2 border-r">
                      <div className="truncate">
                        {payment.date ? formatDateForDisplay(payment.date) : "-"}
                      </div>
                    </td>
                    <td className="px-1 py-2 border-r">
                      <div className="truncate" title={payment.description}>
                        {payment.description}
                      </div>
                    </td>
                    <td className="px-1 py-2 border-r text-right">
                      <div className="truncate">
                        {formatCurrency(payment.amount)}
                      </div>
                    </td>
                    <td className="px-1 py-2 border-r text-right">
                      <div className="truncate">
                        {formatCurrency(payment.reinforcementValue || 0)}
                      </div>
                    </td>
                    <td className="px-1 py-2 border-r text-right">
                      <div className="truncate">
                        {formatCurrency(payment.balance)}
                      </div>
                    </td>
                    <td className="px-1 py-2 border-r text-right">
                      <div className="truncate">
                        {formatCurrency(payment.totalPaid)}
                      </div>
                    </td>
                    <td className="px-1 py-2 text-right">
                      <div className="truncate">
                        {formatCurrency(payment.propertyValue)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Valorização */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Gráfico de Valorização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsChart schedule={schedule} resaleMonth={resaleMonth} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationResults;
