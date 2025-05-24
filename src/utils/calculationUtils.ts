
export type CorrectionMode = "manual" | "cub";

export interface PaymentType {
  month: number;
  description: string;
  amount: number;
  balance: number;
  totalPaid: number;
  propertyValue: number;
  date?: Date; // New field for payment date
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
  rentalPercentage?: number;
  startDate?: Date; // Calculated automatically from valuation date
  deliveryDate?: Date; // When user wants to receive keys
  valuationDate?: Date; // New field - when property was valued
  customReinforcementDates?: Date[]; // New field for custom reinforcement dates
}

// CUB correction data for the last 12 months
export interface CubCorrectionItem {
  month: number;
  description: string;
  percentage: number;
}

export const CUB_CORRECTION_DATA: CubCorrectionItem[] = [
  { month: 1, description: "Maio/2024", percentage: 0.42 },
  { month: 2, description: "Abril/2024", percentage: 0.38 },
  { month: 3, description: "Março/2024", percentage: 0.45 },
  { month: 4, description: "Fevereiro/2024", percentage: 0.51 },
  { month: 5, description: "Janeiro/2024", percentage: 0.63 },
  { month: 6, description: "Dezembro/2023", percentage: 0.58 },
  { month: 7, description: "Novembro/2023", percentage: 0.47 },
  { month: 8, description: "Outubro/2023", percentage: 0.39 },
  { month: 9, description: "Setembro/2023", percentage: 0.43 },
  { month: 10, description: "Agosto/2023", percentage: 0.41 },
  { month: 11, description: "Julho/2023", percentage: 0.44 },
  { month: 12, description: "Junho/2023", percentage: 0.40 }
];

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
 * Calculate the start date for installments based on valuation date
 * FIXED: First installment is in the month AFTER valuation (entrada is paid in valuation month)
 * @param valuationDate - When the property was valued (and entrada is paid)
 * @returns The calculated start date for first installment (month after valuation)
 */
export const calculateStartDateFromValuation = (valuationDate: Date): Date => {
  const startDate = new Date(valuationDate);
  // First installment is in the month AFTER valuation date (entrada paid in valuation month)
  startDate.setMonth(startDate.getMonth() + 1);
  return startDate;
};

/**
 * Calculate the start date based on delivery date and installments count
 * FIXED: Accounts for entrada being paid before first installment
 * @param deliveryDate - When the property should be delivered
 * @param installmentsCount - Number of installments
 * @returns The calculated start date for first installment
 */
export const calculateStartDateFromDelivery = (deliveryDate: Date, installmentsCount: number): Date => {
  const startDate = new Date(deliveryDate);
  // Subtract the number of installments plus 1 month for keys payment
  // This gives us the month when first installment should be paid
  startDate.setMonth(startDate.getMonth() - (installmentsCount + 1));
  return startDate;
};

/**
 * Calculate the delivery date based on start date and installments count
 * @param startDate - When the first installment should be paid
 * @param installmentsCount - Number of installments
 * @returns The calculated delivery date
 */
export const calculateDeliveryDateFromStart = (startDate: Date, installmentsCount: number): Date => {
  const deliveryDate = new Date(startDate);
  // Add the number of installments plus 1 month for keys payment
  deliveryDate.setMonth(deliveryDate.getMonth() + installmentsCount + 1);
  return deliveryDate;
};

/**
 * Generates a payment schedule based on the provided form data.
 * FIXED: Proper date logic - entrada in valuation month, first installment in next month
 *
 * @param {SimulationFormData} formData - The data used to generate the payment schedule.
 * @returns {PaymentType[]} The generated payment schedule.
 */
