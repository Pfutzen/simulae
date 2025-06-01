
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
    return manualCorrectionIndex / 100;
  } else if (correctionMode === "cub") {
    // Use CUB index for the corresponding month (12-month cycle)
    const cubIndex = (monthNumber - 1) % 12;
    return CUB_CORRECTION_DATA[cubIndex].percentage / 100;
  }
  return 0; // No correction
};

export const applyCorrectionToBalance = (balance: number, correctionRate: number): number => {
  return balance * (1 + correctionRate);
};

export const applyCorrectionToInstallment = (
  baseInstallment: number,
  correctionRate: number,
  monthNumber: number
): number => {
  return baseInstallment * Math.pow(1 + correctionRate, monthNumber);
};

export const calculateAccumulatedCorrection = (
  baseValue: number,
  correctionRate: number,
  months: number
): number => {
  return baseValue * Math.pow(1 + correctionRate, months);
};
