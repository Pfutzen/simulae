
import React, { useEffect, useState } from "react";
import { PaymentType } from "@/utils/calculationUtils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
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
    color: "#0c4a6e"
  },
  totalPaid: {
    label: "Total Investido",
    color: "#ef4444"
  },
  balance: {
    label: "Saldo Devedor", 
    color: "#f97316"
  },
  profit: {
    label: "Lucro",
    color: "#16a34a"
  }
};

const ResultsChart: React.FC<ResultsChartProps> = ({ schedule, resaleMonth }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobile, setIsMobile] = useState(false);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 768);
    };
    
    // Set initial values
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // If it's a mobile device, show a message instead of the chart
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-lg border border-slate-200 h-[200px]">
        <p className="text-slate-600 text-center mb-3">
          Visualize o gráfico completo em uma tela maior para melhor experiência.
        </p>
        <p className="text-sm text-slate-500">
          Os dados estão disponíveis na aba "Cronograma".
        </p>
      </div>
    );
  }
  
  // Prepare data for the chart
  const chartData: ChartData[] = schedule.map(item => ({
    month: item.month,
    propertyValue: item.propertyValue,
    totalPaid: item.totalPaid,
    balance: item.balance,
    profit: item.propertyValue - item.totalPaid - item.balance
  }));

  // Calculate responsive margins based on screen size
  const chartMargins = {
    top: 20,
    right: windowWidth < 640 ? 10 : 20,
    left: windowWidth < 640 ? 5 : 10,
    bottom: 20
  };

  return (
    <div className="w-full max-w-full overflow-hidden pb-6">
      <ChartContainer 
        className="h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px] xl:h-[500px] w-full max-w-full"
        config={chartConfig}
      >
        <AreaChart 
          data={chartData} 
          margin={chartMargins}
          width={windowWidth}
        >
          <defs>
            {/* Property Value Gradient */}
            <linearGradient id="propertyValueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.propertyValue.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartConfig.propertyValue.color} stopOpacity={0.1}/>
            </linearGradient>
            
            {/* Total Paid Gradient */}
            <linearGradient id="totalPaidGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.totalPaid.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartConfig.totalPaid.color} stopOpacity={0.1}/>
            </linearGradient>
            
            {/* Balance Gradient */}
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.balance.color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={chartConfig.balance.color} stopOpacity={0.1}/>
            </linearGradient>
            
            {/* Profit Gradient */}
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartConfig.profit.color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={chartConfig.profit.color} stopOpacity={0.1}/>
            </linearGradient>
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
              fontSize: 12
            }}
            tickFormatter={(value) => value.toString()}
          />
          
          <YAxis 
            tickFormatter={(value) => `${value.toLocaleString('pt-BR')}`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 10 }}
            width={60}
            domain={['auto', 'auto']}
          />
          
          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              return (
                <div className="rounded-lg border bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:bg-slate-950/90 max-w-none min-w-[220px]">
                  <div className="mb-2 font-medium text-base">
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
                            className="mr-2 h-3 w-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: config?.color }}
                          />
                          <span className="text-sm font-medium text-slate-700 truncate">
                            {config?.label}:
                          </span>
                        </div>
                        <span className="text-sm font-medium pl-1">
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
              paddingTop: '10px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '4px'
            }}
            formatter={(value, entry) => {
              const dataKey = entry && 'dataKey' in entry ? 
                entry.dataKey as keyof typeof chartConfig : value as keyof typeof chartConfig;
              
              return <span className="text-sm font-medium ml-1">{chartConfig[dataKey]?.label}</span>;
            }}
          />
          
          {/* Areas stacked for better visualization */}
          <Area
            type="monotone"
            dataKey="balance"
            stackId="1"
            stroke={chartConfig.balance.color}
            fill="url(#balanceGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.balance.color
            }}
          />
          
          <Area
            type="monotone"
            dataKey="totalPaid"
            stackId="1"
            stroke={chartConfig.totalPaid.color}
            fill="url(#totalPaidGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.totalPaid.color
            }}
          />
          
          <Area
            type="monotone"
            dataKey="propertyValue"
            stackId="2"
            stroke={chartConfig.propertyValue.color}
            fill="url(#propertyValueGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.propertyValue.color
            }}
          />
          
          <Area
            type="monotone"
            dataKey="profit"
            stackId="3"
            stroke={chartConfig.profit.color}
            fill="url(#profitGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ 
              r: 4, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.profit.color
            }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
};

export default ResultsChart;
