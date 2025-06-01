
import { addMonths as addMonthsToDate } from 'date-fns';
import { SimulationFormData } from './types';

export const calculateTotalPercentage = (data: SimulationFormData): number => {
  return (
    data.downPaymentPercentage +
    data.installmentsPercentage +
    data.reinforcementsPercentage +
    data.keysPercentage
  );
};

export const calculateMaxReinforcementCount = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
): number => {
  const monthsWithReinforcement =
    installmentsCount - finalMonthsWithoutReinforcement;
  return Math.floor(monthsWithReinforcement / reinforcementFrequency);
};

export const getReinforcementMonths = (
  installmentsCount: number,
  reinforcementFrequency: number,
  finalMonthsWithoutReinforcement: number
): number[] => {
  const months: number[] = [];
  let month = reinforcementFrequency;
  while (
    month <= installmentsCount - finalMonthsWithoutReinforcement &&
    months.length < 100 // Avoid infinite loops
  ) {
    months.push(month);
    month += reinforcementFrequency;
  }
  return months;
};

export const calculateStartDateFromDelivery = (
  deliveryDate: Date,
  installmentsCount: number
): Date => {
  return addMonthsToDate(deliveryDate, -installmentsCount);
};

export const calculateDeliveryDateFromStart = (
  startDate: Date,
  installmentsCount: number
): Date => {
  return addMonthsToDate(startDate, installmentsCount);
};

export const calculateStartDateFromValuation = (valuationDate: Date): Date => {
  return addMonthsToDate(valuationDate, 1);
};

export const calculateRentalEstimate = (propertyValue: number, rentalPercentage: number) => {
  const rentalEstimate = propertyValue * (rentalPercentage / 100);
  const annualRentalReturn = (rentalEstimate * 12) / propertyValue * 100;

  return {
    rentalEstimate,
    annualRentalReturn
  };
};

export const calculateAnnualAppreciation = (monthlyAppreciationIndex: number): number => {
  console.log('Calculating annual appreciation from monthly index:', monthlyAppreciationIndex);
  const annualAppreciation = monthlyAppreciationIndex * 12;
  console.log('Calculated annual appreciation:', annualAppreciation);
  return annualAppreciation;
};
