
import React, { useEffect, useState } from "react";
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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
    right: windowWidth < 640 ? 10 : 30,
    left: windowWidth < 640 ? 5 : 20,
    bottom: 20
  };

  return (
    <div className="w-full max-w-full overflow-hidden pb-6">
      <ChartContainer 
        className="h-[250px] sm:h-[350px] md:h-[400px] max-w-full"
        config={chartConfig}
      >
        <ComposedChart 
          data={chartData} 
          margin={chartMargins}
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
            tick={{ fill: '#64748b', fontSize: windowWidth < 640 ? 9 : 10 }}
            label={{ 
              value: windowWidth < 640 ? '' : 'Mês',
              position: 'insideBottomRight', 
              offset: -5,
              fill: '#64748b',
              fontSize: 12
            }}
            tickFormatter={(value) => {
              // On mobile, only show every 6th tick
              return windowWidth < 640 && value % 6 !== 0 ? '' : value;
            }}
          />
          
          <YAxis 
            tickFormatter={(value) => {
              if (windowWidth < 640) {
                // Simplified formatter for mobile - no decimal places, K suffix
                return Math.abs(value) >= 1000 ? Math.round(value / 1000) + 'k' : value;
              }
              return `${value.toLocaleString('pt-BR')}`;
            }}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: windowWidth < 640 ? 9 : 10 }}
            width={windowWidth < 640 ? 30 : 60}
            domain={['auto', 'auto']}
          />
          
          <ChartTooltip 
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              
              return (
                <div className="rounded-lg border bg-white/95 p-1.5 sm:p-3 shadow-lg backdrop-blur-sm dark:bg-slate-950/90 max-w-[90vw] sm:max-w-none min-w-[150px] sm:min-w-[220px]">
                  <div className="mb-1 sm:mb-2 font-medium text-xs sm:text-base">
                    Mês {payload[0]?.payload?.month}
                  </div>
                  {payload.map((entry, index) => {
                    if (!entry.value) return null;
                    
                    const dataKey = entry.dataKey as keyof typeof chartConfig;
                    const config = chartConfig[dataKey];
                    
                    return (
                      <div key={`tooltip-${index}`} className="flex items-center justify-between py-0.5 sm:py-1">
                        <div className="flex items-center">
                          <div 
                            className="mr-1 sm:mr-2 h-2 w-2 sm:h-3 sm:w-3 rounded-full shadow-sm" 
                            style={{ backgroundColor: config?.color }}
                          />
                          <span className="text-[10px] sm:text-sm font-medium text-slate-700 truncate max-w-[75px] sm:max-w-none">
                            {config?.label}:
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-sm font-medium pl-1">
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
            height={windowWidth < 640 ? 24 : 36}
            iconType="circle"
            iconSize={windowWidth < 640 ? 6 : 8}
            wrapperStyle={{
              fontSize: windowWidth < 640 ? '0.65rem' : '0.75rem',
              paddingTop: windowWidth < 640 ? '5px' : '10px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '4px'
            }}
            formatter={(value, entry) => {
              // The error was happening because dataKey doesn't exist on the type
              // Now we check if entry has a dataKey property before accessing it
              const dataKey = entry && 'dataKey' in entry ? 
                entry.dataKey as keyof typeof chartConfig : value as keyof typeof chartConfig;
              
              return <span className="text-[10px] sm:text-xs md:text-sm font-medium ml-1">{chartConfig[dataKey]?.label}</span>;
            }}
          />
          
          {/* Area for profit with enhanced styling */}
          <Area
            type="monotone"
            dataKey="profit"
            fill="url(#profitGradient)"
            stroke={chartConfig.profit.color}
            strokeWidth={windowWidth < 640 ? 2 : 3}
            dot={false}
            activeDot={{ 
              r: windowWidth < 640 ? 4 : 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.profit.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
            isAnimationActive={false}
          />
          
          {/* Line for property value with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="propertyValue" 
            stroke={chartConfig.propertyValue.color}
            strokeWidth={windowWidth < 640 ? 2 : 3}
            dot={false}
            activeDot={{ 
              r: windowWidth < 640 ? 4 : 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.propertyValue.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
            isAnimationActive={false}
          />
          
          {/* Line for total paid with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="totalPaid" 
            stroke={chartConfig.totalPaid.color}
            strokeWidth={windowWidth < 640 ? 2 : 3}
            dot={false}
            activeDot={{ 
              r: windowWidth < 640 ? 4 : 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.totalPaid.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
            isAnimationActive={false}
          />
          
          {/* Line for balance with enhanced styling */}
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke={chartConfig.balance.color}
            strokeWidth={windowWidth < 640 ? 2 : 3}
            dot={false} 
            activeDot={{ 
              r: windowWidth < 640 ? 4 : 5, 
              strokeWidth: 2,
              stroke: "#fff",
              fill: chartConfig.balance.color,
              filter: "url(#dropShadow)"
            }}
            style={{ filter: "url(#dropShadow)" }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default ResultsChart;
