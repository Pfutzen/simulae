
import { PaymentType } from '@/utils/types';

/**
 * Functions for profit and ROI calculations
 */

export const calculateInvestmentAtMonth = (schedule: PaymentType[], month: number): number => {
  return schedule
    .filter((payment, index) => index <= month)
    .reduce((total, payment) => total + payment.amount, 0);
};

export const calculateProfitAtMonth = (
  propertyValue: number,
  investmentValue: number,
  remainingBalance: number = 0
): { profit: number; profitPercentage: number } => {
  const netPropertyValue = propertyValue - remainingBalance;
  const profit = netPropertyValue - investmentValue;
  const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
  
  return { profit, profitPercentage };
};

export const calculateROI = (profit: number, investment: number): number => {
  return investment > 0 ? (profit / investment) * 100 : 0;
};

export const calculateAnnualizedReturn = (
  totalReturn: number,
  investmentPeriodMonths: number
): number => {
  if (investmentPeriodMonths <= 0) return 0;
  return (totalReturn / investmentPeriodMonths) * 12;
};

export const findOptimalResaleMonth = (
  schedule: PaymentType[],
  targetMetric: 'profit' | 'roi' = 'profit'
): { month: number; value: number; details: any } => {
  let bestMonth = 0;
  let bestValue = -Infinity;
  let bestDetails = null;

  schedule.forEach((payment, index) => {
    const investmentValue = calculateInvestmentAtMonth(schedule, index);
    const { profit, profitPercentage } = calculateProfitAtMonth(
      payment.propertyValue,
      investmentValue,
      payment.balance
    );

    const currentValue = targetMetric === 'profit' ? profit : profitPercentage;
    
    if (currentValue > bestValue) {
      bestValue = currentValue;
      bestMonth = index;
      bestDetails = {
        profit,
        profitPercentage,
        investmentValue,
        propertyValue: payment.propertyValue,
        remainingBalance: payment.balance
      };
    }
  });

  return {
    month: bestMonth,
    value: bestValue,
    details: bestDetails
  };
};
