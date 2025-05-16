
import React from "react";
import { PaymentType } from "@/utils/calculationUtils";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

interface ResultsChartProps {
  schedule: PaymentType[];
  resaleMonth: number;
}

interface ChartData {
  month: number;
  propertyValue: number;
  totalPaid: number;
  balance: number;
  profit: number;
}

const ResultsChart: React.FC<ResultsChartProps> = ({ schedule, resaleMonth }) => {
  // Prepare data for the chart
  const chartData: ChartData[] = schedule.map(item => ({
    month: item.month,
    propertyValue: item.propertyValue,
    totalPaid: item.totalPaid,
    balance: item.balance,
    profit: item.propertyValue - item.totalPaid - item.balance
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis 
          dataKey="month" 
          label={{ value: 'Mês', position: 'insideBottomRight', offset: -10 }}
        />
        <YAxis 
          tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
        />
        <Tooltip 
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
          labelFormatter={(label) => `Mês ${label}`}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="propertyValue" 
          name="Valor do Imóvel" 
          stroke="#0ea5e9" 
          strokeWidth={2} 
          dot={false} 
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="totalPaid" 
          name="Total Investido" 
          stroke="#475569" 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="balance" 
          name="Saldo Devedor" 
          stroke="#ef4444" 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="profit" 
          name="Lucro" 
          stroke="#10b981" 
          strokeWidth={2} 
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ResultsChart;
