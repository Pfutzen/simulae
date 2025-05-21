
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
        className="h-[350px] sm:h-[400px]"
        config={chartConfig}
      >
        <ComposedChart 
          data={chartData} 
          margin={{ 
            top: 20, 
            right: 10, 
            left: 10, 
            bottom: 10 
          }}
        >
          <defs>
            {/* Property Value Gradient */}
            <linearGradient id="propertyValueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.propertyValue.color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={chartConfig.propertyValue.color} stopOpacity={0}/>
            </linearGradient>
            
            {/* Total Paid Gradient */}
            <linearGradient id="totalPaidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.totalPaid.color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={chartConfig.totalPaid.color} stopOpacity={0}/>
            </linearGradient>
            
            {/* Balance Gradient */}
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.balance.color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={chartConfig.balance.color} stopOpacity={0}/>
            </linearGradient>
            
            {/* Profit Gradient */}
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.profit.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartConfig.profit.color} stopOpacity={0}/>
            </linearGradient>
            
            {/* Drop shadows for lines */}
            <filter id="dropShadow" height="130%" width="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.1"/>
              </feComponentTransfer>
              <feMerge> 
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/> 
              </feMerge>
            </filter>
          </defs>
          
          <CartesianGrid 
            vertical={false}
            horizontal={true}
            strokeDasharray="3 3" 
            stroke="#e2e8f0" 
            opacity={0.3} 
          />
          
          <XAxis 
            dataKey="month" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            label={{ 
              value: 'Mês', 
              position: 'insideBottomRight', 
              offset: -5,
              fill: '#64748b',
              fontSize: 12,
              style: { display: { xs: 'none', sm: 'block' } }
            }}
            tickFormatter={(value) => {
              // On mobile, only show every 4th tick
              return window.innerWidth < 640 && value % 4 !== 0 ? '' : value;
            }}
          />
          
          <YAxis 
            tickFormatter={(value) => {
              if (window.innerWidth < 640) {
                // Simplified formatter for mobile
                return (value / 1000) + 'k';
              }
              return `${value.toLocaleString('pt-BR')}`;
            }}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            width={60}
          />
          
          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              return (
                <div className="rounded-lg border bg-white/95 p-2 sm:p-3 shadow-lg backdrop-blur-sm dark:bg-slate-950/90 min-w-[180px] sm:min-w-[220px]">
                  <div className="mb-1 sm:mb-2 font-medium text-sm sm:text-base">
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
                            className="mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: config?.color }}
                          />
                          <span className="text-xs sm:text-sm font-medium text-slate-700">
                            {config?.label}:
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium">
                          R$ {Number(entry.value).toLocaleString('pt-BR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
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
            wrapperStyle={{
              fontSize: '0.75rem',
              '@media (min-width: 640px)': {
                fontSize: '0.875rem',
              }
            }}
            formatter={(value, entry) => {
              // The error was happening because dataKey doesn't exist on the type
              // Now we check if entry has a dataKey property before accessing it
              const dataKey = entry && 'dataKey' in entry ? 
                entry.dataKey as keyof typeof chartConfig : value as keyof typeof chartConfig;
              
              return <span className="text-xs sm:text-sm font-medium ml-1">{chartConfig[dataKey]?.label}</span>;
            }}
          />
          
          {/* Area for profit with enhanced styling */}
          <Area
            type="monotone"
            dataKey="profit"
            fill="url(#profitGradient)"
            stroke={chartConfig.profit.color}
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.profit.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
          />
          
          {/* Line for property value with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="propertyValue" 
            stroke={chartConfig.propertyValue.color}
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.propertyValue.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
          />
          
          {/* Line for total paid with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="totalPaid" 
            stroke={chartConfig.totalPaid.color}
            strokeWidth={3}
            dot={false}
            activeDot={{ 
              r: 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.totalPaid.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
          />
          
          {/* Line for balance with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke={chartConfig.balance.color}
            strokeWidth={3}
            dot={false} 
            activeDot={{ 
              r: 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.balance.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default ResultsChart;
