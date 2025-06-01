
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
  // SALDO INICIAL = VALOR DO IMÓVEL - ENTRADA (como na sua planilha)
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

  let keysAmount = data.keysValue; // Valor inicial das chaves

  // Parcelas mensais - EXATAMENTE como na sua planilha
  for (let i = 1; i <= data.installmentsCount; i++) {
    const monthlyCorrection = getMonthlyCorrection(i);
    
    // 1. CORRIGIR O SALDO (como na sua planilha: saldo anterior * (1 + correção))
    const correctedBalance = balance * (1 + monthlyCorrection);
    
    // 2. CALCULAR PARCELA (como na sua planilha: parcela base * (1 + correção)^mês)
    const isReinforcementMonth = reinforcementMonths.includes(i);
    const baseParcela = isReinforcementMonth 
      ? data.installmentsValue + data.reinforcementsValue 
      : data.installmentsValue;
    
    // Parcela corrigida com correção acumulada (como na sua planilha)
    const correctionFactor = Math.pow(1 + monthlyCorrection, i);
    let correctedInstallment = baseParcela * correctionFactor;
    
    // 3. ÚLTIMA PARCELA = SALDO RESTANTE (vai para as chaves)
    if (i === data.installmentsCount) {
      keysAmount = correctedBalance; // O saldo restante vai para as chaves
      correctedInstallment = 0; // Não há parcela, o valor vai direto para chaves
      balance = 0; // Saldo zerado
    } else {
      // 4. NOVO SALDO = SALDO CORRIGIDO - PARCELA (como na sua planilha)
      balance = correctedBalance - correctedInstallment;
    }
    
    // Só adiciona parcela se não for a última (que vai para chaves)
    if (i < data.installmentsCount) {
      totalPaid += correctedInstallment;

      // Calcular valor do imóvel no mês atual
      const currentPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, i);

      // Descrição da parcela
      let description = `Parcela ${i}`;
      if (isReinforcementMonth) {
        const reinforcementNumber = reinforcementMonths.indexOf(i) + 1;
        description = `Parcela ${i} + Reforço ${reinforcementNumber}`;
      }

      schedule.push({
        date: new Date(currentDate),
        description,
        amount: correctedInstallment,
        balance,
        totalPaid,
        propertyValue: currentPropertyValue,
        month: i
      });

      currentDate = addMonthsToDate(currentDate, 1);
    }
  }

  // Chaves - VALOR CORRIGIDO (saldo devedor restante)
  totalPaid += keysAmount;
  
  // Calcular o valor do imóvel no mês das chaves
  const finalPropertyValue = data.propertyValue * Math.pow(1 + data.appreciationIndex / 100, data.installmentsCount + 1);

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: keysAmount,
    balance: 0, // Saldo zerado após as chaves
    totalPaid,
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1
  });

  return schedule;
};
