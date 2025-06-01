
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
  let balance = data.propertyValue - data.downPaymentValue;

  // Determinar quais meses terão reforços
  let reinforcementMonths: number[] = [];
  let reinforcementDates: Date[] = [];

  if (data.customReinforcementDates && data.customReinforcementDates.length > 0) {
    reinforcementDates = data.customReinforcementDates.map(date => new Date(date));
    reinforcementMonths = reinforcementDates.map(date => {
      const monthsDiff = (date.getFullYear() - startDate.getFullYear()) * 12 + 
                        (date.getMonth() - startDate.getMonth()) + 1;
      return monthsDiff;
    });
  } else {
    reinforcementMonths = getReinforcementMonths(
      data.installmentsCount,
      data.reinforcementFrequency,
      data.finalMonthsWithoutReinforcement
    );
    reinforcementDates = reinforcementMonths.map(month => 
      addMonthsToDate(startDate, month - 1)
    );
  }

  // CORREÇÃO: Função para obter taxa de correção CUB FIXA
  const getMonthlyCorrection = () => {
    if (data.correctionMode === "manual" && data.correctionIndex > 0) {
      return data.correctionIndex / 100;
    } else if (data.correctionMode === "cub") {
      // CORREÇÃO: Taxa CUB média fixa de 0,38% ao mês
      return 0.0038;
    }
    return 0;
  };

  // CORREÇÃO: Função para calcular valor do imóvel com taxa FIXA de valorização
  const calculatePropertyValue = (monthNumber: number) => {
    // CORREÇÃO: Aplicar correção CUB constante + valorização constante
    const monthlyCorrection = getMonthlyCorrection();
    const correctionFactor = Math.pow(1 + monthlyCorrection, monthNumber);
    const appreciationFactor = Math.pow(1 + data.appreciationIndex / 100, monthNumber);
    
    const finalValue = data.propertyValue * correctionFactor * appreciationFactor;
    
    console.log(`=== CÁLCULO VALOR IMÓVEL MÊS ${monthNumber} ===`);
    console.log(`Valor base: R$ ${data.propertyValue.toFixed(2)}`);
    console.log(`Taxa correção mensal: ${(monthlyCorrection * 100).toFixed(4)}%`);
    console.log(`Taxa valorização mensal: ${data.appreciationIndex}%`);
    console.log(`Fator correção (${monthNumber} meses): ${correctionFactor.toFixed(6)}`);
    console.log(`Fator valorização (${monthNumber} meses): ${appreciationFactor.toFixed(6)}`);
    console.log(`Valor final: R$ ${finalValue.toFixed(2)}`);
    
    return finalValue;
  };

  let keysAmount = data.keysValue;
  const monthlyCorrection = getMonthlyCorrection();

  // CORREÇÃO: Parcelas mensais com cálculos corrigidos
  for (let i = 1; i <= data.installmentsCount; i++) {
    // 1. CORREÇÃO: Aplicar correção FIXA ao saldo devedor
    const correctedBalance = balance * (1 + monthlyCorrection);
    
    console.log(`=== CÁLCULO SALDO MÊS ${i} ===`);
    console.log(`Saldo anterior: R$ ${balance.toFixed(2)}`);
    console.log(`Taxa correção: ${(monthlyCorrection * 100).toFixed(4)}%`);
    console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
    
    // 2. Verificar se é mês de reforço
    const isReinforcementMonth = reinforcementMonths.includes(i);
    
    // 3. CORREÇÃO: Calcular parcela com correção acumulada FIXA
    const baseParcela = data.installmentsValue;
    const correctionFactor = Math.pow(1 + monthlyCorrection, i);
    
    const reinforcementValue = isReinforcementMonth 
      ? data.reinforcementsValue * correctionFactor
      : 0;
    
    let correctedInstallment = baseParcela * correctionFactor + reinforcementValue;
    
    console.log(`Parcela base: R$ ${baseParcela.toFixed(2)}`);
    console.log(`Fator correção acumulada: ${correctionFactor.toFixed(6)}`);
    console.log(`Parcela corrigida: R$ ${(baseParcela * correctionFactor).toFixed(2)}`);
    console.log(`Reforço: R$ ${reinforcementValue.toFixed(2)}`);
    console.log(`Total parcela: R$ ${correctedInstallment.toFixed(2)}`);
    
    // 4. Última parcela = saldo restante vai para as chaves
    if (i === data.installmentsCount) {
      keysAmount = correctedBalance;
      correctedInstallment = 0;
      balance = 0;
    } else {
      // 5. CORREÇÃO: Novo saldo = saldo corrigido - parcela
      balance = correctedBalance - correctedInstallment;
    }
    
    console.log(`Novo saldo: R$ ${balance.toFixed(2)}`);
    
    if (i < data.installmentsCount) {
      totalPaid += correctedInstallment;

      // CORREÇÃO: Calcular valor do imóvel com valorização FIXA
      const currentPropertyValue = calculatePropertyValue(i);

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
        reinforcementValue
      });

      currentDate = addMonthsToDate(currentDate, 1);
    }
  }

  // CORREÇÃO: Chaves com valor corrigido
  totalPaid += keysAmount;
  const finalPropertyValue = calculatePropertyValue(data.installmentsCount + 1);

  schedule.push({
    date: deliveryDate,
    description: "Chaves",
    amount: keysAmount,
    balance: 0,
    totalPaid,
    propertyValue: finalPropertyValue,
    month: data.installmentsCount + 1,
    reinforcementValue: 0
  });

  console.log('=== RESUMO CORREÇÕES APLICADAS ===');
  console.log(`Taxa correção CUB fixa: ${(monthlyCorrection * 100).toFixed(4)}%`);
  console.log(`Taxa valorização fixa: ${data.appreciationIndex}%`);
  console.log(`Total pago: R$ ${totalPaid.toFixed(2)}`);
  console.log(`Valor final imóvel: R$ ${finalPropertyValue.toFixed(2)}`);

  return schedule;
};
