
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
}
