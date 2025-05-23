
import { SimulationFormData } from "./calculationUtils";

export interface SavedSimulation {
  id: string;
  name: string;
  timestamp: number;
  formData: SimulationFormData;
  results: {
    investmentValue: number;
    propertyValue: number;
    profit: number;
    profitPercentage: number;
    remainingBalance: number;
    rentalEstimate?: number;
    annualRentalReturn?: number;
  };
  bestResaleInfo: {
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
  };
}

// Save simulation to local storage
export const saveSimulation = (simulation: Omit<SavedSimulation, "id">): SavedSimulation => {
  const id = `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const finalSimulation: SavedSimulation = { ...simulation, id };

  try {
    const savedSimulations = getSimulations();
    localStorage.setItem('simulations', JSON.stringify([finalSimulation, ...savedSimulations]));
  } catch (error) {
    console.error('Error saving simulation to local storage:', error);
  }

  return finalSimulation;
};

// Get all simulations from local storage
export const getSimulations = (): SavedSimulation[] => {
  try {
    const savedSimulations = localStorage.getItem('simulations');
    return savedSimulations ? JSON.parse(savedSimulations) : [];
  } catch (error) {
    console.error('Error retrieving simulations from local storage:', error);
    return [];
  }
};

// Delete a simulation from local storage
export const deleteSimulation = (id: string): void => {
  try {
    const savedSimulations = getSimulations();
    const updatedSimulations = savedSimulations.filter(sim => sim.id !== id);
    localStorage.setItem('simulations', JSON.stringify(updatedSimulations));
  } catch (error) {
    console.error('Error deleting simulation from local storage:', error);
  }
};

// Get a specific simulation by ID
export const getSimulationById = (id: string): SavedSimulation | undefined => {
  try {
    const savedSimulations = getSimulations();
    return savedSimulations.find(sim => sim.id === id);
  } catch (error) {
    console.error('Error retrieving simulation from local storage:', error);
    return undefined;
  }
};
