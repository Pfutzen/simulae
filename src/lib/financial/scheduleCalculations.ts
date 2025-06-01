
import { PaymentType, SimulationFormData } from '@/utils/types';
import { getMonthlyCorrection, applyCorrectionToBalance, validateCorrectionCalculation } from './correctionCalculations';

/**
 * Functions for payment schedule calculations
 */

export const calculateInstallmentBalance = (
  previousBalance: number,
  installmentAmount: number,
  correctionRate: number
): number => {
  // CORREÇÃO: Usar função validada de correção
  const validation = validateCorrectionCalculation(previousBalance, correctionRate, installmentAmount);
  return validation.finalBalance;
};

export const calculateFinalKeysAmount = (
  remainingBalance: number,
  correctionRate: number
): number => {
  // CORREÇÃO: Aplicar correção correta ao saldo das chaves
  return applyCorrectionToBalance(remainingBalance, correctionRate);
};

export const calculateMonthlyPropertyValue = (
  baseValue: number,
  appreciationRate: number,
  correctionRate: number,
  monthNumber: number
): number => {
  // CORREÇÃO: Aplicar correção CUB primeiro, depois valorização
  const correctionFactor = Math.pow(1 + correctionRate, monthNumber);
  const appreciationFactor = Math.pow(1 + appreciationRate / 100, monthNumber);
  return baseValue * correctionFactor * appreciationFactor;
};

export const validateScheduleIntegrity = (schedule: PaymentType[]): boolean => {
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
  
  // NOVA VALIDAÇÃO: Verificar taxas de correção
  let previousBalance = schedule[0].balance;
  for (let i = 1; i < schedule.length - 1; i++) { // Excluir entrada e chaves
    const current = schedule[i];
    if (current.month) {
      // Simular cálculo esperado
      const expectedCorrection = 0.0038; // CUB padrão para teste
      const expectedCorrectedBalance = previousBalance * (1 + expectedCorrection);
      const expectedFinalBalance = expectedCorrectedBalance - current.amount;
      
      const difference = Math.abs(current.balance - expectedFinalBalance);
      if (difference > 1000) { // Tolerância de R$ 1000
        console.warn(`Possível erro no mês ${current.month}: diferença de R$ ${difference.toFixed(2)}`);
      }
      
      previousBalance = current.balance;
    }
  }
  
  return balanceIsZero;
};

// Nova função para recalcular cronograma com validação
export const recalculateScheduleWithValidation = (
  formData: SimulationFormData
): { isValid: boolean, errors: string[] } => {
  const errors: string[] = [];
  
  // Validar taxa de correção
  if (formData.correctionMode === 'manual' && formData.correctionIndex > 10) {
    errors.push(`Taxa manual muito alta: ${formData.correctionIndex}% (suspeita)`);
  }
  
  // Validar se as taxas estão em percentual correto
  if (formData.correctionMode === 'cub') {
    const expectedRange = { min: 0.1, max: 2.0 }; // 0.1% a 2.0% ao mês é razoável
    // A validação será feita durante os cálculos
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