export const generatePaymentSchedule = (formData: SimulationFormData): PaymentType[] => {
  const schedule: PaymentType[] = [];
  let currentBalance = formData.propertyValue - formData.downPaymentValue;
  let totalPaid = formData.downPaymentValue;
  let propertyValue = formData.propertyValue;
  let correctionFactor = 1;
  
  // Calculate valuation/entrada date and start date for first installment
  let valuationDate: Date;
  let firstInstallmentDate: Date;
  
  if (formData.valuationDate) {
    valuationDate = formData.valuationDate;
    firstInstallmentDate = calculateStartDateFromValuation(formData.valuationDate);
  } else if (formData.deliveryDate) {
    firstInstallmentDate = calculateStartDateFromDelivery(formData.deliveryDate, formData.installmentsCount);
    valuationDate = new Date(firstInstallmentDate);
    valuationDate.setMonth(firstInstallmentDate.getMonth() - 1); // Entrada in previous month
  } else if (formData.startDate) {
    firstInstallmentDate = formData.startDate;
    valuationDate = new Date(firstInstallmentDate);
    valuationDate.setMonth(firstInstallmentDate.getMonth() - 1); // Entrada in previous month
  } else {
    // Fallback to today for backward compatibility
    valuationDate = new Date();
    firstInstallmentDate = new Date();
    firstInstallmentDate.setMonth(valuationDate.getMonth() + 1);
  }
  
  // Initial down payment (entrada) - paid in valuation month
  schedule.push({
    month: 0,
    description: "Entrada",
    amount: formData.downPaymentValue,
    balance: currentBalance,
    totalPaid: totalPaid,
    propertyValue: propertyValue,
    date: valuationDate
  });
  
  // Calculate reinforcement months and dates
  const reinforcementMonths = getReinforcementMonths(
    formData.installmentsCount,
    formData.reinforcementFrequency,
    formData.finalMonthsWithoutReinforcement
  );
  
  // Create a map of reinforcement dates
  const reinforcementDateMap = new Map<number, Date>();
  
  if (formData.customReinforcementDates && formData.customReinforcementDates.length > 0) {
    // Use custom dates if provided
    formData.customReinforcementDates.forEach((date, index) => {
      if (index < reinforcementMonths.length) {
        reinforcementDateMap.set(reinforcementMonths[index], date);
      }
    });
  } else {
    // Generate automatic dates based on frequency
    reinforcementMonths.forEach(month => {
      const reinforcementDate = new Date(firstInstallmentDate);
      reinforcementDate.setMonth(firstInstallmentDate.getMonth() + month - 1); // month-1 because month 1 is first installment
      reinforcementDateMap.set(month, reinforcementDate);
    });
  }
  
  // Initial values (not corrected)
  let baseInstallmentAmount = formData.installmentsValue;
  let baseReinforcementAmount = formData.reinforcementsValue;
  let baseKeysValue = formData.keysValue;
  
  for (let month = 1; month <= formData.installmentsCount; month++) {
    let monthlyCorrection = 0;
    let correctionPercentage = 0;
    
    // Calculate payment date for this month
    const paymentDate = new Date(firstInstallmentDate);
    paymentDate.setMonth(firstInstallmentDate.getMonth() + month - 1); // month-1 because month 1 is first installment
    
    // Calculate monthly correction percentage
    if (formData.correctionMode === "manual") {
      correctionPercentage = formData.correctionIndex / 100;
    } else if (formData.correctionMode === "cub") {
      const cubIndex = (month - 1) % 12;
      correctionPercentage = CUB_CORRECTION_DATA[cubIndex].percentage / 100;
    }
    
    // Update the correction factor
    correctionFactor *= (1 + correctionPercentage);
    
    // Apply correction to current balance
    monthlyCorrection = currentBalance * correctionPercentage;
    currentBalance += monthlyCorrection;
    propertyValue += propertyValue * (formData.appreciationIndex / 100);
    
    // Calculate corrected installment for this month
    const correctedInstallmentAmount = baseInstallmentAmount * correctionFactor;
    
    // Start with the corrected installment amount
    let paymentAmount = correctedInstallmentAmount;
    let description = `Parcela (${month})`;
    
    // Check if it's a reinforcement month and add the corrected reinforcement
    if (reinforcementMonths.includes(month)) {
      const correctedReinforcementAmount = baseReinforcementAmount * correctionFactor;
      paymentAmount += correctedReinforcementAmount;
      description = `Parcela + Reforço (${month})`;
    }
    
    // Apply the payment
    currentBalance -= paymentAmount;
    totalPaid += paymentAmount;
    
    schedule.push({
      month: month,
      description: description,
      amount: paymentAmount,
      balance: currentBalance > 0 ? currentBalance : 0,
      totalPaid: totalPaid,
      propertyValue: propertyValue > 0 ? propertyValue : 0,
      date: paymentDate
    });
  }
  
  // Add keys payment (also corrected)
  const correctedKeysValue = baseKeysValue * correctionFactor;
  totalPaid += correctedKeysValue;
  
  // Keys payment date - use deliveryDate if available, otherwise calculate
  const keysDate = formData.deliveryDate || (() => {
    const calculated = new Date(firstInstallmentDate);
    calculated.setMonth(firstInstallmentDate.getMonth() + formData.installmentsCount);
    return calculated;
  })();
  
  schedule.push({
    month: formData.installmentsCount + 1,
    description: "Chaves",
    amount: correctedKeysValue,
    balance: 0,
    totalPaid: totalPaid,
    propertyValue: propertyValue,
    date: keysDate
  });
  
  return schedule;
};

