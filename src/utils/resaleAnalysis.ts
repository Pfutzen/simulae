
import { PaymentType } from './types';

export const calculateResaleProfit = (
  schedule: PaymentType[],
  resaleMonth: number
) => {
  const investmentValue = schedule.reduce((acc, payment) => acc + payment.amount, 0);
  const propertyValue = schedule[resaleMonth - 1]?.propertyValue || 0;
  const remainingBalance = schedule[schedule.length - 1]?.balance || 0;
  const profit = propertyValue - investmentValue - remainingBalance;
  const profitPercentage = (profit / investmentValue) * 100;

  return {
    investmentValue,
    propertyValue,
    profit,
    profitPercentage,
    remainingBalance
  };
};

export const calculateBestResaleMonth = (schedule: PaymentType[]) => {
  if (schedule.length === 0) {
    return {
      bestProfitMonth: 0,
      maxProfit: 0,
      maxProfitPercentage: 0,
      maxProfitTotalPaid: 0,
      bestRoiMonth: 0,
      maxRoi: 0,
      maxRoiProfit: 0,
      maxRoiTotalPaid: 0,
      earlyMonth: undefined,
      earlyProfit: undefined,
      earlyProfitPercentage: undefined,
      earlyTotalPaid: undefined
    };
  }

  // Estratégia 1: Maior Valor de Lucro Absoluto (último mês da simulação)
  const lastMonth = schedule.length;
  const lastMonthData = schedule[lastMonth - 1];
  const maxProfit = lastMonthData.propertyValue - lastMonthData.totalPaid;
  const maxProfitPercentage = (maxProfit / lastMonthData.totalPaid) * 100;
  const maxProfitTotalPaid = lastMonthData.totalPaid;

  // Estratégia 2: Maior Percentual de Rentabilidade
  // Encontrar o mês com maior rentabilidade (lucro / valor pago)
  let bestRoiMonth = 1;
  let maxRoi = -Infinity;
  let maxRoiProfit = 0;
  let maxRoiTotalPaid = 0;

  for (let i = 1; i <= schedule.length; i++) {
    const monthData = schedule[i - 1];
    if (monthData.totalPaid > 0 && monthData.propertyValue > 0) {
      const profit = monthData.propertyValue - monthData.totalPaid;
      const roi = (profit / monthData.totalPaid) * 100;
      
      if (roi > maxRoi && profit > 0) {
        maxRoi = roi;
        bestRoiMonth = i;
        maxRoiProfit = profit;
        maxRoiTotalPaid = monthData.totalPaid;
      }
    }
  }

  // Estratégia 3: Maior Lucro no Menor Prazo
  // Critérios: valor de revenda > 1.2x valor investido, lucro ≥ 60%, prazo mínimo 6 meses
  let earlyMonth: number | undefined;
  let earlyProfit: number | undefined;
  let earlyProfitPercentage: number | undefined;
  let earlyTotalPaid: number | undefined;

  for (let i = 6; i <= schedule.length; i++) { // Prazo mínimo de 6 meses
    const monthData = schedule[i - 1];
    if (monthData.totalPaid > 0 && monthData.propertyValue > 0) {
      const profit = monthData.propertyValue - monthData.totalPaid;
      const profitPercentage = (profit / monthData.totalPaid) * 100;
      const valuationRatio = monthData.propertyValue / monthData.totalPaid;

      // Verificar se atende os critérios:
      // 1. Valor de revenda > valor investido
      // 2. Valor de revenda >= 1.2x valor investido (validação de realidade)
      // 3. Lucro ≥ 60% do valor pago
      if (monthData.propertyValue > monthData.totalPaid && 
          valuationRatio >= 1.2 && 
          profitPercentage >= 60) {
        
        // Se é o primeiro mês que atende os critérios ou se tem maior lucro no mesmo prazo
        if (earlyMonth === undefined || 
            i < earlyMonth || 
            (i === earlyMonth && profit > (earlyProfit || 0))) {
          earlyMonth = i;
          earlyProfit = profit;
          earlyProfitPercentage = profitPercentage;
          earlyTotalPaid = monthData.totalPaid;
        }
      }
    }
  }

  return {
    bestProfitMonth: lastMonth,
    maxProfit,
    maxProfitPercentage,
    maxProfitTotalPaid,
    bestRoiMonth,
    maxRoi,
    maxRoiProfit,
    maxRoiTotalPaid,
    earlyMonth,
    earlyProfit,
    earlyProfitPercentage,
    earlyTotalPaid
  };
};
