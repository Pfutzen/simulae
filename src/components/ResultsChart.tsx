
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
    color: "#0c4a6e" // Azul Marinho (Navy Blue)
  },
  totalPaid: {
    label: "Total Investido",
    color: "#ef4444" // Vermelho claro (Light Red)
  },
  balance: {
    label: "Saldo Devedor", 
    color: "#f97316" // Laranja (Orange)
  },
  profit: {
    label: "Lucro",
    color: "#16a34a" // Verde Bandeira (Flag Green)
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
        <ComposedChart 
          data={chartData} 
          margin={chartMargins}
          width={windowWidth}
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
            isAnimationActive={false}
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
            isAnimationActive={false}
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
            isAnimationActive={false}
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
            isAnimationActive={false}
          />
        </ComposedChart>
      </ChartContainer>
    </div>
  );
};

export default ResultsChart;
