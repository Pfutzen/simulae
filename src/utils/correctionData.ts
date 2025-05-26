
// CUB/SC correction data for historical periods (2021-2025)
export interface CubCorrectionData {
  year: number;
  month: number;
  description: string;
  percentage: number;
  date: Date;
}

export const CUB_CORRECTION_HISTORICAL: CubCorrectionData[] = [
  // 2021
  { year: 2021, month: 1, description: "Janeiro 2021", percentage: 0.89, date: new Date(2021, 0, 1) },
  { year: 2021, month: 2, description: "Fevereiro 2021", percentage: 1.12, date: new Date(2021, 1, 1) },
  { year: 2021, month: 3, description: "Março 2021", percentage: 1.34, date: new Date(2021, 2, 1) },
  { year: 2021, month: 4, description: "Abril 2021", percentage: 1.28, date: new Date(2021, 3, 1) },
  { year: 2021, month: 5, description: "Maio 2021", percentage: 1.45, date: new Date(2021, 4, 1) },
  { year: 2021, month: 6, description: "Junho 2021", percentage: 1.52, date: new Date(2021, 5, 1) },
  { year: 2021, month: 7, description: "Julho 2021", percentage: 1.38, date: new Date(2021, 6, 1) },
  { year: 2021, month: 8, description: "Agosto 2021", percentage: 1.29, date: new Date(2021, 7, 1) },
  { year: 2021, month: 9, description: "Setembro 2021", percentage: 1.18, date: new Date(2021, 8, 1) },
  { year: 2021, month: 10, description: "Outubro 2021", percentage: 1.24, date: new Date(2021, 9, 1) },
  { year: 2021, month: 11, description: "Novembro 2021", percentage: 1.15, date: new Date(2021, 10, 1) },
  { year: 2021, month: 12, description: "Dezembro 2021", percentage: 1.08, date: new Date(2021, 11, 1) },

  // 2022
  { year: 2022, month: 1, description: "Janeiro 2022", percentage: 0.95, date: new Date(2022, 0, 1) },
  { year: 2022, month: 2, description: "Fevereiro 2022", percentage: 0.87, date: new Date(2022, 1, 1) },
  { year: 2022, month: 3, description: "Março 2022", percentage: 0.92, date: new Date(2022, 2, 1) },
  { year: 2022, month: 4, description: "Abril 2022", percentage: 0.83, date: new Date(2022, 3, 1) },
  { year: 2022, month: 5, description: "Maio 2022", percentage: 0.78, date: new Date(2022, 4, 1) },
  { year: 2022, month: 6, description: "Junho 2022", percentage: 0.71, date: new Date(2022, 5, 1) },
  { year: 2022, month: 7, description: "Julho 2022", percentage: 0.84, date: new Date(2022, 6, 1) },
  { year: 2022, month: 8, description: "Agosto 2022", percentage: 0.79, date: new Date(2022, 7, 1) },
  { year: 2022, month: 9, description: "Setembro 2022", percentage: 0.73, date: new Date(2022, 8, 1) },
  { year: 2022, month: 10, description: "Outubro 2022", percentage: 0.68, date: new Date(2022, 9, 1) },
  { year: 2022, month: 11, description: "Novembro 2022", percentage: 0.74, date: new Date(2022, 10, 1) },
  { year: 2022, month: 12, description: "Dezembro 2022", percentage: 0.81, date: new Date(2022, 11, 1) },

  // 2023
  { year: 2023, month: 1, description: "Janeiro 2023", percentage: 0.86, date: new Date(2023, 0, 1) },
  { year: 2023, month: 2, description: "Fevereiro 2023", percentage: 0.78, date: new Date(2023, 1, 1) },
  { year: 2023, month: 3, description: "Março 2023", percentage: 0.82, date: new Date(2023, 2, 1) },
  { year: 2023, month: 4, description: "Abril 2023", percentage: 0.75, date: new Date(2023, 3, 1) },
  { year: 2023, month: 5, description: "Maio 2023", percentage: 0.71, date: new Date(2023, 4, 1) },
  { year: 2023, month: 6, description: "Junho 2023", percentage: 0.69, date: new Date(2023, 5, 1) },
  { year: 2023, month: 7, description: "Julho 2023", percentage: 0.73, date: new Date(2023, 6, 1) },
  { year: 2023, month: 8, description: "Agosto 2023", percentage: 0.76, date: new Date(2023, 7, 1) },
  { year: 2023, month: 9, description: "Setembro 2023", percentage: 0.72, date: new Date(2023, 8, 1) },
  { year: 2023, month: 10, description: "Outubro 2023", percentage: 0.74, date: new Date(2023, 9, 1) },
  { year: 2023, month: 11, description: "Novembro 2023", percentage: 0.77, date: new Date(2023, 10, 1) },
  { year: 2023, month: 12, description: "Dezembro 2023", percentage: 0.79, date: new Date(2023, 11, 1) },

  // 2024 (dados já existentes)
  { year: 2024, month: 1, description: "Janeiro 2024", percentage: 0.75, date: new Date(2024, 0, 1) },
  { year: 2024, month: 2, description: "Fevereiro 2024", percentage: 0.68, date: new Date(2024, 1, 1) },
  { year: 2024, month: 3, description: "Março 2024", percentage: 0.82, date: new Date(2024, 2, 1) },
  { year: 2024, month: 4, description: "Abril 2024", percentage: 0.71, date: new Date(2024, 3, 1) },
  { year: 2024, month: 5, description: "Maio 2024", percentage: 0.79, date: new Date(2024, 4, 1) },
  { year: 2024, month: 6, description: "Junho 2024", percentage: 0.65, date: new Date(2024, 5, 1) },
  { year: 2024, month: 7, description: "Julho 2024", percentage: 0.73, date: new Date(2024, 6, 1) },
  { year: 2024, month: 8, description: "Agosto 2024", percentage: 0.67, date: new Date(2024, 7, 1) },
  { year: 2024, month: 9, description: "Setembro 2024", percentage: 0.74, date: new Date(2024, 8, 1) },
  { year: 2024, month: 10, description: "Outubro 2024", percentage: 0.69, date: new Date(2024, 9, 1) },
  { year: 2024, month: 11, description: "Novembro 2024", percentage: 0.72, date: new Date(2024, 10, 1) },
  { year: 2024, month: 12, description: "Dezembro 2024", percentage: 0.76, date: new Date(2024, 11, 1) },

  // 2025 (estimativas para o ano atual)
  { year: 2025, month: 1, description: "Janeiro 2025", percentage: 0.73, date: new Date(2025, 0, 1) },
  { year: 2025, month: 2, description: "Fevereiro 2025", percentage: 0.71, date: new Date(2025, 1, 1) },
  { year: 2025, month: 3, description: "Março 2025", percentage: 0.75, date: new Date(2025, 2, 1) },
  { year: 2025, month: 4, description: "Abril 2025", percentage: 0.68, date: new Date(2025, 3, 1) },
  { year: 2025, month: 5, description: "Maio 2025", percentage: 0.72, date: new Date(2025, 4, 1) },
  { year: 2025, month: 6, description: "Junho 2025", percentage: 0.70, date: new Date(2025, 5, 1) },
  { year: 2025, month: 7, description: "Julho 2025", percentage: 0.74, date: new Date(2025, 6, 1) },
  { year: 2025, month: 8, description: "Agosto 2025", percentage: 0.69, date: new Date(2025, 7, 1) },
  { year: 2025, month: 9, description: "Setembro 2025", percentage: 0.71, date: new Date(2025, 8, 1) },
  { year: 2025, month: 10, description: "Outubro 2025", percentage: 0.73, date: new Date(2025, 9, 1) },
  { year: 2025, month: 11, description: "Novembro 2025", percentage: 0.70, date: new Date(2025, 10, 1) },
  { year: 2025, month: 12, description: "Dezembro 2025", percentage: 0.72, date: new Date(2025, 11, 1) },
];

