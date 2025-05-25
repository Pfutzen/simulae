
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

  // Estratégia 1: Maior Valor de Lucro Absoluto (último mês)
  // Diferença entre valor de venda e valor pago
  const lastMonth = schedule.length;
  const lastMonthData = schedule[lastMonth - 1];
  const maxProfit = lastMonthData.propertyValue - lastMonthData.totalPaid;
  const maxProfitPercentage = lastMonthData.totalPaid > 0 
    ? (maxProfit / lastMonthData.totalPaid) * 100 
    : 0;
  const maxProfitTotalPaid = lastMonthData.totalPaid;

  // Estratégia 2: Maior Percentual de Rentabilidade (penúltimo mês)
  // Não paga as chaves, então percentualmente o lucro será maior
  const penultimateMonth = Math.max(1, schedule.length - 1);
  const penultimateMonthData = schedule[penultimateMonth - 1];
  const maxRoiProfit = penultimateMonthData.propertyValue - penultimateMonthData.totalPaid;
  const maxRoi = penultimateMonthData.totalPaid > 0 
    ? (maxRoiProfit / penultimateMonthData.totalPaid) * 100 
    : 0;
  const maxRoiTotalPaid = penultimateMonthData.totalPaid;

  // Estratégia 3: Primeiro mês com bom percentual de lucro (≥ 60%)
  let earlyMonth: number | undefined;
  let earlyProfit: number | undefined;
  let earlyProfitPercentage: number | undefined;
  let earlyTotalPaid: number | undefined;

  for (let i = 1; i <= schedule.length; i++) {
    const monthData = schedule[i - 1];
    
    if (monthData.totalPaid > 0 && monthData.propertyValue > 0) {
      const profit = monthData.propertyValue - monthData.totalPaid;
      const profitPercentage = (profit / monthData.totalPaid) * 100;

      // Verificar se atende o critério: lucro ≥ 60% sobre valores investidos
      if (profitPercentage >= 60 && profit > 0) {
        earlyMonth = i;
        earlyProfit = profit;
        earlyProfitPercentage = profitPercentage;
        earlyTotalPaid = monthData.totalPaid;
        break; // Pega o primeiro mês que atende o critério
      }
    }
  }

  return {
    bestProfitMonth: lastMonth,
    maxProfit,
    maxProfitPercentage,
    maxProfitTotalPaid,
    bestRoiMonth: penultimateMonth,
    maxRoi,
    maxRoiProfit,
    maxRoiTotalPaid,
    earlyMonth,
    earlyProfit,
    earlyProfitPercentage,
    earlyTotalPaid
  };
};
