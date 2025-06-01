
export interface ImovelConfig {
  valorTotal: number;
  entrada: number;
  cronogramaPagamentos: PagamentoParcela[];
  dataEntrega: Date;
  dataInicio: Date;
}

export interface PagamentoParcela {
  mes: number;
  valor: number;
  data: Date;
  tipo: 'entrada' | 'parcela' | 'reforco' | 'chaves';
}

export interface IndicesEconomicos {
  correcaoMensal: number;
  valorizacaoMensal: number;
  inflacao: number;
  taxaAluguel: number;
}

export interface EstrategiaResultado {
  id: string;
  nome: string;
  periodo: number;
  investimento: number;
  valorVenda: number;
  saldoDevedor: number;
  lucro: number;
  roiTotal: number;
  roiAnual: number;
  receitaExtra?: number;
  descricao: string;
}

export interface ROIEvolution {
  mes: number;
  roiAnual: number;
  roiTotal: number;
  investimentoAcumulado: number;
  valorImovel: number;
}

export interface SensibilityAnalysis {
  correcao: number;
  valorizacao: number;
  estrategias: EstrategiaResultado[];
}
