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
  CheckCircle
} from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { PaymentType } from "@/utils/calculationUtils";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { generatePDF } from "@/utils/pdfExport";
import ResultsChart from "./ResultsChart";
import FinancingSimulator from "./FinancingSimulator";

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
		bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
  };
  simulationData?: SavedSimulation;
  rentalPercentage: number;
  rentalEstimate: number;
  annualRentalReturn: number;
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
  annualRentalReturn
}) => {
  const handleExportPDF = () => {
    generatePDF(
      schedule,
      investmentValue,
      propertyValue,
      profit,
      profitPercentage,
      remainingBalance,
      resaleMonth,
      bestResaleInfo,
      rentalEstimate,
      annualRentalReturn,
      simulationData?.name || "Simulação"
    );
  };

  return (
    <div className="space-y-6">
      {/* Profit Card */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Resultado da Revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Valor investido</p>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(investmentValue)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Valor do imóvel (revenda)</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(propertyValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Lucro obtido</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(profit)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Lucratividade</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPercentage(profitPercentage)}
              </p>
            </div>
          </div>

          {remainingBalance > 0 && (
            <Alert className="bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Atenção:</strong> ainda há um saldo devedor de{" "}
                {formatCurrency(remainingBalance)} após {resaleMonth} meses.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={handleExportPDF} 
              variant="secondary"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Best Resale Recommendations */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-600" />
            Melhores Meses para Revenda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">
                Mês de maior lucro
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {bestResaleInfo.bestProfitMonth} meses
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Lucro: {formatCurrency(bestResaleInfo.maxProfit)}
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">
                Mês de maior lucratividade
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {bestResaleInfo.bestRoiMonth} meses
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Lucro: {formatCurrency(bestResaleInfo.maxRoiProfit)}
              </p>
            </div>

            {bestResaleInfo.earlyMonth && bestResaleInfo.earlyProfit && bestResaleInfo.earlyProfitPercentage && (
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-slate-600 mb-1">
                  Revenda antecipada (menor prazo)
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {bestResaleInfo.earlyMonth} meses
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Lucro: {formatCurrency(bestResaleInfo.earlyProfit)}
                </p>
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
          <FinancingSimulator keysValue={schedule.find(p => p.type === "chaves")?.value || 0} />
        </CardContent>
      </Card>

      {/* Rental Estimates */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-purple-600" />
            Estimativa de Aluguel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Aluguel mensal estimado</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(rentalEstimate)}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm text-slate-600 mb-1">Retorno anual estimado</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPercentage(annualRentalReturn)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Schedule */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Cronograma de Pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Mês
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Correção
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Valor corrigido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {schedule.map((payment, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatPercentage(payment.correction)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatCurrency(payment.correctedValue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Results Chart */}
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Gráfico de Valorização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsChart schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SimulationResults;
