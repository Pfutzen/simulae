import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/utils/calculationUtils";
import { PaymentType, SimulationFormData } from "@/utils/types";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { exportToPdf } from "@/utils/pdfExport";
import { exportScheduleToPDF, exportScheduleToCSV, exportScheduleToExcel } from "@/utils/scheduleExport";
import { FileText, Download, TrendingUp, DollarSign, Calendar, Home } from "lucide-react";
import ResultsChart from "./ResultsChart";

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
  appreciationIndex: number;
  formData: SimulationFormData;
  simulationName: string; // New prop for simulation name
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
  formData,
  simulationName
}) => {
  const handleExportPDF = () => {
    if (!simulationName.trim()) {
      alert("Por favor, insira um nome para a simulação antes de exportar o PDF.");
      return;
    }

    // Create a simulation object for export
    const simulationForExport: SavedSimulation = simulationData || {
      id: Date.now().toString(),
      name: simulationName,
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

    exportToPdf(simulationForExport);
  };

  const handleExportSchedulePDF = () => {
    const fileName = simulationName.trim() 
      ? `cronograma-${simulationName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
      : 'cronograma-pagamentos';
    exportScheduleToPDF(schedule, fileName);
  };

  const handleExportScheduleCSV = () => {
    const fileName = simulationName.trim() 
      ? `cronograma-${simulationName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
      : 'cronograma-pagamentos';
    exportScheduleToCSV(schedule, fileName);
  };

  const handleExportScheduleExcel = () => {
    const fileName = simulationName.trim() 
      ? `cronograma-${simulationName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`
      : 'cronograma-pagamentos';
    exportScheduleToExcel(schedule, fileName);
  };

  // Calculate delivery date
  let deliveryDate: Date | null = null;
  if (formData.startDate) {
    deliveryDate = new Date(formData.startDate);
    deliveryDate.setMonth(deliveryDate.getMonth() + formData.installmentsCount + 1);
  }

  return (
    <div className="space-y-6">
      {/* Results Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Total Investido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(investmentValue)}</div>
            <Separator className="my-2" />
            <Badge variant="secondary">Inclui entrada, parcelas e reforços</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-blue-600" />
              Valor do Imóvel na Revenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(propertyValue)}</div>
            <Separator className="my-2" />
            <Badge variant="secondary">Valor corrigido + valorização</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-600" />
              Saldo Devedor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(remainingBalance)}</div>
            <Separator className="my-2" />
            <Badge variant="secondary">Valor a ser pago na revenda</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Lucro na Revenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(profit)}</div>
            <Separator className="my-2" />
            <div className="text-sm text-muted-foreground">
              {formatPercentage(profitPercentage/100)} de lucro sobre o total investido
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Evolução do Investimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResultsChart 
            schedule={schedule} 
            resaleMonth={resaleMonth}
            bestResaleInfo={bestResaleInfo}
          />
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-600" />
            Exportar Resultados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={handleExportPDF}
                disabled={!simulationName.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar Relatório PDF
                {!simulationName.trim() && <span className="ml-2 text-xs">(Nome obrigatório)</span>}
              </Button>
              
              <Button 
                onClick={handleExportSchedulePDF}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                Cronograma PDF
              </Button>
              
              <Button 
                onClick={handleExportScheduleCSV}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Cronograma CSV
              </Button>
              
              <Button 
                onClick={handleExportScheduleExcel}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Cronograma Excel
              </Button>
            </div>
            
            {!simulationName.trim() && (
              <p className="text-sm text-amber-600">
                ⚠️ Insira um nome para a simulação no topo da página para habilitar a exportação do relatório PDF.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {bestResaleInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Melhores Meses para Revenda
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestResaleInfo.bestProfitMonth > 0 && (
              <p>
                Maior lucro: Mês {bestResaleInfo.bestProfitMonth} -{" "}
                {formatCurrency(bestResaleInfo.maxProfit)} (
                {formatPercentage(bestResaleInfo.maxProfitPercentage / 100)})
              </p>
            )}
            {bestResaleInfo.bestRoiMonth > 0 && (
              <p>
                Maior ROI: Mês {bestResaleInfo.bestRoiMonth} -{" "}
                {formatCurrency(bestResaleInfo.maxRoiProfit)} (
                {formatPercentage(bestResaleInfo.maxRoi / 100)})
              </p>
            )}
            {bestResaleInfo.earlyMonth && bestResaleInfo.earlyProfit && bestResaleInfo.earlyProfitPercentage && (
              <p>
                Mais cedo: Mês {bestResaleInfo.earlyMonth} -{" "}
                {formatCurrency(bestResaleInfo.earlyProfit)} (
                {formatPercentage(bestResaleInfo.earlyProfitPercentage / 100)})
              </p>
            )}
            {!bestResaleInfo.bestProfitMonth && !bestResaleInfo.bestRoiMonth && !bestResaleInfo.earlyMonth && (
              <p>Não há dados suficientes para calcular os melhores meses para revenda.</p>
            )}
          </CardContent>
        </Card>
      )}

      {rentalPercentage > 0 && rentalEstimate > 0 && annualRentalReturn > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              Estimativa de Aluguel (Entrega)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              Valor do imóvel (entrega): {formatCurrency(propertyValue)}
            </p>
            <p>
              Percentual para aluguel: {formatPercentage(rentalPercentage / 100)}
            </p>
            <p>
              Aluguel mensal estimado: {formatCurrency(rentalEstimate)}
            </p>
            <p>
              Renda anual: {formatCurrency(rentalEstimate * 12)}
            </p>
            <p>
              Rentabilidade anual: {formatPercentage(annualRentalReturn / 100)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimulationResults;
