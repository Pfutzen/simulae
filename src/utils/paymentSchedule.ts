
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

  // Calcular fator de correção para cada mês
  const getMonthlyCorrection = (monthNumber: number) => {
    if (data.correctionMode === "manual" && data.correctionIndex > 0) {
      return data.correctionIndex / 100;
    } else if (data.correctionMode === "cub") {
      // Usar o índice CUB do mês correspondente (ciclo de 12 meses)
      const cubIndex = (monthNumber - 1) % 12;
      return CUB_CORRECTION_DATA[cubIndex].percentage / 100;
    }
    return 0; // Sem correção
  };

  // Parcelas mensais
  for (let i = 1; i <= data.installmentsCount; i++) {
    const isReinforcementMonth = reinforcementMonths.includes(i);
    const installmentAmount = isReinforcementMonth 
      ? data.installmentsValue + data.reinforcementsValue 
      : data.installmentsValue;

    totalPaid += installmentAmount;

    // Aplicar a lógica correta do saldo devedor
    // 1. Primeiro subtrai a parcela do saldo anterior
    balance = balance - installmentAmount;
    
    // 2. Depois aplica a correção monetária sobre o saldo reduzido
    // IMPORTANTE: só aplicar correção se não é o último mês
    if (i < data.installmentsCount) {
      const monthlyCorrection = getMonthlyCorrection(i);
      balance = balance * (1 + monthlyCorrection);
    }
    
    // Garantir que o saldo não fique negativo por problemas de arredondamento
    balance = Math.max(0, balance);

    // Calcular valor do imóvel no mês atual
    const currentPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, i);

    // Melhorar a descrição das parcelas
    let description = `Parcela ${i}`;
    if (isReinforcementMonth) {
      const reinforcementNumber = reinforcementMonths.indexOf(i) + 1;
      description = `Parcela ${i} + Reforço ${reinforcementNumber}`;
    }

    schedule.push({
      date: new Date(currentDate),
      description,
      amount: installmentAmount,
      balance,
      totalPaid,
      propertyValue: currentPropertyValue,
      month: i
    });

    currentDate = addMonthsToDate(currentDate, 1);
  }

  // Chaves - usar o valor exato definido pelo usuário
  const keysAmount = data.keysValue;
  
  // Calcular o valor do imóvel no mês das chaves
  const finalPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, data.installmentsCount + 1);
  totalPaid += keysAmount;

  // O saldo final após as chaves
  const finalBalance = Math.max(0, balance - keysAmount);

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: keysAmount,
    balance: finalBalance,
    totalPaid,
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1
  });

  return schedule;
};