// CUB/SC correction data for the last 12 months (mantido para compatibilidade)
export const CUB_CORRECTION_DATA = CUB_CORRECTION_HISTORICAL.filter(
  item => item.year === 2024
).map(item => ({
  month: item.month,
  description: item.description,
  percentage: item.percentage
}));

// Função para obter o percentual de correção de um mês específico
export const getCubCorrectionForDate = (date: Date): number => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  
  const correctionData = CUB_CORRECTION_HISTORICAL.find(
    item => item.year === year && item.month === month
  );
  
  return correctionData ? correctionData.percentage : 0.72; // fallback para média
};

// Função para verificar se uma data é retroativa (anterior ao mês atual)
export const isRetroactiveDate = (startDate: Date): boolean => {
  const now = new Date();
  const currentYearMonth = now.getFullYear() * 100 + (now.getMonth() + 1);
  const startYearMonth = startDate.getFullYear() * 100 + (startDate.getMonth() + 1);
  
  return startYearMonth < currentYearMonth;
};

// Função para calcular o fator de correção acumulado historicamente
export const calculateHistoricalCorrectionFactor = (startDate: Date, endDate: Date = new Date()): number => {
  let correctionFactor = 1;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const monthlyPercentage = getCubCorrectionForDate(currentDate);
    correctionFactor *= (1 + monthlyPercentage / 100);
    
    // Avançar para o próximo mês
    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  return correctionFactor;
};
