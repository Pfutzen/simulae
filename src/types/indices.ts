
export type TipoIndice = 'CUB_NACIONAL' | 'IPCA' | 'IGP_M' | 'INCC_NACIONAL' | 'MANUAL';

export interface ConfiguracaoIndices {
  correcaoMonetaria: {
    tipo: TipoIndice;
    valorManual?: number; // Para modo manual (% mensal)
  };
  valorizacao: {
    tipo: TipoIndice;
    valorManual?: number;
  };
  mesInicial: number; // 0-11 (posição no array histórico)
}

export interface DadosMensais {
  mes: number;
  nomeMes: string;
  taxaCorrecao: number;
  taxaValorizacao: number;
  saldo: number;
  valorImovel: number;
  parcela: number;
}
