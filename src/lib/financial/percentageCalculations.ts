
/**
 * Pure functions for percentage and value calculations
 */

export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

export const calculateValue = (percentage: number, total: number): number => {
  return (percentage / 100) * total;
};

export const calculateTotalPercentage = (percentages: number[]): number => {
  return percentages.reduce((sum, percentage) => sum + percentage, 0);
};

export const normalizePercentages = (percentages: number[], target: number = 100): number[] => {
  const total = calculateTotalPercentage(percentages);
  if (total === 0) return percentages;
  
  const factor = target / total;
  return percentages.map(p => p * factor);
};

export const calculateRemainingPercentage = (usedPercentages: number[], total: number = 100): number => {
  const used = calculateTotalPercentage(usedPercentages);
  return Math.max(0, total - used);
};
