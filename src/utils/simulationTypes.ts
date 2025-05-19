
import { PaymentType, SimulationFormData } from "./calculationUtils";

export interface SavedSimulation extends SimulationFormData {
  id: string;
  name: string;
  date: Date;
  results: {
    schedule: PaymentType[];
    investmentValue: number;
    propertyValue: number;
    profit: number;
    profitPercentage: number;
    remainingBalance: number;
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
  };
}

export interface SimulationHistoryState {
  simulations: SavedSimulation[];
  selectedSimulation: SavedSimulation | null;
}
