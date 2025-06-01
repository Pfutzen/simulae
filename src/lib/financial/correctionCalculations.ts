
import { CUB_CORRECTION_DATA } from '@/utils/correctionData';
import { CorrectionMode } from '@/utils/types';

/**
 * Functions for monetary correction calculations
 */

export const getMonthlyCorrection = (
  monthNumber: number,
  correctionMode: CorrectionMode,
  manualCorrectionIndex: number = 0
): number => {
  if (correctionMode === "manual" && manualCorrectionIndex > 0) {
    // CORREÇÃO: Garantir que está em decimal
    return manualCorrectionIndex / 100;
  } else if (correctionMode === "cub") {
    // CORREÇÃO: Usar CUB index correto e garantir decimal
    const cubIndex = (monthNumber - 1) % 12;
    return CUB_CORRECTION_DATA[cubIndex].percentage / 100;
  }
  return 0; // No correction
};

export const applyCorrectionToBalance = (balance: number, correctionRate: number): number => {
  // CORREÇÃO: Aplicar correção corretamente
  return balance * (1 + correctionRate);
};

export const applyCorrectionToInstallment = (
  baseInstallment: number,
  correctionRate: number,
  monthNumber: number
): number => {
  // CORREÇÃO: Usar correção acumulada correta
  return baseInstallment * Math.pow(1 + correctionRate, monthNumber);
};

export const calculateAccumulatedCorrection = (
  baseValue: number,
  correctionRate: number,
  months: number
): number => {
  // CORREÇÃO: Calcular correção acumulada corretamente
  return baseValue * Math.pow(1 + correctionRate, months);
};

// Nova função para validar cálculos
export const validateCorrectionCalculation = (
  initialBalance: number,
  correctionRate: number,
  installmentAmount: number
): { correctedBalance: number, finalBalance: number, isValid: boolean } => {
  const correctedBalance = applyCorrectionToBalance(initialBalance, correctionRate);
  const finalBalance = correctedBalance - installmentAmount;
  
  // Log para debug
  console.log('=== VALIDAÇÃO DE CORREÇÃO ===');
  console.log(`Saldo inicial: R$ ${initialBalance.toFixed(2)}`);
  console.log(`Taxa aplicada: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
  console.log(`Parcela: R$ ${installmentAmount.toFixed(2)}`);
  console.log(`Saldo final: R$ ${finalBalance.toFixed(2)}`);
  
  return {
    correctedBalance,
    finalBalance,
    isValid: Math.abs(correctedBalance - (initialBalance * (1 + correctionRate))) < 0.01
  };
};
