
// Utility functions for real estate calculations

export type PaymentType = {
  month: number;
  description: string;
  amount: number;
  balance: number;
  correction: number;
  totalPaid: number;
  propertyValue: number;
};

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
  correctionIndex: number; // Monthly correction index (e.g., CUB)
  appreciationIndex: number; // Monthly property appreciation
  resaleMonth: number; // Desired month for early resale
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

// Generate payment schedule
export const generatePaymentSchedule = (data: SimulationFormData): PaymentType[] => {
  const {
    propertyValue,
    downPaymentValue,
    downPaymentPercentage,
    installmentsValue,
    installmentsCount,
    reinforcementsValue,
    reinforcementFrequency,
    keysValue,
    correctionIndex,
    appreciationIndex,
    resaleMonth
  } = data;

  const schedule: PaymentType[] = [];
  let totalPaid = 0;
  let currentPropertyValue = propertyValue;
  let balance = propertyValue;
  
  // Month 0: Down payment
  if (downPaymentValue > 0) {
    totalPaid += downPaymentValue;
    balance -= downPaymentValue;
    
    schedule.push({
      month: 0,
      description: "Entrada",
      amount: downPaymentValue,
      balance,
      correction: 0,
      totalPaid,
      propertyValue: currentPropertyValue
    });
  }

  // Calculate payments for each month
  for (let month = 1; month <= Math.max(installmentsCount, resaleMonth); month++) {
    let monthlyPayment = 0;
    const descriptions: string[] = [];
    
    // Apply monthly correction to property value
    currentPropertyValue *= (1 + appreciationIndex / 100);
    
    // Apply correction to remaining balance
    const monthlyCorrection = balance * (correctionIndex / 100);
    balance += monthlyCorrection;
    
    // Regular installment payment
    if (month <= installmentsCount) {
      monthlyPayment += installmentsValue;
      descriptions.push("Parcela");
    }
    
    // Reinforcement payment
    if (reinforcementFrequency > 0 && month % reinforcementFrequency === 0 && month < installmentsCount) {
      monthlyPayment += reinforcementsValue;
      descriptions.push("Reforço");
    }
    
    // Keys payment (at the last installment)
    if (month === installmentsCount) {
      monthlyPayment += keysValue;
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
        correction: monthlyCorrection,
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
} => {
  const resaleData = schedule.find(item => item.month === resaleMonth);
  
  if (!resaleData) {
    return {
      investmentValue: 0,
      propertyValue: 0,
      profit: 0,
      profitPercentage: 0
    };
  }
  
  const investmentValue = resaleData.totalPaid;
  const propertyValue = resaleData.propertyValue;
  const profit = propertyValue - investmentValue;
  const profitPercentage = (profit / investmentValue) * 100;
  
  return {
    investmentValue,
    propertyValue,
    profit,
    profitPercentage
  };
};
