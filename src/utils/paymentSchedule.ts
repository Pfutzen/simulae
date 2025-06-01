
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
    month: 0,
    reinforcementValue: 0
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

  // Função para obter correção mensal correta
  const getMonthlyCorrection = (monthNumber: number) => {
    if (data.correctionMode === "manual" && data.correctionIndex > 0) {
      // CORREÇÃO: Dividir por 100 para converter percentual em decimal
      return data.correctionIndex / 100;
    } else if (data.correctionMode === "cub") {
      // CORREÇÃO: Usar o índice CUB correto e dividir por 100
      const cubIndex = (monthNumber - 1) % 12;
      return CUB_CORRECTION_DATA[cubIndex].percentage / 100;
    }
    return 0; // Sem correção
  };

  // Função para calcular valorização do imóvel
  const calculatePropertyValue = (monthNumber: number) => {
    // Aplicar correção CUB primeiro, depois valorização
    const correctionFactor = Math.pow(1 + getMonthlyCorrection(monthNumber), monthNumber);
    const appreciationFactor = Math.pow(1 + data.appreciationIndex / 100, monthNumber);
    return data.propertyValue * correctionFactor * appreciationFactor;
  };

  let keysAmount = data.keysValue; // Valor inicial das chaves

  // Parcelas mensais - CORRIGINDO OS CÁLCULOS
  for (let i = 1; i <= data.installmentsCount; i++) {
    const monthlyCorrection = getMonthlyCorrection(i);
    
    // 1. CORRIGIR O SALDO (aplicar correção ao saldo devedor)
    const correctedBalance = balance * (1 + monthlyCorrection);
    
    // 2. VERIFICAR SE É MÊS DE REFORÇO
    const isReinforcementMonth = reinforcementMonths.includes(i);
    
    // 3. CALCULAR PARCELA COM CORREÇÃO ACUMULADA
    const baseParcela = data.installmentsValue;
    
    // CORREÇÃO: Aplicar correção acumulada corretamente
    const correctionFactor = Math.pow(1 + monthlyCorrection, i);
    
    // Calcular o valor do reforço corrigido
    const reinforcementValue = isReinforcementMonth 
      ? data.reinforcementsValue * correctionFactor
      : 0;
    
    // Parcela corrigida
    let correctedInstallment = baseParcela * correctionFactor + reinforcementValue;
    
    // 4. ÚLTIMA PARCELA = SALDO RESTANTE (vai para as chaves)
    if (i === data.installmentsCount) {
      keysAmount = correctedBalance; // O saldo restante vai para as chaves
      correctedInstallment = 0; // Não há parcela, o valor vai direto para chaves
      balance = 0; // Saldo zerado
    } else {
      // 5. NOVO SALDO = SALDO CORRIGIDO - PARCELA
      balance = correctedBalance - correctedInstallment;
    }
    
    // Só adiciona parcela se não for a última (que vai para chaves)
    if (i < data.installmentsCount) {
      totalPaid += correctedInstallment;

      // Calcular valor do imóvel no mês atual (com correção + valorização)
      const currentPropertyValue = calculatePropertyValue(i);

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
        month: i,
        reinforcementValue // Incluir o valor do reforço
      });

      currentDate = addMonthsToDate(currentDate, 1);
    }
  }

  // Chaves - VALOR CORRIGIDO (saldo devedor restante)
  totalPaid += keysAmount;
  
  // Calcular o valor do imóvel no mês das chaves
  const finalPropertyValue = calculatePropertyValue(data.installmentsCount + 1);

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: keysAmount,
    balance: 0, // Saldo zerado após as chaves
    totalPaid,
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1,
    reinforcementValue: 0
  });

  console.log('=== DEBUG CRONOGRAMA ===');
  console.log('Configuração de correção:', data.correctionMode, data.correctionIndex);
  schedule.slice(0, 3).forEach((item, index) => {
    if (index === 0) return; // Pular entrada
    const monthlyCorrection = getMonthlyCorrection(item.month || 1);
    console.log(`Mês ${item.month}: Correção ${(monthlyCorrection * 100).toFixed(4)}%, Saldo: R$ ${item.balance.toFixed(2)}`);
  });

  return schedule;
};
