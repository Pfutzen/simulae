export type CorrectionMode = "manual" | "market";

export interface PaymentType {
  month: number;
  description: string;
  amount: number;
  balance: number;
  totalPaid: number;
  propertyValue: number;
}

export interface SimulationFormData {
  propertyValue: number;
  downPaymentValue: number;
  downPaymentPercentage: number;
  installmentsValue: number;
  installmentsPercentage: number;
  installmentsCount: number;
  reinforcementsValue: number;
  reinforcementsPercentage: number;
  reinforcementFrequency: number;
  finalMonthsWithoutReinforcement: number;
  keysValue: number;
  keysPercentage: number;
  correctionMode: CorrectionMode;
  correctionIndex: number;
  appreciationIndex: number;
  resaleMonth: number;
  rentalPercentage?: number; // New field for rental percentage
}

/**
 * Format currency to BRL
 * @param value
 * @returns string
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
};

/**
 * Format percentage
 * @param value
 * @returns string
 */
export const formatPercentage = (value: number): string => {
  return value.toLocaleString("pt-BR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Calculates the value based on a percentage of a total value.
 *
 * @param {number} percentage - The percentage to calculate (e.g., 10 for 10%).
 * @param {number} totalValue - The total value to calculate the percentage from.
 * @returns {number} The calculated value.
 */
export const calculateValue = (percentage: number, totalValue: number): number => {
  return (percentage / 100) * totalValue;
};

/**
 * Calculates the percentage that a value represents of a total value.
 *
 * @param {number} value - The value to determine the percentage for.
 * @param {number} totalValue - The total value to calculate the percentage against.
 * @returns {number} The calculated percentage.
 */
export const calculatePercentage = (value: number, totalValue: number): number => {
  return (value / totalValue) * 100;
};

/**
 * Calculates the total percentage from down payment, installments, reinforcements and keys.
 *
 * @param {SimulationFormData} formData - The form data to calculate the total percentage from.
 * @returns {number} The calculated total percentage.
 */
export const calculateTotalPercentage = (formData: SimulationFormData): number => {
  return (
    formData.downPaymentPercentage +
    formData.installmentsPercentage +
    formData.reinforcementsPercentage +
    formData.keysPercentage
  );
};

/**
 * Generates a payment schedule based on the provided form data.
 *
 * @param {SimulationFormData} formData - The data used to generate the payment schedule.
 * @returns {PaymentType[]} The generated payment schedule.
 */
export const generatePaymentSchedule = (formData: SimulationFormData): PaymentType[] => {
  const schedule: PaymentType[] = [];
  let currentBalance = formData.propertyValue - formData.downPaymentValue;
  let totalPaid = formData.downPaymentValue;
  let propertyValue = formData.propertyValue;
  
  // Initial down payment
  schedule.push({
    month: 0,
    description: "Entrada",
    amount: formData.downPaymentValue,
    balance: currentBalance,
    totalPaid: totalPaid,
    propertyValue: propertyValue
  });
  
  // Calculate reinforcement months
  const reinforcementMonths = getReinforcementMonths(
    formData.installmentsCount,
    formData.reinforcementFrequency,
    formData.finalMonthsWithoutReinforcement
  );
  
  for (let month = 1; month <= formData.installmentsCount; month++) {
    let monthlyCorrection = 0;
    
    if (formData.correctionMode === "manual") {
      monthlyCorrection = currentBalance * (formData.correctionIndex / 100);
    }
    
    currentBalance += monthlyCorrection;
    propertyValue += propertyValue * (formData.appreciationIndex / 100);
    
    let installmentAmount = formData.installmentsValue;
    
    // Check if it's a reinforcement month
    if (reinforcementMonths.includes(month)) {
      installmentAmount += formData.reinforcementsValue;
    }
    
    currentBalance -= installmentAmount;
    totalPaid += installmentAmount;
    
    schedule.push({
      month: month,
      description: reinforcementMonths.includes(month)
        ? `Parcela + Reforço (${month})`
        : `Parcela (${month})`,
      amount: installmentAmount,
      balance: currentBalance > 0 ? currentBalance : 0,
      totalPaid: totalPaid,
      propertyValue: propertyValue > 0 ? propertyValue : 0
    });
  }
  
  // Add keys payment
  totalPaid += formData.keysValue;
  schedule.push({
    month: formData.installmentsCount + 1,
    description: "Chaves",
    amount: formData.keysValue,
    balance: 0,
    totalPaid: totalPaid,
    propertyValue: propertyValue
  });
  
  return schedule;
};

/**
 * Calculates resale profit based on a payment schedule and a resale month.
 *
 * @param {PaymentType[]} schedule - The payment schedule.
 * @param {number} resaleMonth - The month in which the property is resold.
 * @returns {{ investmentValue: number; propertyValue: number; profit: number; profitPercentage: number; remainingBalance: number }} An object containing the investment value, property value, profit, and profit percentage.
 */
export const calculateResaleProfit = (schedule: PaymentType[], resaleMonth: number): {
  investmentValue: number;
  propertyValue: number;
  profit: number;
  profitPercentage: number;
  remainingBalance: number;
} => {
  const resaleData = schedule.find(item => item.month === resaleMonth);
  
  if (!resaleData) {
    return {
      investmentValue: 0,
      propertyValue: 0,
      profit: 0,
      profitPercentage: 0,
      remainingBalance: 0
    };
  }
  
  const investmentValue = resaleData.totalPaid;
  const propertyValue = resaleData.propertyValue;
  const remainingBalance = resaleData.balance;
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

/**
 * Calculates the maximum number of reinforcements possible based on the installment count and reinforcement frequency.
 *
 * @param {number} installmentsCount - The total number of installments.
 * @param {number} reinforcementFrequency - The frequency of reinforcements in months.
 * @returns {number} The maximum possible number of reinforcements.
 */
export const calculateMaxReinforcementCount = (installmentsCount: number, reinforcementFrequency: number): number => {
  return Math.floor(installmentsCount / reinforcementFrequency);
};

/**
 * Generates an array of months in which reinforcements will occur based on the installment count and reinforcement frequency.
 *
 * @param {number} installmentsCount - The total number of installments.
 * @param {number} reinforcementFrequency - The frequency of reinforcements in months.
 * @param {number} finalMonthsWithoutReinforcement - The number of months at the end of the installment period during which no reinforcements should occur.
 * @returns {number[]} An array of months in which reinforcements will occur.
 */
export const getReinforcementMonths = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
): number[] => {
  const months: number[] = [];
  
  for (let i = reinforcementFrequency; i <= installmentsCount - finalMonthsWithoutReinforcement; i += reinforcementFrequency) {
    months.push(i);
  }
  
  return months;
};

/**
 * Calculates the best month for resale based on maximum profit and ROI (Return on Investment).
 *
 * @param {PaymentType[]} schedule - The payment schedule.
 * @returns {{ bestProfitMonth: number; maxProfit: number; maxProfitPercentage: number; bestRoiMonth: number; maxRoi: number; maxRoiProfit: number }} An object containing the best month for resale based on maximum profit and ROI.
 */
export const calculateBestResaleMonth = (schedule: PaymentType[]): {
  bestProfitMonth: number;
  maxProfit: number;
  maxProfitPercentage: number;
  bestRoiMonth: number;
  maxRoi: number;
  maxRoiProfit: number;
  earlyMonth?: number;
  earlyProfit?: number;
  earlyProfitPercentage?: number;
} => {
  let bestProfitMonth = 0;
  let maxProfit = 0;
  let maxProfitPercentage = 0;
  let bestRoiMonth = 0;
  let maxRoi = 0;
  let maxRoiProfit = 0;
  let earlyMonth: number | undefined = undefined;
  let earlyProfit: number | undefined = undefined;
  let earlyProfitPercentage: number | undefined = undefined;
  
  if (schedule.length === 0) {
    return { bestProfitMonth, maxProfit, maxProfitPercentage, bestRoiMonth, maxRoi, maxRoiProfit };
  }
  
  // Find the earliest month with profit
  for (let i = 1; i < schedule.length; i++) {
    const resaleData = schedule[i];
    const investmentValue = resaleData.totalPaid;
    const propertyValue = resaleData.propertyValue;
    const remainingBalance = resaleData.balance;
    const profit = propertyValue - investmentValue - remainingBalance;
    
    if (profit > 0) {
      earlyMonth = resaleData.month;
      earlyProfit = profit;
      earlyProfitPercentage = (profit / investmentValue) * 100;
      break;
    }
  }
  
  for (let i = 1; i < schedule.length; i++) {
    const resaleData = schedule[i];
    const investmentValue = resaleData.totalPaid;
    const propertyValue = resaleData.propertyValue;
    const remainingBalance = resaleData.balance;
    const profit = propertyValue - investmentValue - remainingBalance;
    const roi = (profit / investmentValue) * 100;
    
    if (profit > maxProfit) {
      maxProfit = profit;
      maxProfitPercentage = roi;
      bestProfitMonth = resaleData.month;
    }
    
    if (roi > maxRoi) {
      maxRoi = roi;
      maxRoiProfit = profit;
      bestRoiMonth = resaleData.month;
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

/**
 * Calculate rental income estimate based on property value
 */
export function calculateRentalEstimate(propertyValue: number, percentage: number = 0.5) {
  const rentalEstimate = propertyValue * (percentage / 100);
  const annualRental = rentalEstimate * 12;
  const annualRentalReturn = (annualRental / propertyValue) * 100;
  
  return {
    rentalEstimate,
    annualRental,
    annualRentalReturn
  };
}
