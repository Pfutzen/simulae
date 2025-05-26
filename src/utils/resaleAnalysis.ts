
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
  
  // Estratégia 1: Maior Valor de Lucro Absoluto (parcela chaves)
  const keysData = schedule[keysIndex];
  const maxProfit = keysData.propertyValue - keysData.totalPaid;
  const maxProfitPercentage = keysData.totalPaid > 0 
    ? (maxProfit / keysData.totalPaid) * 100 
    : 0;
  const maxProfitTotalPaid = keysData.totalPaid;
  const bestProfitMonth = keysData.month;

  // Estratégia 2: Maior Percentual de Rentabilidade (última parcela antes das chaves)
  // Aplicando a fórmula correta: Lucro real = Valor de revenda - Valor pago - Saldo devedor
  // Encontrar a última parcela (antes das chaves)
  const lastInstallmentIndex = schedule.findIndex(payment => payment.description === "Chaves") - 1;
  const lastInstallmentData = schedule[lastInstallmentIndex];
  
  // Calcular o saldo devedor na última parcela
  // O saldo devedor é quanto ainda falta pagar do valor original do imóvel
  const originalPropertyValue = schedule[0]?.propertyValue || 0;
  const remainingBalance = originalPropertyValue - lastInstallmentData.totalPaid;
  
  // Lucro real = Valor de revenda - Valor pago - Saldo devedor
  const maxRoiProfit = lastInstallmentData.propertyValue - lastInstallmentData.totalPaid - Math.max(0, remainingBalance);
  const maxRoi = lastInstallmentData.totalPaid > 0 
    ? (maxRoiProfit / lastInstallmentData.totalPaid) * 100 
    : 0;
  const maxRoiTotalPaid = lastInstallmentData.totalPaid;
  const bestRoiMonth = lastInstallmentData.month;

  // Estratégia 3: Primeiro mês com bom percentual de lucro (≥ 60%)
  // Aplicando a mesma fórmula correta para todos os meses
  let earlyMonth: number | undefined;
  let earlyProfit: number | undefined;
  let earlyProfitPercentage: number | undefined;
  let earlyTotalPaid: number | undefined;

  for (let i = 1; i <= schedule.length; i++) {
    const monthData = schedule[i - 1];
    
    if (monthData.totalPaid > 0 && monthData.propertyValue > 0) {
      // Calcular saldo devedor para este mês
      const monthRemainingBalance = originalPropertyValue - monthData.totalPaid;
      
      // Lucro real = Valor de revenda - Valor pago - Saldo devedor
      const profit = monthData.propertyValue - monthData.totalPaid - Math.max(0, monthRemainingBalance);
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
