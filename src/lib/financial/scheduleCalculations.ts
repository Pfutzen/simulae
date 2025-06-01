
import { PaymentType, SimulationFormData } from '@/utils/types';
import { getMonthlyCorrection, applyCorrectionToBalance, validateCorrectionCalculation, calculatePropertyValueWithFixedRates } from './correctionCalculations';

/**
 * Functions for payment schedule calculations
 */

export const calculateInstallmentBalance = (
  previousBalance: number,
  installmentAmount: number,
  correctionRate: number
): number => {
  // CORREÇÃO: Usar cálculo validado e correto
  const correctedBalance = previousBalance * (1 + correctionRate);
  const finalBalance = correctedBalance - installmentAmount;
  
  console.log('=== CÁLCULO SALDO PARCELA ===');
  console.log(`Saldo anterior: R$ ${previousBalance.toFixed(2)}`);
  console.log(`Taxa correção: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
  console.log(`Parcela: R$ ${installmentAmount.toFixed(2)}`);
  console.log(`Saldo final: R$ ${finalBalance.toFixed(2)}`);
  
  return finalBalance;
};

export const calculateFinalKeysAmount = (
  remainingBalance: number,
  correctionRate: number
): number => {
  // CORREÇÃO: Aplicar correção fixa ao saldo das chaves
  const correctedKeysAmount = applyCorrectionToBalance(remainingBalance, correctionRate);
  
  console.log('=== CÁLCULO VALOR CHAVES ===');
  console.log(`Saldo restante: R$ ${remainingBalance.toFixed(2)}`);
  console.log(`Taxa correção: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Valor chaves: R$ ${correctedKeysAmount.toFixed(2)}`);
  
  return correctedKeysAmount;
};

export const calculateMonthlyPropertyValue = (
  baseValue: number,
  appreciationRate: number,
  correctionRate: number,
  monthNumber: number
): number => {
  // CORREÇÃO: Usar função com taxas FIXAS
  return calculatePropertyValueWithFixedRates(
    baseValue,
    correctionRate,
    appreciationRate,
    monthNumber
  );
};

export const validateScheduleIntegrity = (schedule: PaymentType[]): boolean => {
  console.log('=== VALIDAÇÃO INTEGRIDADE CRONOGRAMA ===');
  
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
  
  // VALIDAÇÃO CORRIGIDA: Verificar se taxas estão sendo aplicadas corretamente
  const expectedCorrectionRate = 0.0038; // CUB fixo de 0,38%
  let previousBalance = schedule[0].balance;
  
  for (let i = 1; i < schedule.length - 1; i++) {
    const current = schedule[i];
    if (current.month) {
      const expectedCorrectedBalance = previousBalance * (1 + expectedCorrectionRate);
      const expectedFinalBalance = expectedCorrectedBalance - current.amount;
      
      const balanceDifference = Math.abs(current.balance - expectedFinalBalance);
      const correctionDifference = Math.abs(expectedCorrectedBalance - (previousBalance * (1 + expectedCorrectionRate)));
      
      console.log(`Mês ${current.month}:`);
      console.log(`  Saldo anterior: R$ ${previousBalance.toFixed(2)}`);
      console.log(`  Esperado corrigido: R$ ${expectedCorrectedBalance.toFixed(2)}`);
      console.log(`  Esperado final: R$ ${expectedFinalBalance.toFixed(2)}`);
      console.log(`  Cronograma: R$ ${current.balance.toFixed(2)}`);
      console.log(`  Diferença: R$ ${balanceDifference.toFixed(2)}`);
      
      if (balanceDifference > 100) {
        console.warn(`Possível erro no mês ${current.month}: diferença de R$ ${balanceDifference.toFixed(2)}`);
      }
      
      previousBalance = current.balance;
    }
  }
  
  console.log(`Validação concluída. Saldo final zerado: ${balanceIsZero ? 'SIM' : 'NÃO'}`);
  return balanceIsZero;
};

// NOVA: Função para recalcular cronograma com taxas FIXAS
export const recalculateScheduleWithFixedRates = (
  formData: SimulationFormData
): { isValid: boolean, errors: string[], correctedData: SimulationFormData } => {
  const errors: string[] = [];
  const correctedData = { ...formData };
  
  // CORREÇÃO: Garantir taxa CUB fixa
  if (formData.correctionMode === 'cub') {
    correctedData.correctionIndex = 0.38; // Taxa fixa de 0,38%
    console.log('Taxa CUB fixada em 0,38% ao mês');
  }
  
  // Validar se as taxas estão em range razoável
  if (formData.correctionMode === 'manual' && formData.correctionIndex > 5) {
    errors.push(`Taxa manual muito alta: ${formData.correctionIndex}% (máximo recomendado: 5%)`);
  }
  
  // Validar taxa de valorização
  if (formData.appreciationIndex > 10) {
    errors.push(`Taxa de valorização muito alta: ${formData.appreciationIndex}% (máximo recomendado: 10%)`);
  }
  
  console.log('=== CONFIGURAÇÕES CORRIGIDAS ===');
  console.log(`Modo correção: ${correctedData.correctionMode}`);
  console.log(`Taxa correção: ${correctedData.correctionIndex}%`);
  console.log(`Taxa valorização: ${correctedData.appreciationIndex}%`);
  
  return {
    isValid: errors.length === 0,
    errors,
    correctedData
  };
};
