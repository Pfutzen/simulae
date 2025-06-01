
import { useState, useCallback } from 'react';
import { SimulationFormData, PaymentType } from '@/utils/types';
import { generatePaymentSchedule, calculateResaleProfit, calculateBestResaleMonth, calculateRentalEstimate } from '@/utils/calculationUtils';

interface SimulationResults {
  schedule: PaymentType[];
  resaleResults: {
    investmentValue: number;
    propertyValue: number;
    profit: number;
    profitPercentage: number;
    remainingBalance: number;
    rentalEstimate: number;
    annualRentalReturn: number;
  };
  bestResaleInfo: {
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    maxProfitTotalPaid: number;
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    maxRoiTotalPaid: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
    earlyTotalPaid?: number;
  };
}

export const useSimulationFlow = () => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<SimulationResults | null>(null);

  const runSimulation = useCallback(async (
    formData: SimulationFormData,
    customResaleEnabled: boolean
  ): Promise<SimulationResults> => {
    setIsCalculating(true);
    
    try {
      // Generate payment schedule
      const schedule = generatePaymentSchedule(formData);
      
      // Calculate resale results
      const effectiveResaleMonth = customResaleEnabled 
        ? formData.resaleMonth 
        : formData.installmentsCount;
        
      const results = calculateResaleProfit(schedule, effectiveResaleMonth);
      
      // Calculate rental estimates
      const rentalData = calculateRentalEstimate(
        results.propertyValue, 
        formData.rentalPercentage
      );
      
      const resaleResults = {
        ...results,
        rentalEstimate: rentalData.rentalEstimate,
        annualRentalReturn: rentalData.annualRentalReturn
      };
      
      // Calculate best resale info
      const bestResaleInfo = calculateBestResaleMonth(schedule);
      
      const simulationResults = {
        schedule,
        resaleResults,
        bestResaleInfo
      };
      
      setLastCalculation(simulationResults);
      return simulationResults;
      
    } finally {
      setIsCalculating(false);
    }
  }, []);

  return {
    runSimulation,
    isCalculating,
    lastCalculation
  };
};
