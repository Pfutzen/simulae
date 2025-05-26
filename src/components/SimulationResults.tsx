
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, Home, Download, Info } from "lucide-react";
import { PaymentType } from "@/utils/types";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { isRetroactiveDate } from "@/utils/correctionData";
import ResultsChart from "./ResultsChart";

interface SimulationResultsProps {
  schedule: PaymentType[];
  resaleMonth: number;
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
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
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  schedule,
  resaleMonth,
  investmentValue,
  propertyValue,
  profit,
  profitPercentage,
  remainingBalance,
  bestResaleInfo,
  simulationData,
  rentalPercentage,
  rentalEstimate,
  annualRentalReturn,
  appreciationIndex,
}) => {
  const handleExportPDF = async () => {
    try {
      const { exportToPdf } = await import("@/utils/pdfExport");
      
      if (!simulationData) {
        console.error("Dados da simulação não encontrados");
        return;
      }
      
      exportToPdf(simulationData);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    }
  };

  // Verificar se é uma simulação retroativa
  const isRetroactive = schedule.length > 0 && isRetroactiveDate(schedule[0].date);

  const profitColor = profit >= 0 ? "text-green-600" : "text-red-600";
  const profitIcon = profit >= 0 ? TrendingUp : TrendingDown;
  const ProfitIcon = profitIcon;

  return (
    <div className="space-y-6">
      {/* Alerta para simulações retroativas */}
      {isRetroactive && (
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Simulação Retroativa:</strong> Cálculo baseado na valorização real do CUB SC no período selecionado.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Resultados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-700">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(investmentValue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-700">Valor do Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {formatCurrency(propertyValue)}
            </div>
            <p className="text-sm text-slate-600 mt-1">
              No mês {resaleMonth}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-slate-700 flex items-center gap-2">
              <ProfitIcon className="h-5 w-5" />
              Lucro na Revenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitColor}`}>
              {formatCurrency(profit)}
            </div>
            <Badge 
              variant={profit >= 0 ? "default" : "destructive"}
              className="mt-2"
            >
              {formatPercentage(profitPercentage / 100)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Aluguel */}
      {rentalPercentage > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-purple-600" />
              Estimativa de Aluguel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Aluguel Mensal Estimado</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(rentalEstimate)}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Rentabilidade Anual</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatPercentage(annualRentalReturn / 100)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Melhores Meses para Revenda */}
      <Card>
        <CardHeader>
          <CardTitle>Melhores Meses para Revenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestResaleInfo.bestProfitMonth > 0 && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Maior Lucro</h4>
                <p className="text-sm text-green-700">
                  Mês {bestResaleInfo.bestProfitMonth}
                </p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(bestResaleInfo.maxProfit)}
                </p>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {formatPercentage(bestResaleInfo.maxProfitPercentage / 100)}
                </Badge>
              </div>
            )}
            
            {bestResaleInfo.bestRoiMonth > 0 && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800">Maior ROI</h4>
                <p className="text-sm text-blue-700">
                  Mês {bestResaleInfo.bestRoiMonth}
                </p>
                <p className="text-lg font-bold text-blue-900">
                  {formatCurrency(bestResaleInfo.maxRoiProfit)}
                </p>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  {formatPercentage(bestResaleInfo.maxRoi / 100)}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Resultados */}
      <ResultsChart 
        schedule={schedule}
        resaleMonth={resaleMonth}
      />

      {/* Botão de Exportar PDF */}
      {simulationData && (
        <div className="flex justify-center">
          <Button 
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      )}
    </div>
  );
};

export default SimulationResults;
