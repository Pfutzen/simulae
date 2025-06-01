
import { useMemo } from 'react';
import { getReinforcementMonths } from '@/utils/calculationHelpers';

export const useReinforcementCalculation = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
) => {
  const reinforcementMonths = useMemo(() => {
    return getReinforcementMonths(
      installmentsCount,
      reinforcementFrequency,
      finalMonthsWithoutReinforcement
    );
  }, [installmentsCount, reinforcementFrequency, finalMonthsWithoutReinforcement]);

  const reinforcementCount = reinforcementMonths.length;

  const calculateReinforcementValue = (totalReinforcementBudget: number): number => {
    return reinforcementCount > 0 ? totalReinforcementBudget / reinforcementCount : 0;
  };

  const calculateTotalReinforcementValue = (valuePerReinforcement: number): number => {
    return valuePerReinforcement * reinforcementCount;
  };

  return {
    reinforcementMonths,
    reinforcementCount,
    calculateReinforcementValue,
    calculateTotalReinforcementValue
  };
};
