import { SimulationFormData, PaymentType } from './types';

export interface SavedSimulation {
  id: string;
  name: string;
  timestamp: number;
  formData: SimulationFormData;
  schedule: PaymentType[];
  results: {
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
  appreciationIndex?: number; // Add this property
}

const STORAGE_KEY = 'simulation_history';

export const saveSimulation = (simulation: SavedSimulation): void => {
  try {
    const existingSimulations = getSimulations();
    const updatedSimulations = [simulation, ...existingSimulations];
    
    // Keep only the last 50 simulations
    const limitedSimulations = updatedSimulations.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSimulations));
  } catch (error) {
    console.error('Error saving simulation:', error);
  }
};

export const getSimulations = (): SavedSimulation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading simulations:', error);
    return [];
  }
};

export const deleteSimulation = (id: string): void => {
  try {
    const simulations = getSimulations();
    const filtered = simulations.filter(sim => sim.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting simulation:', error);
  }
};

export const clearSimulations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing simulations:', error);
  }
};
