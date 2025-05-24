
import { format } from 'date-fns';
import { addMonths as addMonthsToDate } from 'date-fns';

export type CorrectionMode = "manual" | "cub";

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
  month?: number;
}

// CUB/SC correction data for the last 12 months
export const CUB_CORRECTION_DATA = [
  { month: 1, description: "Janeiro 2024", percentage: 0.75 },
  { month: 2, description: "Fevereiro 2024", percentage: 0.68 },
  { month: 3, description: "Março 2024", percentage: 0.82 },
  { month: 4, description: "Abril 2024", percentage: 0.71 },
  { month: 5, description: "Maio 2024", percentage: 0.79 },
  { month: 6, description: "Junho 2024", percentage: 0.65 },
  { month: 7, description: "Julho 2024", percentage: 0.73 },
  { month: 8, description: "Agosto 2024", percentage: 0.67 },
  { month: 9, description: "Setembro 2024", percentage: 0.74 },
  { month: 10, description: "Outubro 2024", percentage: 0.69 },
  { month: 11, description: "Novembro 2024", percentage: 0.72 },
  { month: 12, description: "Dezembro 2024", percentage: 0.76 }
];

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

// Helper function to add months (using date-fns)
const addMonths = (date: Date, months: number): Date => {
  return addMonthsToDate(date, months);
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
    propertyValue: data.propertyValue,
    month: 0
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
    } else if (data.correctionMode === "cub") {
      // Aplicar CUB/SC (usar média dos últimos 12 meses)
      const avgCubCorrection = CUB_CORRECTION_DATA.reduce((sum, item) => sum + item.percentage, 0) / CUB_CORRECTION_DATA.length;
      correctedAmount = installmentAmount * Math.pow(1 + avgCubCorrection / 100, i - 1);
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
      propertyValue: currentPropertyValue,
      month: i
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
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1
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
  let bestRentabilityMonth = 0;
  let maxRentability = 0;
  let maxRentabilityProfit = 0;
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
      // Calcula: (Lucro / Valor Investido até o mês) * 100
      const rentabilityPercentage = (profit / investedUpToMonth) * 100;
      
      // Só considerar se a rentabilidade for pelo menos 10%
      if (rentabilityPercentage >= 10 && rentabilityPercentage > maxRentability) {
        maxRentability = rentabilityPercentage;
        maxRentabilityProfit = profit;
        bestRentabilityMonth = i;
      }

      // Estratégia 3: Maior Lucro no Menor Prazo (primeiros 12 meses)
      if (i <= 12) {
        // Só considera se a rentabilidade for pelo menos 30%
        if (rentabilityPercentage >= 30) {
          if (earlyProfit === undefined || profit > earlyProfit) {
            earlyMonth = i;
            earlyProfit = profit;
            earlyProfitPercentage = rentabilityPercentage;
          }
        }
      }
    }
  }

  return {
    bestProfitMonth,
    maxProfit,
    maxProfitPercentage,
    bestRoiMonth: bestRentabilityMonth,
    maxRoi: maxRentability,
    maxRoiProfit: maxRentabilityProfit,
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

export const formatPercentage = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
