
import { addMonths as addMonthsToDate } from 'date-fns';
import { SimulationFormData, PaymentType } from './types';
import { getReinforcementMonths } from './calculationHelpers';
import { CUB_CORRECTION_DATA } from './correctionData';

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
      addMonthsToDate(startDate, month - 1)
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
