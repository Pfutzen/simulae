
import { addMonths as addMonthsToDate } from 'date-fns';
import { SimulationFormData, PaymentType } from './types';
import { getReinforcementMonths } from './calculationHelpers';
import { 
  CUB_CORRECTION_DATA, 
  getCubCorrectionForDate, 
  isRetroactiveDate,
  calculateHistoricalCorrectionFactor 
} from './correctionData';

export const generatePaymentSchedule = (data: SimulationFormData): PaymentType[] => {
  const schedule: PaymentType[] = [];
  
  if (!data.valuationDate || !data.deliveryDate || !data.startDate) {
    return schedule;
  }

  const valuationDate = new Date(data.valuationDate);
  const deliveryDate = new Date(data.deliveryDate);
  const startDate = new Date(data.startDate);
  
  // Verificar se é uma simulação retroativa
  const isRetroactive = isRetroactiveDate(startDate);

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

  // Calcular fator de correção para cada mês
  const getCorrectionFactor = (monthNumber: number) => {
    const monthDate = addMonthsToDate(startDate, monthNumber - 1);
    
    if (data.correctionMode === "manual" && data.correctionIndex > 0) {
      return Math.pow(1 + data.correctionIndex / 100, monthNumber - 1);
    } else if (data.correctionMode === "cub") {
      if (isRetroactive) {
        // Para simulações retroativas, usar correção histórica acumulada
        return calculateHistoricalCorrectionFactor(startDate, monthDate);
      } else {
        // Para simulações atuais, usar média dos últimos 12 meses
        const avgCubCorrection = CUB_CORRECTION_DATA.reduce((sum, item) => sum + item.percentage, 0) / CUB_CORRECTION_DATA.length;
        return Math.pow(1 + avgCubCorrection / 100, monthNumber - 1);
      }
    }
    return 1; // Sem correção
  };

  // Parcelas mensais
  for (let i = 1; i <= data.installmentsCount; i++) {
    const isReinforcementMonth = reinforcementMonths.includes(i);
    const installmentAmount = isReinforcementMonth 
      ? data.installmentsValue + data.reinforcementsValue 
      : data.installmentsValue;

    // Aplicar correção baseada no índice escolhido
    const correctionFactor = getCorrectionFactor(i);
    const correctedAmount = installmentAmount * correctionFactor;

    totalPaid += correctedAmount;
    balance = Math.max(0, data.propertyValue - totalPaid);

    // Calcular valor do imóvel no mês atual
    let currentPropertyValue: number;
    
    if (isRetroactive && data.correctionMode === "cub") {
      // Para simulações retroativas com CUB, usar correção histórica
      const monthDate = addMonthsToDate(startDate, i - 1);
      const propertyAppreciationFactor = calculateHistoricalCorrectionFactor(startDate, monthDate);
      currentPropertyValue = data.propertyValue * propertyAppreciationFactor;
    } else {
      // Para simulações atuais, usar índice de valorização normal
      currentPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, i);
    }

    // Melhorar a descrição das parcelas
    let description = `Parcela ${i}`;
    if (isReinforcementMonth) {
      const reinforcementNumber = reinforcementMonths.indexOf(i) + 1;
      description = `Parcela ${i} + Reforço ${reinforcementNumber}`;
    }

    schedule.push({
      date: new Date(currentDate),
      description,
      amount: correctedAmount,
      balance,
      totalPaid,
      propertyValue: currentPropertyValue,
      month: i
    });

    currentDate = addMonthsToDate(currentDate, 1);
  }

  // Chaves - aplicar correção também aqui
  const keysCorrectionFactor = getCorrectionFactor(data.installmentsCount + 1);
  const correctedKeysValue = data.keysValue * keysCorrectionFactor;
  
  // Calcular o valor do imóvel no mês das chaves
  let finalPropertyValue: number;
  
  if (isRetroactive && data.correctionMode === "cub") {
    // Para simulações retroativas com CUB, usar correção histórica
    const keysDate = addMonthsToDate(startDate, data.installmentsCount);
    const propertyAppreciationFactor = calculateHistoricalCorrectionFactor(startDate, keysDate);
    finalPropertyValue = data.propertyValue * propertyAppreciationFactor;
  } else {
    // Para simulações atuais, usar índice de valorização normal
    finalPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, data.installmentsCount + 1);
  }
  
  totalPaid += correctedKeysValue;

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: correctedKeysValue,
    balance: Math.max(0, data.propertyValue - totalPaid),
    totalPaid,
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1
  });

  return schedule;
};
