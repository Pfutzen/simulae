
import { useState, useEffect } from "react";
import { SavedSimulation } from "@/utils/simulationTypes";
import { v4 as uuidv4 } from "uuid";

// Local storage key
const STORAGE_KEY = "simulae-simulations";

export const useSimulationHistory = () => {
  const [simulations, setSimulations] = useState<SavedSimulation[]>([]);
  const [selectedSimulation, setSelectedSimulation] = useState<SavedSimulation | null>(null);

  // Load simulations from localStorage on initial render
  useEffect(() => {
    const loadedSimulations = localStorage.getItem(STORAGE_KEY);
    if (loadedSimulations) {
      try {
        const parsedSimulations = JSON.parse(loadedSimulations);
        
        // Convert date strings back to Date objects
        const formattedSimulations = parsedSimulations.map((sim: any) => ({
          ...sim,
          date: new Date(sim.date)
        }));
        
        setSimulations(formattedSimulations);
      } catch (error) {
        console.error("Error loading simulations from localStorage:", error);
        // If there's an error parsing, start fresh
        setSimulations([]);
      }
    }
  }, []);

  // Save simulations to localStorage whenever they change
  useEffect(() => {
    if (simulations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(simulations));
    }
  }, [simulations]);

  // Save a new simulation
  const saveSimulation = (simulationData: Omit<SavedSimulation, "id" | "date">) => {
    const newSimulation: SavedSimulation = {
      ...simulationData,
      id: uuidv4(),
      date: new Date()
    };

    setSimulations(prev => [newSimulation, ...prev]);
    return newSimulation;
  };

  // Delete a simulation
  const deleteSimulation = (id: string) => {
    setSimulations(prev => prev.filter(sim => sim.id !== id));
    if (selectedSimulation?.id === id) {
      setSelectedSimulation(null);
    }
  };

  // Load a simulation
  const selectSimulation = (id: string) => {
    const simulation = simulations.find(sim => sim.id === id) || null;
    setSelectedSimulation(simulation);
    return simulation;
  };

  // Duplicate a simulation
  const duplicateSimulation = (id: string) => {
    const simulationToDuplicate = simulations.find(sim => sim.id === id);
    if (!simulationToDuplicate) return null;

    const duplicatedSimulation: SavedSimulation = {
      ...simulationToDuplicate,
      id: uuidv4(),
      date: new Date(),
      name: `${simulationToDuplicate.name} (cópia)`
    };

    setSimulations(prev => [duplicatedSimulation, ...prev]);
    return duplicatedSimulation;
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedSimulation(null);
  };

  return {
    simulations,
    selectedSimulation,
    saveSimulation,
    deleteSimulation,
    selectSimulation,
    duplicateSimulation,
    clearSelection
  };
};
