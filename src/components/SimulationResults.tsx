import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, DollarSign, FileText, Home } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { PaymentType } from "@/utils/types";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { useToast } from "@/hooks/use-toast";
import ResultsChart from "./ResultsChart";

interface SimulationResultsProps {
  schedule: PaymentType[];
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
  simulationData: SavedSimulation | undefined;
  rentalPercentage: number;
  rentalEstimate: number;
  annualRentalReturn: number;
  appreciationIndex: number;
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  schedule,
  resaleMonth,
  bestResaleInfo,
  simulationData,
  rentalPercentage,
  rentalEstimate,
  annualRentalReturn,
  appreciationIndex,
  investmentValue,
  propertyValue,
  profit,
  profitPercentage,
  remainingBalance
}) => {
  const { toast } = useToast();

  const handleExportPDF = () => {
    if (!simulationData) {
      toast({
        title: "Erro ao exportar",
        description: "Dados da simulação não encontrados. Salve a simulação primeiro.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Import the PDF export function dynamically
      import('@/utils/pdfExport').then(({ exportToPdf }) => {
        exportToPdf(simulationData);
        toast({
          title: "PDF exportado",
          description: "O relatório foi baixado com sucesso.",
        });
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar",
        description: "Ocorreu um erro ao gerar o PDF.",
        variant: "destructive"
      });
    }
  };

  const resalePropertyValue = schedule.length > 0 ? schedule[resaleMonth - 1].propertyValue : propertyValue;
  const totalPaid = schedule.reduce((sum, item, index) => {
    if (index < resaleMonth) {
      return sum + item.amount;
    }
    return sum;
  }, 0);
  const remainingToPay = schedule.reduce((sum, item, index) => {
    if (index >= resaleMonth) {
      return sum + item.amount;
    }
    return sum;
  }, 0);

  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-green-700 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Resultados da Simulação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export button at the top */}
        <div className="flex justify-end">
          <Button
            onClick={handleExportPDF}
            className="bg-red-600 hover:bg-red-700 text-white gap-2"
            disabled={!simulationData}
          >
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-simulae-500" />
              <h4 className="text-lg font-semibold">Investimento Total</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(investmentValue)}</p>
            <p className="text-sm text-gray-500">Valor total investido ao longo do período.</p>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5 text-green-500" />
              <h4 className="text-lg font-semibold">Valor do Imóvel (Revenda)</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(resalePropertyValue)}</p>
            <p className="text-sm text-gray-500">Valor estimado do imóvel no mês {resaleMonth}, considerando a valorização de {appreciationIndex}% ao mês.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h4 className="text-lg font-semibold">Lucro Bruto (Revenda)</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(profit)}</p>
            <p className="text-sm text-gray-500">Lucro estimado na revenda, descontando o valor investido.</p>
            <Badge className="mt-2">Rentabilidade: {formatPercentage(profitPercentage/100)}</Badge>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <h4 className="text-lg font-semibold">Saldo Devedor (Revenda)</h4>
            </div>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(remainingBalance)}</p>
            <p className="text-sm text-gray-500">Valor restante a ser pago caso não ocorra a revenda.</p>
          </div>
        </div>

        {rentalEstimate > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-teal-500" />
                <h4 className="text-lg font-semibold">Aluguel Mensal Estimado</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(rentalEstimate)}</p>
              <p className="text-sm text-gray-500">Valor estimado do aluguel mensal.</p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <h4 className="text-lg font-semibold">Retorno Anual Estimado (Aluguel)</h4>
              </div>
              <p className="text-2xl font-bold text-gray-800">{formatCurrency(rentalEstimate * 12)}</p>
              <Badge className="mt-2">Rentabilidade: {formatPercentage(annualRentalReturn/100)}</Badge>
              <p className="text-sm text-gray-500">Retorno anual considerando o valor do aluguel.</p>
            </div>
          </div>
        )}

        {bestResaleInfo && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Melhores Meses para Revenda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bestResaleInfo.bestProfitMonth > 0 && (
                <div>
                  <h4 className="text-lg font-semibold">Maior Lucro</h4>
                  <p>Mês: {bestResaleInfo.bestProfitMonth}</p>
                  <p>Lucro: {formatCurrency(bestResaleInfo.maxProfit)}</p>
                  <Badge>Rentabilidade: {formatPercentage(bestResaleInfo.maxProfitPercentage/100)}</Badge>
                </div>
              )}

              {bestResaleInfo.bestRoiMonth > 0 && (
                <div>
                  <h4 className="text-lg font-semibold">Maior ROI</h4>
                  <p>Mês: {bestResaleInfo.bestRoiMonth}</p>
                  <p>Lucro: {formatCurrency(bestResaleInfo.maxRoiProfit)}</p>
                  <Badge>ROI: {formatPercentage(bestResaleInfo.maxRoi/100)}</Badge>
                </div>
              )}

              {bestResaleInfo.earlyMonth && bestResaleInfo.earlyProfit && bestResaleInfo.earlyProfitPercentage && (
                <div>
                  <h4 className="text-lg font-semibold">Revenda Mais Cedo</h4>
                  <p>Mês: {bestResaleInfo.earlyMonth}</p>
                  <p>Lucro: {formatCurrency(bestResaleInfo.earlyProfit)}</p>
                  <Badge>Rentabilidade: {formatPercentage(bestResaleInfo.earlyProfitPercentage/100)}</Badge>
                </div>
              )}
            </div>
          </div>
        )}

        <ResultsChart schedule={schedule} resaleMonth={resaleMonth} />
      </CardContent>
    </Card>
  );
};

export default SimulationResults;
