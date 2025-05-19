
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentType, formatCurrency, formatPercentage } from "@/utils/calculationUtils";
import ResultsChart from "./ResultsChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LightbulbIcon } from "lucide-react";

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
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
  };
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  schedule,
  resaleMonth,
  investmentValue,
  propertyValue,
  profit,
  profitPercentage,
  remainingBalance,
  bestResaleInfo
}) => {
  const resaleData = schedule.find(item => item.month === resaleMonth);

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mt-8">Resultado da Simulação</h2>
      
      {(bestResaleInfo.bestProfitMonth > 0 || bestResaleInfo.bestRoiMonth > 0) && (
        <Card className="border-l-4 border-l-yellow-400 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <LightbulbIcon className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
              <div className="w-full">
                <h3 className="text-lg font-semibold text-slate-800">Melhores meses para revenda:</h3>
                <div className="mt-2 grid gap-y-4">
                  {bestResaleInfo.bestProfitMonth > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="px-3 py-1 bg-simulae-100 text-simulae-800 font-medium rounded-lg text-center whitespace-nowrap">
                        💰 Maior lucro
                      </div>
                      <div>
                        <span className="font-medium text-lg text-simulae-800">
                          Mês {bestResaleInfo.bestProfitMonth}: {formatCurrency(bestResaleInfo.maxProfit)}
                        </span>
                        <span className="text-slate-600 block sm:inline sm:ml-2">
                          (retorno de {formatPercentage(bestResaleInfo.maxProfitPercentage)})
                        </span>
                      </div>
                    </div>
                  )}

                  {bestResaleInfo.bestRoiMonth > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="px-3 py-1 bg-blue-100 text-blue-800 font-medium rounded-lg text-center whitespace-nowrap">
                        📈 Maior ROI
                      </div>
                      <div>
                        <span className="font-medium text-lg text-blue-800">
                          Mês {bestResaleInfo.bestRoiMonth}: {formatCurrency(bestResaleInfo.maxRoiProfit)}
                        </span>
                        <span className="text-slate-600 block sm:inline sm:ml-2">
                          (retorno de {formatPercentage(bestResaleInfo.maxRoi)})
                        </span>
                      </div>
                    </div>
                  )}

                  {bestResaleInfo.earlyMonth && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="px-3 py-1 bg-green-100 text-green-800 font-medium rounded-lg text-center whitespace-nowrap">
                        🕒 Mais cedo
                      </div>
                      <div>
                        <span className="font-medium text-green-800">
                          Mês {bestResaleInfo.earlyMonth}: {formatCurrency(bestResaleInfo.earlyProfit || 0)}
                        </span>
                        <span className="text-slate-600 block sm:inline sm:ml-2">
                          (retorno de {formatPercentage(bestResaleInfo.earlyProfitPercentage || 0)})
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Investido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-simulae-700">
              {formatCurrency(investmentValue)}
            </p>
            <p className="text-sm text-muted-foreground">
              Até o mês {resaleMonth}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Valor do Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-simulae-700">
              {formatCurrency(propertyValue)}
            </p>
            <p className="text-sm text-muted-foreground">
              No mês {resaleMonth}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Saldo Devedor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-simulae-700">
              {formatCurrency(remainingBalance)}
            </p>
            <p className="text-sm text-muted-foreground">
              No mês {resaleMonth}
            </p>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Lucro na Revenda</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-simulae-700">
              {formatCurrency(profit)}
            </p>
            <p className="text-sm text-muted-foreground">
              {formatPercentage(profitPercentage)} de retorno
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chart" className="w-full">
        <TabsList>
          <TabsTrigger value="chart">Gráfico</TabsTrigger>
          <TabsTrigger value="table">Cronograma</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chart" className="mt-6">
          <Card className="card-shadow">
            <CardHeader>
              <CardTitle>Evolução do Investimento</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResultsChart schedule={schedule} resaleMonth={resaleMonth} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="table" className="mt-6">
          <Card className="card-shadow overflow-hidden">
            <CardHeader>
              <CardTitle>Cronograma de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead className="text-right">Saldo Devedor</TableHead>
                      <TableHead className="text-right">Total Pago</TableHead>
                      <TableHead className="text-right">Valor do Imóvel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule.map((payment) => (
                      <TableRow key={payment.month} className={
                        payment.month === bestResaleInfo.bestProfitMonth 
                          ? "bg-simulae-50" 
                          : payment.month === bestResaleInfo.bestRoiMonth 
                            ? "bg-blue-50"
                            : payment.month === bestResaleInfo.earlyMonth
                              ? "bg-green-50"
                              : payment.month === resaleMonth
                                ? "bg-amber-50"
                                : ""
                      }>
                        <TableCell>{payment.month}</TableCell>
                        <TableCell>{payment.description}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.balance)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.totalPaid)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(payment.propertyValue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationResults;
