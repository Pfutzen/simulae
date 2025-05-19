
// Utility functions for real estate calculations

export type PaymentType = {
  month: number;
  description: string;
  amount: number;
  balance: number;
  totalPaid: number;
  propertyValue: number;
};

export type CorrectionMode = "manual" | "cub";

export type SimulationFormData = {
  propertyValue: number;
  downPaymentValue: number;
  downPaymentPercentage: number;
  installmentsValue: number;
  installmentsPercentage: number;
  installmentsCount: number;
  reinforcementsValue: number;
  reinforcementsPercentage: number;
  reinforcementFrequency: number; 
  keysValue: number;
  keysPercentage: number;
  correctionMode: CorrectionMode;
  correctionIndex: number; // Monthly correction index (manual mode)
  appreciationIndex: number; // Monthly property appreciation
  resaleMonth: number; // Desired month for early resale
};

// CUB/SC correction data
export const CUB_CORRECTION_DATA = [
  { month: 1, description: "Jun/24", percentage: 0.57 },
  { month: 2, description: "Jul/24", percentage: 0.68 },
  { month: 3, description: "Ago/24", percentage: 0.67 },
  { month: 4, description: "Set/24", percentage: 1.05 },
  { month: 5, description: "Out/24", percentage: 0.16 },
  { month: 6, description: "Nov/24", percentage: 0.62 },
  { month: 7, description: "Dez/24", percentage: 0.17 },
  { month: 8, description: "Jan/25", percentage: 0.67 },
  { month: 9, description: "Fev/25", percentage: 0.46 },
  { month: 10, description: "Mar/25", percentage: 0.23 },
  { month: 11, description: "Abr/25", percentage: 0.28 },
  { month: 12, description: "Mai/25", percentage: 0.25 }
];

// Function to get the correction index for a specific month
export const getCorrectionIndex = (month: number, correctionMode: CorrectionMode, manualIndex: number): number => {
  if (correctionMode === "manual") {
    return manualIndex;
  }
  
  // For CUB mode, use the pre-defined CUB/SC data
  // We use modulo to repeat the values if we go beyond 12 months
  const modMonth = ((month - 1) % CUB_CORRECTION_DATA.length) + 1;
  const cubData = CUB_CORRECTION_DATA.find(data => data.month === modMonth);
  return cubData ? cubData.percentage : 0;
};

export const calculatePercentage = (value: number, total: number): number => {
  if (!total) return 0;
  return (value / total) * 100;
};

