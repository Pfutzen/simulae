
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, BarChart, Bar, ResponsiveContainer, Legend } from 'recharts';
import { EstrategiaResultado, ROIEvolution } from '@/types/investment.types';
import { formatCurrency } from '@/utils/formatters';

interface GraficosAnaliseProps {
  estrategias: EstrategiaResultado[];
  evolucaoROI: ROIEvolution[];
}

const GraficosAnalise: React.FC<GraficosAnaliseProps> = ({ estrategias, evolucaoROI }) => {
  if (estrategias.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Configure os parâmetros para ver a análise gráfica</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    roiAnual: {
      label: "ROI Anual"
    },
    roiTotal: {
      label: "ROI Total"
    },
    lucro: {
      label: "Lucro"
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Evolução do ROI no Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={evolucaoROI}>
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string) => [
                  name === 'roiAnual' || name === 'roiTotal' ? `${Number(value).toFixed(1)}%` : formatCurrency(Number(value)),
                  name === 'roiAnual' ? 'ROI Anual' : name === 'roiTotal' ? 'ROI Total' : name
                ]}
              />
              <Line 
                dataKey="roiAnual" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="ROI Anual" 
              />
              <Line 
                dataKey="roiTotal" 
                stroke="#dc2626" 
                strokeWidth={2}
                name="ROI Total" 
              />
              <Legend />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Lucro</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={estrategias}>
                <XAxis dataKey="nome" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Lucro']}
                />
                <Bar dataKey="lucro" fill="#10b981" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparativo de ROI Anual</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={estrategias}>
                <XAxis dataKey="nome" />
                <YAxis />
                <ChartTooltip 
                  content={<ChartTooltipContent />}
                  formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'ROI Anual']}
                />
                <Bar dataKey="roiAnual" fill="#3b82f6" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evolução do Valor do Investimento</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80">
            <LineChart data={evolucaoROI}>
              <XAxis dataKey="mes" />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: any, name: string) => [
                  formatCurrency(Number(value)),
                  name === 'investimentoAcumulado' ? 'Investimento Acumulado' : 'Valor do Imóvel'
                ]}
              />
              <Line 
                dataKey="investimentoAcumulado" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Investimento Acumulado" 
              />
              <Line 
                dataKey="valorImovel" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Valor do Imóvel" 
              />
              <Legend />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default GraficosAnalise;
