
import { TipoIndice } from '@/types/indices';
import { 
  carregarIndicesDoSupabase,
  obterTaxaMensalSupabase, 
  calcularSaldoComIndiceSupabase, 
  calcularValorCorrigidoSupabase 
} from '@/utils/calculosIndicesSupabase';

/**
 * Functions for monetary correction calculations with Supabase integration
 */

export const getMonthlyCorrection = async (
  monthNumber: number,
  correctionMode: TipoIndice,
  manualCorrectionIndex: number = 0,
  mesInicial: number = 0
): Promise<number> => {
  // Garantir que os índices foram carregados
  await carregarIndicesDoSupabase();
  
  // Usar função do Supabase para obter taxa dinâmica
  return obterTaxaMensalSupabase(
    correctionMode,
    monthNumber,
    mesInicial,
    manualCorrectionIndex
  );
};

export const applyCorrectionToBalance = async (
  balance: number, 
  correctionMode: TipoIndice,
  monthNumber: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): Promise<number> => {
  // Garantir que os índices foram carregados
  await carregarIndicesDoSupabase();
  
  // Usar função do Supabase para aplicar correção com taxa dinâmica
  return calcularSaldoComIndiceSupabase(
    balance,
    correctionMode,
    monthNumber,
    mesInicial,
    manualCorrectionIndex
  );
};

export const applyCorrectionToInstallment = async (
  baseInstallment: number,
  correctionMode: TipoIndice,
  monthNumber: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): Promise<number> => {
  // Garantir que os índices foram carregados
  await carregarIndicesDoSupabase();
  
  // Aplicar correção acumulada usando taxas dinâmicas do Supabase
  let correctedInstallment = baseInstallment;
  
  for (let mes = 0; mes < monthNumber; mes++) {
    const taxa = obterTaxaMensalSupabase(
      correctionMode,
      mes,
      mesInicial,
      manualCorrectionIndex
    );
    correctedInstallment *= (1 + taxa);
  }
  
  console.log('=== CORREÇÃO DE PARCELA (SUPABASE) ===');
  console.log(`Parcela base: R$ ${baseInstallment.toFixed(2)}`);
  console.log(`Meses: ${monthNumber}`);
  console.log(`Parcela corrigida: R$ ${correctedInstallment.toFixed(2)}`);
  
  return correctedInstallment;
};

export const calculateAccumulatedCorrection = async (
  baseValue: number,
  correctionMode: TipoIndice,
  months: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): Promise<number> => {
  // Garantir que os índices foram carregados
  await carregarIndicesDoSupabase();
  
  // Usar função do Supabase para correção acumulada
  let valorAcumulado = baseValue;
  
  for (let mes = 0; mes < months; mes++) {
    const taxa = obterTaxaMensalSupabase(
      correctionMode,
      mes,
      mesInicial,
      manualCorrectionIndex
    );
    valorAcumulado *= (1 + taxa);
  }
  
  console.log('=== CORREÇÃO ACUMULADA (SUPABASE) ===');
  console.log(`Valor base: R$ ${baseValue.toFixed(2)}`);
  console.log(`Período: ${months} meses`);
  console.log(`Valor corrigido: R$ ${valorAcumulado.toFixed(2)}`);
  
  return valorAcumulado;
};

export const calculatePropertyValueWithFixedRates = async (
  baseValue: number,
  correctionMode: TipoIndice,
  appreciationMode: TipoIndice,
  months: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0,
  manualAppreciationIndex: number = 0
): Promise<number> => {
  // Garantir que os índices foram carregados
  await carregarIndicesDoSupabase();
  
  // Usar função do Supabase para cálculo com taxas dinâmicas
  return calcularValorCorrigidoSupabase(
    baseValue,
    correctionMode,
    appreciationMode,
    months,
    mesInicial,
    manualCorrectionIndex,
    manualAppreciationIndex
  );
};

export const validateCorrectionCalculation = async (
  initialBalance: number,
  correctionMode: TipoIndice,
  installmentAmount: number,
  monthNumber: number = 0,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): Promise<{ correctedBalance: number, finalBalance: number, isValid: boolean }> => {
  const correctedBalance = await applyCorrectionToBalance(
    initialBalance, 
    correctionMode, 
    monthNumber, 
    mesInicial,
    manualCorrectionIndex
  );
  
  const finalBalance = correctedBalance - installmentAmount;
  
  console.log('=== VALIDAÇÃO DE CORREÇÃO (SUPABASE) ===');
  console.log(`Saldo inicial: R$ ${initialBalance.toFixed(2)}`);
  console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
  console.log(`Parcela: R$ ${installmentAmount.toFixed(2)}`);
  console.log(`Saldo final: R$ ${finalBalance.toFixed(2)}`);
  
  return {
    correctedBalance,
    finalBalance,
    isValid: correctedBalance > initialBalance // Validação básica
  };
};
