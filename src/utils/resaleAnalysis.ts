
import { PaymentType } from './types';

export const calculateResaleProfit = (
  schedule: PaymentType[],
  resaleMonth: number
) => {
  if (schedule.length === 0 || resaleMonth <= 0) {
    return {
      investmentValue: 0,
      propertyValue: 0,
      profit: 0,
      profitPercentage: 0,
      remainingBalance: 0
    };
  }

  // Encontrar o pagamento do mês de referência
  const resalePayment = schedule.find(payment => payment.month === resaleMonth);
  
  if (!resalePayment) {
    return {
      investmentValue: 0,
      propertyValue: 0,
      profit: 0,
      profitPercentage: 0,
      remainingBalance: 0
    };
  }

  // Valor investido = total pago até o mês de referência
  const investmentValue = resalePayment.totalPaid;
  
  // Valor do imóvel no mês de referência
  const propertyValue = resalePayment.propertyValue;
  
  // Saldo devedor no mês de referência
  const remainingBalance = resalePayment.balance;
  
  // Lucro = Valor de venda - Valores pagos - Saldo devedor
  const profit = propertyValue - investmentValue - remainingBalance;
  
  // Percentual de lucro sobre o valor investido
  const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;

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
      // Estratégias estruturadas
      rapidResale: null,
      balancedResale: null,
      maximumResale: null,
      
      // Dados legados (mantidos para compatibilidade)
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

  // Encontrar o índice das chaves
  const keysIndex = schedule.findIndex(payment => payment.description === "Chaves");
  const totalMonths = keysIndex > 0 ? keysIndex : schedule.length - 1;

  // ========== NOVAS ESTRATÉGIAS ESTRUTURADAS ==========
  
  // 1. REVENDA RÁPIDA (12-18 meses) - Perfil Conservador
  const rapidResale = findOptimalResaleInRange(schedule, 12, 18, 'conservador');
  
  // 2. REVENDA EQUILIBRADA (24-30 meses) - Perfil Moderado  
  const balancedResale = findOptimalResaleInRange(schedule, 24, 30, 'moderado');
  
  // 3. REVENDA MÁXIMA (36-48 meses ou final) - Perfil Arrojado
  const maxMonthForMaximum = Math.min(48, totalMonths);
  const maximumResale = findOptimalResaleInRange(schedule, 36, maxMonthForMaximum, 'arrojado');

  // ========== MANTER DADOS LEGADOS PARA COMPATIBILIDADE ==========
  
  // Estratégia 1: Maior Valor de Lucro Absoluto (chaves)
  const keysData = schedule[keysIndex];
  const maxProfit = keysData.propertyValue - keysData.totalPaid;
  const maxProfitPercentage = keysData.totalPaid > 0 
    ? (maxProfit / keysData.totalPaid) * 100 
    : 0;
  const maxProfitTotalPaid = keysData.totalPaid;
  const bestProfitMonth = keysData.month;

  // Estratégia 2: Maior Percentual de Rentabilidade (última parcela antes das chaves)
  const lastInstallmentIndex = Math.max(0, keysIndex - 1);
  const lastInstallmentData = schedule[lastInstallmentIndex];
  
  const originalPropertyValue = schedule[0]?.propertyValue || 0;
  const remainingBalance = originalPropertyValue - lastInstallmentData.totalPaid;
  
  const maxRoiProfit = lastInstallmentData.propertyValue - lastInstallmentData.totalPaid - Math.max(0, remainingBalance);
  const maxRoi = lastInstallmentData.totalPaid > 0 
    ? (maxRoiProfit / lastInstallmentData.totalPaid) * 100 
    : 0;
  const maxRoiTotalPaid = lastInstallmentData.totalPaid;
  const bestRoiMonth = lastInstallmentData.month;

  // Estratégia 3: Primeiro mês com bom percentual de lucro (≥ 60%)
  let earlyMonth: number | undefined;
  let earlyProfit: number | undefined;
  let earlyProfitPercentage: number | undefined;
  let earlyTotalPaid: number | undefined;

  for (let i = 1; i <= schedule.length; i++) {
    const monthData = schedule[i - 1];
    
    if (monthData.totalPaid > 0 && monthData.propertyValue > 0) {
      const monthRemainingBalance = originalPropertyValue - monthData.totalPaid;
      const profit = monthData.propertyValue - monthData.totalPaid - Math.max(0, monthRemainingBalance);
      const profitPercentage = (profit / monthData.totalPaid) * 100;

      if (profitPercentage >= 60 && profit > 0) {
        earlyMonth = i;
        earlyProfit = profit;
        earlyProfitPercentage = profitPercentage;
        earlyTotalPaid = monthData.totalPaid;
        break;
      }
    }
  }

  return {
    // Novas estratégias estruturadas
    rapidResale,
    balancedResale,
    maximumResale,
    
    // Dados legados (mantidos para compatibilidade)
    bestProfitMonth,
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

// Função auxiliar para encontrar a melhor revenda em um intervalo específico
function findOptimalResaleInRange(
  schedule: PaymentType[], 
  minMonth: number, 
  maxMonth: number, 
  perfil: 'conservador' | 'moderado' | 'arrojado'
) {
  let bestMonth = minMonth;
  let bestScore = -Infinity;
  let bestData = null;

  // Filtrar apenas meses dentro do intervalo válido
  const validPayments = schedule.filter(payment => 
    payment.month >= minMonth && 
    payment.month <= maxMonth &&
    payment.totalPaid > 0 &&
    payment.propertyValue > 0
  );

  if (validPayments.length === 0) {
    return null;
  }

  validPayments.forEach(payment => {
    const profit = payment.propertyValue - payment.totalPaid - payment.balance;
    const profitPercentage = payment.totalPaid > 0 ? (profit / payment.totalPaid) * 100 : 0;
    
    let score = 0;
    
    // Algoritmo de pontuação baseado no perfil
    switch (perfil) {
      case 'conservador':
        // Prioriza liquidez (menor prazo) e segurança
        score = profitPercentage * 0.7 - (payment.month - minMonth) * 2;
        break;
        
      case 'moderado':
        // Equilibra retorno e prazo
        score = profitPercentage * 0.8 + (profit / 10000) * 0.2;
        break;
        
      case 'arrojado':
        // Prioriza máximo retorno absoluto
        score = profit * 0.6 + profitPercentage * 0.4;
        break;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMonth = payment.month;
      bestData = {
        month: payment.month,
        profit,
        profitPercentage,
        investmentValue: payment.totalPaid,
        propertyValue: payment.propertyValue,
        remainingBalance: payment.balance,
        perfil,
        score: Math.round(score)
      };
    }
  });

  return bestData;
}
