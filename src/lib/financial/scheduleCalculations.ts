
import { PaymentType, SimulationFormData } from '@/utils/types';
import { getMonthlyCorrection, applyCorrectionToBalance, applyCorrectionToInstallment } from './correctionCalculations';

/**
 * Functions for payment schedule calculations
 */

export const calculateInstallmentBalance = (
  previousBalance: number,
  installmentAmount: number,
  correctionRate: number
): number => {
  const correctedBalance = applyCorrectionToBalance(previousBalance, correctionRate);
  return correctedBalance - installmentAmount;
};

export const calculateFinalKeysAmount = (
  remainingBalance: number,
  correctionRate: number
): number => {
  return applyCorrectionToBalance(remainingBalance, correctionRate);
};

export const calculateMonthlyPropertyValue = (
  baseValue: number,
  appreciationRate: number,
  monthNumber: number
): number => {
  return baseValue * Math.pow(1 + appreciationRate / 100, monthNumber);
};

export const validateScheduleIntegrity = (schedule: PaymentType[]): boolean => {
  // Check if schedule is properly ordered by date
  for (let i = 1; i < schedule.length; i++) {
    if (schedule[i].date < schedule[i - 1].date) {
      return false;
    }
  }
  
  // Check if final balance is zero
  const lastPayment = schedule[schedule.length - 1];
  return Math.abs(lastPayment.balance) < 0.01;
};
