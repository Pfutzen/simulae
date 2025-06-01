
// Base de dados dos índices econômicos (últimos 12 meses)
export const indicesHistoricos = {
  // Maio/24 a Abril/25 (sequência que se repete)
  CUB_NACIONAL: [0.59, 0.93, 0.69, 0.64, 0.61, 0.67, 0.44, 0.51, 0.71, 0.51, 0.38, 0.59],
  IPCA: [0.46, 0.21, 0.12, -0.02, 0.44, 0.24, 0.39, 0.52, 0.42, 0.83, 0.16, 0.43],
  IGP_M: [0.89, 0.81, 0.61, 0.29, 0.62, 1.52, 1.30, 0.94, 0.27, 1.06, -0.34, 0.24],
  INCC_NACIONAL: [0.59, 0.93, 0.69, 0.64, 0.61, 0.67, 0.44, 0.51, 0.71, 0.51, 0.38, 0.59]
};

export const nomesMeses = [
  'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 
  'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr'
];

export const acumuladoAnual = {
  CUB_NACIONAL: 7.17,
  IPCA: 5.53,
  IGP_M: 7.02,
  INCC_NACIONAL: 7.16
};

export const descricaoIndices = {
  CUB_NACIONAL: 'Custo Unitário Básico - Nacional',
  IPCA: 'Índice Nacional de Preços ao Consumidor Amplo',
  IGP_M: 'Índice Geral de Preços do Mercado',
  INCC_NACIONAL: 'Índice Nacional de Custo da Construção',
  MANUAL: 'Taxa Manual Customizada'
};