/**
 * Calculates resale profit based on a payment schedule and a resale month.
 * FIXED: Properly calculates profitPercentage based on totalPaid (investment) not property value
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
  
  const investmentValue = resaleData.totalPaid; // Total amount invested by buyer until resale
  const propertyValue = resaleData.propertyValue; // Property value at resale month
  const remainingBalance = resaleData.balance; // Remaining debt
  const profit = propertyValue - investmentValue - remainingBalance; // Net profit
  
  // FIXED: Calculate profitPercentage based on investmentValue (total paid), not property value
  const profitPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
  
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
 * FIXED: Properly calculates ROI based on totalPaid (investment) not property value
 * FIXED: Correctly identifies different months for different strategies
 *
 * @param {PaymentType[]} schedule - The payment schedule.
 * @returns {{ bestProfitMonth: number; maxProfit: number; maxProfitPercentage: number; bestRoiMonth: number; maxRoi: number; maxRoiProfit: number; earlyMonth?: number; earlyProfit?: number; earlyProfitPercentage?: number; }} An object containing the best month for resale based on maximum profit and ROI.
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
  
  // First pass: Find best profit and best ROI months (separately)
  for (let i = 1; i < schedule.length; i++) {
    const entry = schedule[i];
    const investmentValue = entry.totalPaid; // Total paid by buyer until this month
    const propertyValue = entry.propertyValue;
    const remainingBalance = entry.balance;
    
    // Profit calculation: property value minus total investment minus remaining balance
    const profit = propertyValue - investmentValue - remainingBalance;
    
    // FIXED: ROI calculation based on investmentValue (totalPaid), not property value
    const roiPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
    
    // Check for best absolute profit (highest absolute value)
    if (profit > maxProfit) {
      maxProfit = profit;
      maxProfitPercentage = roiPercentage; // Store the ROI for this specific month
      bestProfitMonth = entry.month;
    }
    
    // Check for best ROI percentage (only if profit is positive)
    // This should be SEPARATE from best profit - different month could have better ROI
    if (profit > 0 && roiPercentage > maxRoi) {
      maxRoi = roiPercentage;
      maxRoiProfit = profit;
      bestRoiMonth = entry.month;
    }
  }
  
  // Second pass: Find "early month" with good return
  // We'll look for months that have at least 70% of the max ROI but earlier in the timeline
  const earlyThreshold = maxRoi * 0.7; // 70% of the maximum ROI is considered a good early return
  
  for (let i = 1; i < schedule.length; i++) {
    const entry = schedule[i];
    const investmentValue = entry.totalPaid; // Total paid by buyer until this month
    const propertyValue = entry.propertyValue;
    const remainingBalance = entry.balance;
    
    const profit = propertyValue - investmentValue - remainingBalance;
    
    // FIXED: ROI calculation based on investmentValue (totalPaid), not property value
    const roiPercentage = investmentValue > 0 ? (profit / investmentValue) * 100 : 0;
    
    // Find the earliest month that has at least 70% of the maximum ROI
    if (profit > 0 && roiPercentage >= earlyThreshold) {
      earlyMonth = entry.month;
      earlyProfit = profit;
      earlyProfitPercentage = roiPercentage;
      break; // Stop at the first month that meets the criteria
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
