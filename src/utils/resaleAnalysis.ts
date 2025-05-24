
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
  // Estratégia 1: Maior Valor de Lucro Absoluto
  let bestProfitMonth = 0;
  let maxProfit = 0;
  let maxProfitPercentage = 0;

  // Estratégia 2: Maior Percentual de Rentabilidade
  let bestRoiMonth = 0;
  let maxRoi = 0;
  let maxRoiProfit = 0;

  // Estratégia 3: Maior Lucro no Menor Prazo (mínimo 50% de rentabilidade)
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
    
    // Fórmula: Lucro = Valor do Imóvel no mês - Valor investido até o mês - Saldo devedor
    const profit = currentPropertyValue - investedUpToMonth - remainingBalance;
    
    // Só considerar se houver lucro positivo
    if (profit > 0 && currentPropertyValue > investedUpToMonth) {
      
      // ESTRATÉGIA 1: Maior Valor de Lucro Absoluto
      // Objetivo: maior retorno financeiro em valor absoluto
      if (profit > maxProfit) {
        maxProfit = profit;
        maxProfitPercentage = (profit / investedUpToMonth) * 100;
        bestProfitMonth = i;
      }

      // ESTRATÉGIA 2: Maior Percentual de Rentabilidade
      // Objetivo: maior retorno em percentual
      const currentRentability = (profit / investedUpToMonth) * 100;
      
      if (currentRentability > maxRoi) {
        maxRoi = currentRentability;
        maxRoiProfit = profit;
        bestRoiMonth = i;
      }

      // ESTRATÉGIA 3: Maior Lucro no Menor Prazo
      // Objetivo: maior lucro em menor prazo com rentabilidade mínima de 50%
      if (currentRentability >= 50) {
        // Priorizar menor prazo, mas se for o mesmo prazo, pegar o maior lucro
        if (earlyMonth === undefined || 
            i < earlyMonth || 
            (i === earlyMonth && profit > (earlyProfit || 0))) {
          earlyMonth = i;
          earlyProfit = profit;
          earlyProfitPercentage = currentRentability;
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
