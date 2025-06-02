
import { addMonths as addMonthsToDate } from 'date-fns';
import { SimulationFormData, PaymentType } from './types';
import { ConfiguracaoIndices } from '@/types/indices';
import { getReinforcementMonths } from './calculationHelpers';
import { 
  carregarIndicesDoSupabase,
  obterTaxaMensalSupabase, 
  calcularValorCorrigidoSupabase, 
  calcularSaldoComIndiceSupabase 
} from './calculosIndicesSupabase';

export const generatePaymentScheduleComIndicesSupabase = async (
  data: SimulationFormData, 
  configIndices: ConfiguracaoIndices
): Promise<PaymentType[]> => {
  const schedule: PaymentType[] = [];
  
  if (!data.valuationDate || !data.deliveryDate || !data.startDate) {
    return schedule;
  }

  // Carregar índices do Supabase primeiro
  await carregarIndicesDoSupabase();

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

  let keysAmount = data.keysValue;

  console.log('=== INICIANDO CRONOGRAMA COM ÍNDICES DO SUPABASE ===');
  console.log(`Correção: ${configIndices.correcaoMonetaria.tipo}`);
  console.log(`Valorização: ${configIndices.valorizacao.tipo}`);
  console.log(`Mês inicial: ${configIndices.mesInicial}`);

  // Parcelas mensais com cálculos usando índices do Supabase
  for (let i = 1; i <= data.installmentsCount; i++) {
    // 1. Aplicar correção usando índice específico do mês
    const correctedBalance = calcularSaldoComIndiceSupabase(
      balance,
      configIndices.correcaoMonetaria.tipo,
      i - 1, // Mês de simulação (0-indexed)
      configIndices.mesInicial,
      configIndices.correcaoMonetaria.valorManual
    );
    
    // 2. Verificar se é mês de reforço
    const isReinforcementMonth = reinforcementMonths.includes(i);
    
    // 3. Calcular parcela com correção acumulada usando índices
    const baseParcela = data.installmentsValue;
    
    // Taxa acumulada até este mês
    let correcaoAcumulada = 1;
    for (let mes = 0; mes < i; mes++) {
      const taxaMes = obterTaxaMensalSupabase(
        configIndices.correcaoMonetaria.tipo,
        mes,
        configIndices.mesInicial,
        configIndices.correcaoMonetaria.valorManual
      );
      correcaoAcumulada *= (1 + taxaMes);
    }
    
    const reinforcementValue = isReinforcementMonth 
      ? data.reinforcementsValue * correcaoAcumulada
      : 0;
    
    let correctedInstallment = baseParcela * correcaoAcumulada + reinforcementValue;
    
    console.log(`=== MÊS ${i} (SUPABASE) ===`);
    console.log(`Saldo anterior: R$ ${balance.toFixed(2)}`);
    console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
    console.log(`Parcela base: R$ ${baseParcela.toFixed(2)}`);
    console.log(`Correção acumulada: ${((correcaoAcumulada - 1) * 100).toFixed(4)}%`);
    console.log(`Parcela corrigida: R$ ${(baseParcela * correcaoAcumulada).toFixed(2)}`);
    console.log(`Reforço: R$ ${reinforcementValue.toFixed(2)}`);
    console.log(`Total parcela: R$ ${correctedInstallment.toFixed(2)}`);
    
    // 4. Última parcela = saldo restante vai para as chaves
    if (i === data.installmentsCount) {
      keysAmount = correctedBalance;
      correctedInstallment = 0;
      balance = 0;
    } else {
      // 5. Novo saldo = saldo corrigido - parcela
      balance = correctedBalance - correctedInstallment;
    }
    
    console.log(`Novo saldo: R$ ${balance.toFixed(2)}`);
    
    if (i < data.installmentsCount) {
      totalPaid += correctedInstallment;

      // Calcular valor do imóvel com valorização usando índices
      const currentPropertyValue = calcularValorCorrigidoSupabase(
        data.propertyValue,
        configIndices.correcaoMonetaria.tipo,
        configIndices.valorizacao.tipo,
        i,
        configIndices.mesInicial,
        configIndices.correcaoMonetaria.valorManual,
        configIndices.valorizacao.valorManual
      );

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

  // Chaves com valor corrigido
  totalPaid += keysAmount;
  const finalPropertyValue = calcularValorCorrigidoSupabase(
    data.propertyValue,
    configIndices.correcaoMonetaria.tipo,
    configIndices.valorizacao.tipo,
    data.installmentsCount + 1,
    configIndices.mesInicial,
    configIndices.correcaoMonetaria.valorManual,
    configIndices.valorizacao.valorManual
  );

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

  console.log('=== RESUMO CRONOGRAMA COM ÍNDICES DO SUPABASE ===');
  console.log(`Total pago: R$ ${totalPaid.toFixed(2)}`);
  console.log(`Valor final imóvel: R$ ${finalPropertyValue.toFixed(2)}`);

  return schedule;
};
