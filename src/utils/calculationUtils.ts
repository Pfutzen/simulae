import { format } from 'date-fns';
import { addMonths as addMonthsToDate } from 'date-fns';

export type CorrectionMode = "manual" | "igpm" | "ipca";

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
  rentalPercentage: number;
  startDate?: Date;
  deliveryDate?: Date;
  valuationDate?: Date;
  customReinforcementDates?: Date[];
}

export interface PaymentType {
  date: Date;
  description: string;
  amount: number;
  balance: number;
  totalPaid: number;
  propertyValue: number;
}

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateValue = (percentage: number, total: number): number => {
  return (percentage / 100) * total;
};

export const calculateTotalPercentage = (data: SimulationFormData): number => {
  return (
    data.downPaymentPercentage +
    data.installmentsPercentage +
    data.reinforcementsPercentage +
    data.keysPercentage
  );
};

export const calculateMaxReinforcementCount = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
): number => {
  const monthsWithReinforcement =
    installmentsCount - finalMonthsWithoutReinforcement;
  return Math.floor(monthsWithReinforcement / reinforcementFrequency);
};

export const getReinforcementMonths = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
): number[] => {
  const months: number[] = [];
  let month = reinforcementFrequency;
  while (
    month <= installmentsCount - finalMonthsWithoutReinforcement &&
    months.length < 100 // Avoid infinite loops
  ) {
    months.push(month);
    month += reinforcementFrequency;
  }
  return months;
};

export const calculateStartDateFromDelivery = (
  deliveryDate: Date,
  installmentsCount: number
): Date => {
  return addMonthsToDate(deliveryDate, -installmentsCount);
};

export const calculateDeliveryDateFromStart = (
  startDate: Date,
  installmentsCount: number
): Date => {
  return addMonthsToDate(startDate, installmentsCount);
};

export const calculateStartDateFromValuation = (valuationDate: Date): Date => {
  return addMonthsToDate(valuationDate, 1);
};

export const generatePaymentSchedule = (data: SimulationFormData): PaymentType[] => {
  const schedule: PaymentType[] = [];
  
  if (!data.valuationDate || !data.deliveryDate || !data.startDate) {
    return schedule;
  }

  const valuationDate = new Date(data.valuationDate);
  const deliveryDate = new Date(data.deliveryDate);
  const startDate = new Date(data.startDate);

  // Entrada
  schedule.push({
    date: valuationDate,
    description: "Entrada",
    amount: data.downPaymentValue,
    balance: data.propertyValue - data.downPaymentValue,
    totalPaid: data.downPaymentValue,
    propertyValue: data.propertyValue
  });

  let currentDate = new Date(startDate);
  let totalPaid = data.downPaymentValue;
  let balance = data.propertyValue - data.downPaymentValue;

  // Determinar quais meses terão reforços
  let reinforcementMonths: number[] = [];
  let reinforcementDates: Date[] = [];

  if (data.customReinforcementDates && data.customReinforcementDates.length > 0) {
    // Usar datas personalizadas
    reinforcementDates = data.customReinforcementDates.map(date => new Date(date));
    // Calcular os meses correspondentes às datas personalizadas
    reinforcementMonths = reinforcementDates.map(date => {
      const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                        (date.getMonth() - startDate.getMonth()) + 1;
      return monthsDiff;
    });
  } else {
    // Usar frequência automática
    reinforcementMonths = getReinforcementMonths(
      data.installmentsCount,
      data.reinforcementFrequency,
      data.finalMonthsWithoutReinforcement
    );
    reinforcementDates = reinforcementMonths.map(month => 
      addMonths(startDate, month - 1)
    );
  }

  // Parcelas mensais
  for (let i = 1; i <= data.installmentsCount; i++) {
    const isReinforcementMonth = reinforcementMonths.includes(i);
    const installmentAmount = isReinforcementMonth 
      ? data.installmentsValue + data.reinforcementsValue 
      : data.installmentsValue;

    // Aplicar correção baseada no índice escolhido
    let correctedAmount = installmentAmount;
    if (data.correctionMode === "manual" && data.correctionIndex > 0) {
      correctedAmount = installmentAmount * Math.pow(1 + data.correctionIndex / 100, i - 1);
    } else if (data.correctionMode === "igpm") {
      // Aplicar IGP-M (simulado como 0.8% ao mês para exemplo)
      correctedAmount = installmentAmount * Math.pow(1.008, i - 1);
    } else if (data.correctionMode === "ipca") {
      // Aplicar IPCA (simulado como 0.4% ao mês para exemplo)
      correctedAmount = installmentAmount * Math.pow(1.004, i - 1);
    }

    totalPaid += correctedAmount;
    balance = Math.max(0, data.propertyValue - totalPaid);

    // Calcular valor do imóvel no mês atual
    const currentPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, i);

    const paymentType = isReinforcementMonth ? `Parcela + Reforço` : "Parcela";

    schedule.push({
      date: new Date(currentDate),
      description: paymentType,
      amount: correctedAmount,
      balance,
      totalPaid,
      propertyValue: currentPropertyValue
    });

    currentDate = addMonthsToDate(currentDate, 1);
  }

  // Chaves
  const finalPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, data.installmentsCount);
  totalPaid += data.keysValue;

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: data.keysValue,
    balance: Math.max(0, data.propertyValue - totalPaid),
    totalPaid,
    propertyValue: finalPropertyValue
  });

  return schedule;
};

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
    const resaleResults = calculateResaleProfit(schedule.slice(0, i), i);

    if (resaleResults.profit > maxProfit) {
      maxProfit = resaleResults.profit;
      maxProfitPercentage = resaleResults.profitPercentage;
      bestProfitMonth = i;
    }

		const roi = (resaleResults.profit / resaleResults.investmentValue) / i;
		if (roi > maxRoi) {
			maxRoi = roi;
			maxRoiProfit = resaleResults.profit;
			bestRoiMonth = i;
		}

    if (i <= 12) {
      if (earlyProfit === undefined || resaleResults.profit > earlyProfit) {
        earlyMonth = i;
        earlyProfit = resaleResults.profit;
        earlyProfitPercentage = resaleResults.profitPercentage;
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

export const calculateRentalEstimate = (propertyValue: number, rentalPercentage: number) => {
  const rentalEstimate = propertyValue * (rentalPercentage / 100);
  const annualRentalReturn = (rentalEstimate * 12) / propertyValue * 100;

  return {
    rentalEstimate,
    annualRentalReturn
  };
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
