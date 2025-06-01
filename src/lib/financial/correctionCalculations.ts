
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
    // CORREÇÃO: Taxa manual fixa em decimal
    return manualCorrectionIndex / 100;
  } else if (correctionMode === "cub") {
    // CORREÇÃO: Taxa CUB fixa de 0,38% ao mês (média histórica)
    return 0.0038;
  }
  return 0;
};

export const applyCorrectionToBalance = (balance: number, correctionRate: number): number => {
  // CORREÇÃO: Aplicar correção simples e direta
  const correctedBalance = balance * (1 + correctionRate);
  
  console.log('=== APLICAÇÃO DE CORREÇÃO ===');
  console.log(`Saldo inicial: R$ ${balance.toFixed(2)}`);
  console.log(`Taxa aplicada: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Saldo corrigido: R$ ${correctedBalance.toFixed(2)}`);
  
  return correctedBalance;
};

export const applyCorrectionToInstallment = (
  baseInstallment: number,
  correctionRate: number,
  monthNumber: number
): number => {
  // CORREÇÃO: Aplicar correção acumulada com taxa FIXA
  const correctedInstallment = baseInstallment * Math.pow(1 + correctionRate, monthNumber);
  
  console.log('=== CORREÇÃO DE PARCELA ===');
  console.log(`Parcela base: R$ ${baseInstallment.toFixed(2)}`);
  console.log(`Taxa mensal: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Meses: ${monthNumber}`);
  console.log(`Fator acumulado: ${Math.pow(1 + correctionRate, monthNumber).toFixed(6)}`);
  console.log(`Parcela corrigida: R$ ${correctedInstallment.toFixed(2)}`);
  
  return correctedInstallment;
};

export const calculateAccumulatedCorrection = (
  baseValue: number,
  correctionRate: number,
  months: number
): number => {
  // CORREÇÃO: Correção acumulada com taxa FIXA
  const correctedValue = baseValue * Math.pow(1 + correctionRate, months);
  
  console.log('=== CORREÇÃO ACUMULADA ===');
  console.log(`Valor base: R$ ${baseValue.toFixed(2)}`);
  console.log(`Taxa mensal: ${(correctionRate * 100).toFixed(4)}%`);
  console.log(`Período: ${months} meses`);
  console.log(`Valor corrigido: R$ ${correctedValue.toFixed(2)}`);
  
  return correctedValue;
};

// NOVA: Função para calcular valor do imóvel com taxas FIXAS
export const calculatePropertyValueWithFixedRates = (
  baseValue: number,
  correctionRate: number,
  appreciationRate: number,
  months: number
): number => {
  // CORREÇÃO: Aplicar ambas as taxas de forma FIXA e constante
  const correctionFactor = Math.pow(1 + correctionRate, months);
  const appreciationFactor = Math.pow(1 + appreciationRate / 100, months);
  const finalValue = baseValue * correctionFactor * appreciationFactor;
  
  console.log('=== CÁLCULO VALOR IMÓVEL CORRIGIDO ===');
  console.log(`Valor base: R$ ${baseValue.toFixed(2)}`);
  console.log(`Taxa correção: ${(correctionRate * 100).toFixed(4)}% × ${months} meses`);
  console.log(`Taxa valorização: ${appreciationRate}% × ${months} meses`);
  console.log(`Fator correção: ${correctionFactor.toFixed(6)}`);
  console.log(`Fator valorização: ${appreciationFactor.toFixed(6)}`);
  console.log(`Valor final: R$ ${finalValue.toFixed(2)}`);
  
  return finalValue;
};

// Função de validação corrigida
export const validateCorrectionCalculation = (
  initialBalance: number,
  correctionRate: number,
  installmentAmount: number
): { correctedBalance: number, finalBalance: number, isValid: boolean } => {
  const correctedBalance = applyCorrectionToBalance(initialBalance, correctionRate);
  const finalBalance = correctedBalance - installmentAmount;
  
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
