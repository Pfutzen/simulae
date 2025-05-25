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
    console.log('Saving simulation with data:', {
      appreciationIndex: simulation.appreciationIndex,
      formDataAppreciationIndex: simulation.formData.appreciationIndex,
      hasResults: !!simulation.results,
      hasSchedule: !!simulation.schedule
    });
    
    // Generate a unique ID for the simulation
    const id = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Ensure appreciationIndex is properly extracted and saved
    const appreciationIndex = simulation.appreciationIndex || 
                             simulation.formData.appreciationIndex || 
                             0;
    
    const fullSimulation: SavedSimulation = { 
      ...simulation, 
      id,
      appreciationIndex
    };
    
    console.log('Full simulation being saved:', {
      id: fullSimulation.id,
      name: fullSimulation.name,
      appreciationIndex: fullSimulation.appreciationIndex,
      resultsExists: !!fullSimulation.results,
      scheduleExists: !!fullSimulation.schedule && fullSimulation.schedule.length > 0
    });
    
    const existingSimulations = getSimulations();
    const updatedSimulations = [fullSimulation, ...existingSimulations];
    
    // Keep only the last 50 simulations
    const limitedSimulations = updatedSimulations.slice(0, 50);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedSimulations));
    
    // Set as active simulation immediately
    setActiveSimulation(fullSimulation);
    
    console.log('Simulation saved successfully as active');
    
    return fullSimulation;
  } catch (error) {
    console.error('Error saving simulation:', error);
    throw error;
  }
};

export const getSimulations = (): SavedSimulation[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const simulations = stored ? JSON.parse(stored) : [];
    console.log('Retrieved simulations count:', simulations.length);
    return simulations;
  } catch (error) {
    console.error('Error loading simulations:', error);
    return [];
  }
};

export const getActiveSimulation = (): SavedSimulation | null => {
  try {
    const stored = localStorage.getItem(ACTIVE_SIMULATION_KEY);
    if (!stored) {
      console.log('No active simulation found in localStorage');
      return null;
    }
    
    const activeSimulation = JSON.parse(stored);
    
    // Ensure appreciationIndex is available
    if (!activeSimulation.appreciationIndex && activeSimulation.formData?.appreciationIndex) {
      activeSimulation.appreciationIndex = activeSimulation.formData.appreciationIndex;
    }
    
    console.log('Retrieved active simulation:', {
      id: activeSimulation.id,
      name: activeSimulation.name,
      appreciationIndex: activeSimulation.appreciationIndex,
      hasResults: !!activeSimulation.results,
      hasSchedule: !!activeSimulation.schedule && activeSimulation.schedule.length > 0
    });
    
    return activeSimulation;
  } catch (error) {
    console.error('Error loading active simulation:', error);
    return null;
  }
};

export const setActiveSimulation = (simulation: SavedSimulation): void => {
  try {
    // Ensure all data is properly preserved
    const simulationToSave = {
      ...simulation,
      appreciationIndex: simulation.appreciationIndex || simulation.formData?.appreciationIndex || 0
    };
    
    console.log('Setting active simulation:', {
      id: simulationToSave.id,
      name: simulationToSave.name,
      appreciationIndex: simulationToSave.appreciationIndex,
      hasResults: !!simulationToSave.results,
      hasSchedule: !!simulationToSave.schedule && simulationToSave.schedule.length > 0
    });
    
    localStorage.setItem(ACTIVE_SIMULATION_KEY, JSON.stringify(simulationToSave));
    console.log('Active simulation saved successfully to localStorage');
  } catch (error) {
    console.error('Error setting active simulation:', error);
  }
};

export const deleteSimulation = (id: string): void => {
  try {
    const simulations = getSimulations();
    const filtered = simulations.filter(sim => sim.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    // If the deleted simulation was the active one, clear it
    const activeSimulation = getActiveSimulation();
    if (activeSimulation && activeSimulation.id === id) {
      localStorage.removeItem(ACTIVE_SIMULATION_KEY);
    }
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
