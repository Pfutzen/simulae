
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
  // SALDO INICIAL = VALOR DO IMÓVEL - ENTRADA
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
    // NOVA LÓGICA CORRETA:
    // 1. Primeiro aplica a correção monetária sobre o saldo remanescente
    const monthlyCorrection = getMonthlyCorrection(i);
    const correctedBalance = balance * (1 + monthlyCorrection);
    
    // 2. Calcula a parcela do mês (com reforço se necessário)
    const isReinforcementMonth = reinforcementMonths.includes(i);
    let installmentAmount = isReinforcementMonth 
      ? data.installmentsValue + data.reinforcementsValue 
      : data.installmentsValue;
    
    // 3. Se for a última parcela, ajustar para quitar o saldo
    if (i === data.installmentsCount) {
      installmentAmount = correctedBalance; // Quita o saldo restante
    }
    
    // 4. Subtrai a parcela do saldo corrigido
    balance = correctedBalance - installmentAmount;
    
    // 5. Garantir que o saldo não fique negativo
    balance = Math.max(0, balance);

    totalPaid += installmentAmount;

    // Calcular valor do imóvel no mês atual
    const currentPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, i);

    // Melhorar a descrição das parcelas
    let description = `Parcela ${i}`;
    if (isReinforcementMonth) {
      const reinforcementNumber = reinforcementMonths.indexOf(i) + 1;
      description = `Parcela ${i} + Reforço ${reinforcementNumber}`;
    }
    if (i === data.installmentsCount) {
      description = `Parcela ${i} (Quitação)`;
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

  // O saldo final após as chaves (deve ser zero se a última parcela quitou tudo)
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
