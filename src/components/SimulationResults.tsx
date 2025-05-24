
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
  Building
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { formatDateForDisplay } from "@/utils/dateUtils";
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
    if (simulationData) {
      generatePDF(simulationData);
    }
  };

  // Helper function to get property value at specific month
  const getPropertyValueAtMonth = (month: number) => {
    const payment = schedule.find(p => p.month === month);
    return payment?.propertyValue || 0;
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

          <div className="flex justify-between">
            <Link to="/proposta-comercial">
              <Button variant="default" className="gap-2">
                <FileText className="h-4 w-4" />
                Gerar Proposta Comercial
              </Button>
            </Link>
            
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
