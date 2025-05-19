
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
  ResponsiveContainer,
  Area,
  ComposedChart
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

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

const chartConfig = {
  propertyValue: {
    label: "Valor do Imóvel",
    color: "#0c4a6e" // simulae-900
  },
  totalPaid: {
    label: "Total Investido",
    color: "#475569" // slate-600
  },
  balance: {
    label: "Saldo Devedor", 
    color: "#b45309" // amber-700 (vermelho queimado/cobre)
  },
  profit: {
    label: "Lucro",
    color: "#047857" // emerald-700 (verde jade)
  }
};

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
    <div className="w-full pb-6">
      <ChartContainer 
        className="h-[400px]"
        config={chartConfig}
      >
        <ComposedChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <defs>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.profit.color} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={chartConfig.profit.color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid 
            vertical={false}
            horizontal={true}
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            opacity={0.4} 
          />
          
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            label={{ 
              value: 'Mês', 
              position: 'insideBottomRight', 
              offset: -10,
              fill: '#64748b'
            }}
          />
          
          <YAxis 
            tickFormatter={(value) => `${value.toLocaleString('pt-BR')}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            width={80}
          />
          
          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              return (
                <div className="rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:bg-slate-950/90 min-w-[220px]">
                  <div className="mb-2 font-medium">
                    Mês {payload[0]?.payload?.month}
                  </div>
                  {payload.map((entry, index) => {
                    if (!entry.value) return null;
                    
                    const dataKey = entry.dataKey as keyof typeof chartConfig;
                    const config = chartConfig[dataKey];
                    
                    return (
                      <div key={`tooltip-${index}`} className="flex items-center justify-between py-1">
                        <div className="flex items-center">
                          <div 
                            className="mr-2 h-2 w-2 rounded-full" 
                            style={{ backgroundColor: config?.color }}
                          />
                          <span className="text-sm text-slate-600">
                            {config?.label}:
                          </span>
                        </div>
                        <span className="font-medium">
                          R$ {Number(entry.value).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            }}
          />
          
          <Legend 
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value, entry, index) => {
              const dataKey = entry.dataKey as keyof typeof chartConfig;
              return <span className="text-sm ml-1">{chartConfig[dataKey]?.label}</span>;
            }}
          />
          
          <Area
            type="monotone"
            dataKey="profit"
            fill="url(#profitGradient)"
            stroke={chartConfig.profit.color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 1,
              stroke: "#fff"
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="propertyValue" 
            stroke={chartConfig.propertyValue.color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 1,
              stroke: "#fff"
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="totalPaid" 
            stroke={chartConfig.totalPaid.color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 1,
              stroke: "#fff"
            }}
          />
          
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke={chartConfig.balance.color}
            strokeWidth={1.5}
            dot={false} 
            activeDot={{ 
              r: 4, 
              strokeWidth: 1,
              stroke: "#fff"
            }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default ResultsChart;
