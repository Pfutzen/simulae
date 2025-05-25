
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
  appreciationIndex?: number;
}

const STORAGE_KEY = 'simulation_history';
const ACTIVE_SIMULATION_KEY = 'active_simulation';

export const saveSimulation = (simulation: Omit<SavedSimulation, 'id'>): SavedSimulation => {
  try {
    // Generate a unique ID for the simulation
    const id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure appreciationIndex is included from formData
    const fullSimulation: SavedSimulation = { 
      ...simulation, 
      id,
      appreciationIndex: simulation.formData.appreciationIndex || simulation.appreciationIndex || 0
    };
    
    console.log('Saving simulation with appreciationIndex:', fullSimulation.appreciationIndex);
    console.log('FormData appreciationIndex:', simulation.formData.appreciationIndex);
    
    const existingSimulations = getSimulations();
    const updatedSimulations = [fullSimulation, ...existingSimulations];
    
    // Keep only the last 50 simulations
    const limitedSimulations = updatedSimulations.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSimulations));
    
    // Set as active simulation
    setActiveSimulation(fullSimulation);
    
    console.log('Active simulation set:', fullSimulation.id);
    
    return fullSimulation;
  } catch (error) {
    console.error('Error saving simulation:', error);
    throw error;
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

export const getActiveSimulation = (): SavedSimulation | null => {
  try {
    const stored = localStorage.getItem(ACTIVE_SIMULATION_KEY);
    const activeSimulation = stored ? JSON.parse(stored) : null;
    
    console.log('Getting active simulation:', activeSimulation ? activeSimulation.id : 'none');
    
    if (activeSimulation) {
      // Ensure appreciationIndex is available
      if (!activeSimulation.appreciationIndex && activeSimulation.formData?.appreciationIndex) {
        activeSimulation.appreciationIndex = activeSimulation.formData.appreciationIndex;
        console.log('Restored appreciationIndex from formData:', activeSimulation.appreciationIndex);
      }
    }
    
    return activeSimulation;
  } catch (error) {
    console.error('Error loading active simulation:', error);
    return null;
  }
};

export const setActiveSimulation = (simulation: SavedSimulation): void => {
  try {
    // Ensure appreciationIndex is preserved
    const simulationToSave = {
      ...simulation,
      appreciationIndex: simulation.appreciationIndex || simulation.formData?.appreciationIndex || 0
    };
    
    localStorage.setItem(ACTIVE_SIMULATION_KEY, JSON.stringify(simulationToSave));
    console.log('Active simulation saved to localStorage:', simulationToSave.id);
  } catch (error) {
    console.error('Error setting active simulation:', error);
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
    localStorage.removeItem(ACTIVE_SIMULATION_KEY);
  } catch (error) {
    console.error('Error clearing simulations:', error);
  }
};