export const calculateValue = (percentage: number, total: number): number => {
  return (percentage / 100) * total;
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Calculate total percentage to validate it equals 100%
export const calculateTotalPercentage = (data: Partial<SimulationFormData>): number => {
  const { 
    downPaymentPercentage = 0,
    installmentsPercentage = 0,
    reinforcementsPercentage = 0,
    keysPercentage = 0
  } = data;
  
  return Number((downPaymentPercentage + installmentsPercentage + reinforcementsPercentage + keysPercentage).toFixed(2));
};

/**
 * Calculate the maximum number of reinforcements based on frequency and installments
 * Ensures the last reinforcement doesn't happen in the last 5 months
 */
export const calculateMaxReinforcementCount = (
  installmentsCount: number, 
  frequency: number
): number => {
  if (frequency <= 0) return 0;
  
  // The last reinforcement can happen at most at installmentsCount - 5
  const lastPossibleMonth = Math.max(0, installmentsCount - 5);
  
  // Calculate how many reinforcements fit within the allowed period
  return Math.max(0, Math.floor(lastPossibleMonth / frequency));
};

/**
 * Get the actual months when reinforcements occur
 * Adjusts the last reinforcement if needed to respect the "no reinforcements in last 5 months" rule
 */
export const getReinforcementMonths = (
  installmentsCount: number, 
  frequency: number
): number[] => {
  if (frequency <= 0) return [];
  
  const reinforcementMonths: number[] = [];
  const maxMonth = installmentsCount - 5;
  
  // Add reinforcements at regular frequency
  for (let month = frequency; month <= installmentsCount; month += frequency) {
    // Stop adding reinforcements once we reach the forbidden zone (last 5 months)
    if (month > maxMonth) break;
    reinforcementMonths.push(month);
  }
  
  return reinforcementMonths;
};

// Apply compound interest to a value based on the index and number of months
export const applyCompoundInterest = (
  baseValue: number,
  monthlyIndex: number,
  months: number
): number => {
  return baseValue * Math.pow(1 + monthlyIndex / 100, months);
};

// Apply compound interest using CUB/SC monthly rates
export const applyCubCompoundInterest = (
  baseValue: number,
  startMonth: number,
  endMonth: number
): number => {
  let result = baseValue;
  
  // Apply each monthly CUB rate sequentially
  for (let month = startMonth; month <= endMonth; month++) {
    const index = getCorrectionIndex(month, "cub", 0);
    result *= (1 + index / 100);
  }
  
  return result;
};

// Generate payment schedule
export const generatePaymentSchedule = (data: SimulationFormData): PaymentType[] => {
  const {
    propertyValue,
    downPaymentValue,
    installmentsValue,
    installmentsCount,
    reinforcementsValue,
    reinforcementFrequency,
    keysValue,
    correctionMode,
    correctionIndex,
    appreciationIndex,
    resaleMonth
  } = data;

  const schedule: PaymentType[] = [];
  let totalPaid = 0;
  let currentPropertyValue = propertyValue;
  let balance = propertyValue;
  
  // Get the months when reinforcements will happen
  const reinforcementMonths = getReinforcementMonths(installmentsCount, reinforcementFrequency);
  
  // Month 0: Down payment
  if (downPaymentValue > 0) {
    totalPaid += downPaymentValue;
    balance -= downPaymentValue;
    
    schedule.push({
      month: 0,
      description: "Entrada",
      amount: downPaymentValue,
      balance,
      totalPaid,
      propertyValue: currentPropertyValue
    });
  }

  // Calculate payments for each month
  for (let month = 1; month <= Math.max(installmentsCount, resaleMonth); month++) {
    let monthlyPayment = 0;
    const descriptions: string[] = [];
    
    // Get the correction index for this month
    const monthlyCorrection = getCorrectionIndex(month, correctionMode, correctionIndex);
    
    // Apply monthly correction to remaining balance (compound interest)
    balance = balance * (1 + monthlyCorrection / 100);
    
    // Apply monthly appreciation to property value
    currentPropertyValue *= (1 + appreciationIndex / 100);
    
    // Regular installment payment with compound interest applied
    if (month <= installmentsCount) {
      let correctedInstallment = installmentsValue;
      
      if (correctionMode === "manual") {
        // Apply compound interest to the base installment value
        correctedInstallment = applyCompoundInterest(installmentsValue, correctionIndex, month - 1);
      } else {
        // Apply CUB/SC correction to the base installment value
        correctedInstallment = applyCubCompoundInterest(installmentsValue, 1, month);
      }
      
      monthlyPayment += correctedInstallment;
      descriptions.push("Parcela");
    }
    
    // Reinforcement payment with compound interest applied
    if (reinforcementMonths.includes(month)) {
      let correctedReinforcement = reinforcementsValue;
      
      if (correctionMode === "manual") {
        // Apply compound interest to the base reinforcement value
        correctedReinforcement = applyCompoundInterest(reinforcementsValue, correctionIndex, month - 1);
      } else {
        // Apply CUB/SC correction to the base reinforcement value
        correctedReinforcement = applyCubCompoundInterest(reinforcementsValue, 1, month);
      }
      
      monthlyPayment += correctedReinforcement;
      descriptions.push("Reforço");
    }
    
    // Keys payment (at the last installment) with compound interest applied
    if (month === installmentsCount) {
      let correctedKeysValue = keysValue;
      
      if (correctionMode === "manual") {
        // Apply compound interest to the keys value
        correctedKeysValue = applyCompoundInterest(keysValue, correctionIndex, month - 1);
      } else {
        // Apply CUB/SC correction to the keys value
        correctedKeysValue = applyCubCompoundInterest(keysValue, 1, month);
      }
      
      monthlyPayment += correctedKeysValue;
      descriptions.push("Chaves");
    }
    
    if (monthlyPayment > 0 || month === resaleMonth) {
      totalPaid += monthlyPayment;
      balance -= monthlyPayment;
      
      schedule.push({
        month,
        description: descriptions.join(" + "),
        amount: monthlyPayment,
        balance,
        totalPaid,
        propertyValue: currentPropertyValue
      });
    }
  }
  
  return schedule;
};

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
  
  // Profit is now property value minus what was paid and what is still owed
  const profit = propertyValue - investmentValue - remainingBalance;
  const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
  
  return {
    investmentValue,
    propertyValue,
    profit,
    profitPercentage,
    remainingBalance
  };
};
