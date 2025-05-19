
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentType, formatCurrency, formatPercentage } from "@/utils/calculationUtils";
import ResultsChart from "./ResultsChart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface SimulationResultsProps {
  schedule: PaymentType[];
  resaleMonth: number;
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
}

const SimulationResults: React.FC<SimulationResultsProps> = ({
  schedule,
  resaleMonth,
  investmentValue,
  propertyValue,
  profit,
  profitPercentage,
  remainingBalance
}) => {
  const resaleData = schedule.find(item => item.month === resaleMonth);

  if (schedule.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mt-8">Resultado da Simulação</h2>
      
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
                      <TableRow key={payment.month} className={payment.month === resaleMonth ? "bg-simulae-50" : ""}>
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
