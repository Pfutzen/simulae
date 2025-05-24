
import { SimulationFormData, PaymentType } from "./calculationUtils";

export interface SavedSimulation {
  id: string;
  name: string;
  timestamp: number;
  formData: SimulationFormData;
  schedule?: PaymentType[]; // Added this optional schedule property
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
    // Set this as the active simulation
    localStorage.setItem('activeSimulation', id);
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
    
    // If the deleted simulation was the active one, clear the active simulation
    const activeSimulationId = localStorage.getItem('activeSimulation');
    if (activeSimulationId === id) {
      localStorage.removeItem('activeSimulation');
    }
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

// Get the active simulation
export const getActiveSimulation = (): SavedSimulation | null => {
  try {
    const activeSimulationId = localStorage.getItem('activeSimulation');
    if (!activeSimulationId) {
      // If no active simulation is set, return the most recent one
      const simulations = getSimulations();
      return simulations.length > 0 ? simulations[0] : null;
    }
    
    const simulation = getSimulationById(activeSimulationId);
    return simulation || null;
  } catch (error) {
    console.error('Error getting active simulation:', error);
    return null;
  }
};

// Set a simulation as active
export const setActiveSimulation = (id: string): void => {
  try {
    localStorage.setItem('activeSimulation', id);
  } catch (error) {
    console.error('Error setting active simulation:', error);
  }
};
