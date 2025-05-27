
export interface PropostaData {
  // Dados do comprador
  nomeCompleto: string;
  cpf: string;
  telefone: string;
  email: string;
  
  // Dados da unidade
  nomeEmpreendimento: string;
  enderecoCompleto: string;
  numeroUnidade: string;
  andarPavimento: string;
  areaPrivativa: string;
  numeroVagas: string;
  possuiBox: boolean;
  
  // Datas personalizadas dos reforços
  customReinforcementDates?: Date[];
  
  // Novos campos para custos da venda
  incluirComissao: boolean;
  percentualComissao: number;
  incluirIRPF: boolean;
  percentualIRPF: number;
  valorVendaPrevisto?: number; // Opcional - se não informado, usa o valor da simulação
}
