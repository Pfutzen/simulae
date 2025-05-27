

export type CorrectionMode = "manual" | "cub";

export interface SimulationFormData {
  propertyValue: number;
  downPaymentValue: number;
  downPaymentPercentage: number;
  installmentsValue: number;
  installmentsPercentage: number;
  installmentsCount: number;
  reinforcementsValue: number;
  reinforcementsPercentage: number;
  reinforcementFrequency: number;
  finalMonthsWithoutReinforcement: number;
  keysValue: number;
  keysPercentage: number;
  correctionMode: CorrectionMode;
  correctionIndex: number;
  appreciationIndex: number;
  resaleMonth: number;
  rentalPercentage: number;
  startDate?: Date;
  deliveryDate?: Date;
  valuationDate?: Date;
  customReinforcementDates?: Date[];
  
  // New sales cost fields
  incluirComissao?: boolean;
  percentualComissao?: number;
  incluirIRPF?: boolean;
  percentualIRPF?: number;
  valorVendaPrevisto?: number;
}

export interface PaymentType {
  date: Date;
  description: string;
  amount: number;
  balance: number;
  totalPaid: number;
  propertyValue: number;
  month?: number;
}

