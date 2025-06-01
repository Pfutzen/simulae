
import { PaymentType, SimulationFormData } from '@/utils/types';
import { applyCorrectionToBalance, calculatePropertyValueWithFixedRates } from './correctionCalculations';
import { TipoIndice } from '@/types/indices';

/**
 * Functions for payment schedule calculations with Supabase integration
 */

export const calculateInstallmentBalance = (
  previousBalance: number,
  installmentAmount: number,
  correctionMode: TipoIndice,
  monthNumber: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): number => {
  // Usar correção com dados do Supabase
  const correctedBalance = applyCorrectionToBalance(
    previousBalance,
    correctionMode,
    monthNumber,
    mesInicial,
    manualCorrectionIndex
  );
  
  const finalBalance = correctedBalance - installmentAmount;
  
  console.log('=== CÁLCULO SALDO PARCELA (SUPABASE) ===');
  console.log(`Saldo anterior: R$ ${previousBalance.toFixed(2)}`);
  console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
  console.log(`Parcela: R$ ${installmentAmount.toFixed(2)}`);
  console.log(`Saldo final: R$ ${finalBalance.toFixed(2)}`);
  
  return finalBalance;
};

export const calculateFinalKeysAmount = (
  remainingBalance: number,
  correctionMode: TipoIndice,
  monthNumber: number,
  mesInicial: number = 0,
  manualCorrectionIndex: number = 0
): number => {
  // Aplicar correção final usando dados do Supabase
  const correctedKeysAmount = applyCorrectionToBalance(
    remainingBalance,
    correctionMode,
    monthNumber,
    mesInicial,
    manualCorrectionIndex
  );
  
  console.log('=== CÁLCULO VALOR CHAVES (SUPABASE) ===');
  console.log(`Saldo restante: R$ ${remainingBalance.toFixed(2)}`);
  console.log(`Valor chaves: R$ ${correctedKeysAmount.toFixed(2)}`);
  
  return correctedKeysAmount;
};

export const calculateMonthlyPropertyValue = (
  baseValue: number,
  appreciationMode: TipoIndice,
  correctionMode: TipoIndice,
  monthNumber: number,
  mesInicial: number = 0,
  manualAppreciationIndex: number = 0,
  manualCorrectionIndex: number = 0
): number => {
  // Usar função com dados do Supabase
  return calculatePropertyValueWithFixedRates(
    baseValue,
    correctionMode,
    appreciationMode,
    monthNumber,
    mesInicial,
    manualCorrectionIndex,
    manualAppreciationIndex
  );
};

export const validateScheduleIntegrity = (schedule: PaymentType[]): boolean => {
  console.log('=== VALIDAÇÃO INTEGRIDADE CRONOGRAMA (SUPABASE) ===');
  
  // Check if schedule is properly ordered by date
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i].date < schedule[i - 1].date) {
      console.error('Cronograma fora de ordem temporal');
      return false;
    }
  }
  
  // Check if final balance is zero
  const lastPayment = schedule[schedule.length - 1];
  const balanceIsZero = Math.abs(lastPayment.balance) < 0.01;
  
  if (!balanceIsZero) {
    console.error(`Saldo final não é zero: R$ ${lastPayment.balance.toFixed(2)}`);
  }
  
  console.log(`Validação concluída. Saldo final zerado: ${balanceIsZero ? 'SIM' : 'NÃO'}`);
  return balanceIsZero;
};

export const recalculateScheduleWithFixedRates = (
  formData: SimulationFormData
): { isValid: boolean, errors: string[], correctedData: SimulationFormData } => {
  const errors: string[] = [];
  const correctedData = { ...formData };
  
  // Validar se as taxas estão em range razoável
  if (formData.correctionMode === 'MANUAL' && formData.correctionIndex > 5) {
    errors.push(`Taxa manual muito alta: ${formData.correctionIndex}% (máximo recomendado: 5%)`);
  }
  
  // Validar taxa de valorização
  if (formData.appreciationIndex > 10) {
    errors.push(`Taxa de valorização muito alta: ${formData.appreciationIndex}% (máximo recomendado: 10%)`);
  }
  
  console.log('=== CONFIGURAÇÕES CORRIGIDAS (SUPABASE) ===');
  console.log(`Modo correção: ${correctedData.correctionMode}`);
  console.log(`Taxa correção: ${correctedData.correctionIndex}%`);
  console.log(`Taxa valorização: ${correctedData.appreciationIndex}%`);
  
  return {
    isValid: errors.length === 0,
    errors,
    correctedData
  };
};
