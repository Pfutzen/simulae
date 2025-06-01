
// Re-export everything from the refactored modules for backward compatibility
export * from './types';
export * from './correctionData';
export * from './paymentSchedule';
export * from './resaleAnalysis';
export * from './formatters';

// Re-export new financial lib functions
export * from '../lib/financial';

// Re-export specific functions from calculationHelpers (non-conflicting ones)
export {
  calculateTotalPercentage,
  calculateMaxReinforcementCount,
  getReinforcementMonths,
  calculateStartDateFromDelivery,
  calculateDeliveryDateFromStart,
  calculateStartDateFromValuation,
  calculateRentalEstimate,
  calculateAnnualAppreciation
} from './calculationHelpers';
