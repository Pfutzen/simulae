import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Target, 
  Home,
  Download,
  AlertCircle,
  CheckCircle,
  FileText,
  Percent,
  CreditCard,
  Building,
  FileSpreadsheet
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { formatDateForDisplay } from "@/utils/dateUtils";
import { PaymentType } from "@/utils/calculationUtils";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { generatePDF } from "@/utils/pdfExport";
import { calculateAnnualAppreciation, calculateRentalEstimate } from "@/utils/calculationHelpers";
import ResultsChart from "./ResultsChart";
import FinancingSimulator from "./FinancingSimulator";
import { exportScheduleToCSV, exportScheduleToExcel, exportScheduleToPDF } from "@/utils/scheduleExport";

interface SimulationResultsProps {
  schedule: PaymentType[];
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
  resaleMonth: number;
  bestResaleInfo: {
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
  appreciationIndex?: number; // Add this prop to directly receive the appreciation index
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
  appreciationIndex
}) => {
  const handleExportPDF = () => {
    if (simulationData) {
      generatePDF(simulationData);
    }
  };

  const handleExportScheduleCSV = () => {
    const fileName = simulationData?.name 
      ? `cronograma-${simulationData.name.toLowerCase().replace(/\s+/g, '-')}`
      : 'cronograma-pagamentos';
    exportScheduleToCSV(schedule, fileName);
  };

  const handleExportScheduleExcel = () => {
    const fileName = simulationData?.name 
      ? `cronograma-${simulationData.name.toLowerCase().replace(/\s+/g, '-')}`
      : 'cronograma-pagamentos';
    exportScheduleToExcel(schedule, fileName);
  };

  const handleExportSchedulePDF = () => {
    const fileName = simulationData?.name 
      ? `cronograma-${simulationData.name.toLowerCase().replace(/\s+/g, '-')}`
      : 'cronograma-pagamentos';
    exportScheduleToPDF(schedule, fileName);
  };

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
              disabled={!simulationData}
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Melhores Estratégias de Revenda */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            💼 Melhores Estratégias de Revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Maior Valor de Lucro Absoluto */}
            <div className="bg-white p-5 rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🥇</span>
                <h3 className="font-semibold text-slate-800">Maior Valor de Lucro Absoluto</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Prazo:</span>
                  <span className="font-bold text-orange-600">{bestResaleInfo.bestProfitMonth} meses</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Lucro bruto:</span>
                  <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.maxProfit)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Rentabilidade:</span>
                  <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.maxProfitPercentage)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Valor pago até aqui:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(bestResaleInfo.maxProfitTotalPaid)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Valor de revenda:</span>
                  <span className="font-bold text-green-600">{formatCurrency(getPropertyValueAtMonth(bestResaleInfo.bestProfitMonth))}</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Representa o maior valor bruto de lucro alcançado ao longo da simulação. Ideal para quem busca lucro máximo, mesmo que leve mais tempo.
                </p>
              </div>
            </div>

            {/* Maior Percentual de Rentabilidade */}
            <div className="bg-white p-5 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">📊</span>
                <h3 className="font-semibold text-slate-800">Maior Percentual de Rentabilidade</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Prazo:</span>
                  <span className="font-bold text-blue-600">{bestResaleInfo.bestRoiMonth} meses</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Lucro bruto:</span>
                  <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.maxRoiProfit)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Rentabilidade:</span>
                  <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.maxRoi)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Valor pago até aqui:</span>
                  <span className="font-bold text-slate-800">{formatCurrency(bestResaleInfo.maxRoiTotalPaid)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-600">Valor de revenda:</span>
                  <span className="font-bold text-green-600">{formatCurrency(getPropertyValueAtMonth(bestResaleInfo.bestRoiMonth))}</span>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Reflete o melhor retorno proporcional (lucro dividido pelo tempo e investimento). Indicado para quem quer otimizar o rendimento do capital investido.
                </p>
              </div>
            </div>

            {/* Maior Lucro no Menor Prazo */}
            {bestResaleInfo.earlyMonth && bestResaleInfo.earlyProfit && bestResaleInfo.earlyProfitPercentage && bestResaleInfo.earlyTotalPaid && (
              <div className="bg-white p-5 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">⚡</span>
                  <h3 className="font-semibold text-slate-800">Maior Lucro no Menor Prazo</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Prazo:</span>
                    <span className="font-bold text-purple-600">{bestResaleInfo.earlyMonth} meses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Lucro bruto:</span>
                    <span className="font-bold text-green-600">{formatCurrency(bestResaleInfo.earlyProfit)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Rentabilidade:</span>
                    <span className="font-bold text-blue-600">{formatPercentage(bestResaleInfo.earlyProfitPercentage)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Valor pago até aqui:</span>
                    <span className="font-bold text-slate-800">{formatCurrency(bestResaleInfo.earlyTotalPaid)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-600">Valor de revenda:</span>
                    <span className="font-bold text-green-600">{formatCurrency(getPropertyValueAtMonth(bestResaleInfo.earlyMonth))}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3">
                    Aponta o melhor lucro possível em prazo reduzido. Excelente para investidores com foco em retorno mais rápido.
                  </p>
                </div>
              </div>
            )}
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Cronograma de Pagamentos
            </CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleExportScheduleCSV}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                CSV
              </Button>
              <Button
                onClick={handleExportScheduleExcel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Excel
              </Button>
              <Button
                onClick={handleExportSchedulePDF}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Data do Pagamento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Saldo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Total Pago
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor Corrigido do Imóvel
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {schedule.map((payment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.date ? formatDateForDisplay(payment.date) : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.balance)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.totalPaid)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.propertyValue)}
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
