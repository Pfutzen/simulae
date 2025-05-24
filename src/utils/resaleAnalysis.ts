
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
  let bestProfitMonth = 0;
  let maxProfit = 0;
  let maxProfitPercentage = 0;
  let bestRoiMonth = 0;
  let maxRoi = 0;
  let maxRoiProfit = 0;
  let earlyMonth: number | undefined;
  let earlyProfit: number | undefined;
  let earlyProfitPercentage: number | undefined;

  for (let i = 1; i <= schedule.length; i++) {
    // Calcular valor investido até este mês
    const investedUpToMonth = schedule.slice(0, i).reduce((acc, payment) => acc + payment.amount, 0);
    
    // Calcular valor do imóvel no mês atual
    const currentPropertyValue = schedule[i - 1]?.propertyValue || 0;
    
    // Calcular saldo devedor restante
    const remainingBalance = schedule[i - 1]?.balance || 0;
    
    // Calcular lucro: valor do imóvel - valor investido - saldo devedor
    const profit = currentPropertyValue - investedUpToMonth - remainingBalance;
    
    // Só considerar se houver lucro positivo e valor de revenda maior que investido
    if (profit > 0 && currentPropertyValue > investedUpToMonth) {
      // Estratégia 1: Maior Lucro Absoluto
      if (profit > maxProfit) {
        maxProfit = profit;
        maxProfitPercentage = (profit / investedUpToMonth) * 100;
        bestProfitMonth = i;
      }

      // Estratégia 2: Maior Percentual de Rentabilidade
      // Calcular rentabilidade real para este mês específico
      const currentRentability = (profit / investedUpToMonth) * 100;
      
      // Só considerar se a rentabilidade for pelo menos 10%
      if (currentRentability >= 10) {
        // Buscar o MAIOR percentual de rentabilidade de todos os meses
        if (currentRentability > maxRoi) {
          maxRoi = currentRentability;
          maxRoiProfit = profit;
          bestRoiMonth = i;
        }
      }

      // Estratégia 3: Maior Lucro no Menor Prazo (primeiros 12 meses)
      if (i <= 12) {
        // Só considera se a rentabilidade for pelo menos 30%
        const earlyRentability = (profit / investedUpToMonth) * 100;
        if (earlyRentability >= 30) {
          if (earlyProfit === undefined || profit > earlyProfit) {
            earlyMonth = i;
            earlyProfit = profit;
            earlyProfitPercentage = earlyRentability;
          }
        }
      }
    }
  }

  return {
    bestProfitMonth,
    maxProfit,
    maxProfitPercentage,
    bestRoiMonth,
    maxRoi,
    maxRoiProfit,
    earlyMonth,
    earlyProfit,
    earlyProfitPercentage
  };
};
