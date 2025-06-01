
import { ImovelConfig, IndicesEconomicos, EstrategiaResultado, ROIEvolution } from '@/types/investment.types';

// Aplicar correção por índice acumulado
export const aplicarCorrecao = (valorBase: number, taxaMensal: number, meses: number): number => {
  return valorBase * Math.pow(1 + taxaMensal, meses);
};

// Aplicar valorização composta
export const aplicarValorizacao = (valorBase: number, taxaMensal: number, meses: number): number => {
  return valorBase * Math.pow(1 + taxaMensal, meses);
};

// Calcular ROI anualizado
export const calcularROIAnual = (lucro: number, investimento: number, meses: number): number => {
  if (investimento === 0 || meses === 0) return 0;
  return (Math.pow((lucro / investimento) + 1, 12 / meses) - 1) * 100;
};

// Calcular investimento acumulado até determinado período
export const calcularInvestimentoAte = (meses: number, cronograma: any[]): number => {
  return cronograma
    .filter(parcela => parcela.mes <= meses)
    .reduce((total, parcela) => total + parcela.valor, 0);
};

// Calcular saldo devedor em determinado mês
export const calcularSaldoDevedor = (
  valorTotal: number, 
  investimentoAcumulado: number, 
  correcaoMensal: number, 
  meses: number
): number => {
  const saldoInicial = valorTotal - investimentoAcumulado;
  return aplicarCorrecao(saldoInicial, correcaoMensal, meses);
};

// Encontrar ponto de máximo ROI anual
export const encontrarPontoMaximoROI = (
  imovelConfig: ImovelConfig, 
  indices: IndicesEconomicos,
  maxMeses: number = 60
): number => {
  let melhorMes = 12;
  let melhorROI = -Infinity;

  for (let mes = 6; mes <= maxMeses; mes++) {
    const investimento = calcularInvestimentoAte(mes, imovelConfig.cronogramaPagamentos);
    const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, mes);
    const valorVenda = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, mes);
    const saldoDevedor = calcularSaldoDevedor(imovelConfig.valorTotal, investimento, indices.correcaoMensal, mes);
    const lucro = valorVenda - saldoDevedor - investimento;
    
    if (investimento > 0) {
      const roiAnual = calcularROIAnual(lucro, investimento, mes);
      if (roiAnual > melhorROI) {
        melhorROI = roiAnual;
        melhorMes = mes;
      }
    }
  }

  return melhorMes;
};

// Encontrar ponto de máximo ROI total
export const encontrarPontoMaximoROITotal = (
  imovelConfig: ImovelConfig, 
  indices: IndicesEconomicos,
  maxMeses: number = 60
): number => {
  let melhorMes = 24;
  let melhorROI = -Infinity;

  for (let mes = 12; mes <= maxMeses; mes++) {
    const investimento = calcularInvestimentoAte(mes, imovelConfig.cronogramaPagamentos);
    const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, mes);
    const valorVenda = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, mes);
    const saldoDevedor = calcularSaldoDevedor(imovelConfig.valorTotal, investimento, indices.correcaoMensal, mes);
    const lucro = valorVenda - saldoDevedor - investimento;
    
    if (investimento > 0) {
      const roiTotal = (lucro / investimento) * 100;
      if (roiTotal > melhorROI) {
        melhorROI = roiTotal;
        melhorMes = mes;
      }
    }
  }

  return melhorMes;
};

// Calcular meses até entrega
export const calcularMesesAteEntrega = (imovelConfig: ImovelConfig): number => {
  const diffTime = imovelConfig.dataEntrega.getTime() - imovelConfig.dataInicio.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
};

// Calcular receita de aluguel
export const calcularReceitaAluguel = (valorImovel: number, taxaAluguel: number, meses: number): number => {
  const aluguelMensal = (valorImovel * taxaAluguel) / 100;
  return aluguelMensal * meses;
};

// Estratégia 1: Venda no Ponto Ótimo de ROI Anual
export const calcularEstrategia1 = (imovelConfig: ImovelConfig, indices: IndicesEconomicos): EstrategiaResultado => {
  const periodoOtimo = encontrarPontoMaximoROI(imovelConfig, indices);
  const investimentoAcumulado = calcularInvestimentoAte(periodoOtimo, imovelConfig.cronogramaPagamentos);
  const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, periodoOtimo);
  const valorVenda = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, periodoOtimo);
  const saldoDevedor = calcularSaldoDevedor(imovelConfig.valorTotal, investimentoAcumulado, indices.correcaoMensal, periodoOtimo);
  const lucro = valorVenda - saldoDevedor - investimentoAcumulado;

  return {
    id: 'estrategia1',
    nome: 'ROI Anual Máximo',
    periodo: periodoOtimo,
    investimento: investimentoAcumulado,
    valorVenda: valorVenda,
    saldoDevedor: saldoDevedor,
    lucro: lucro,
    roiTotal: investimentoAcumulado > 0 ? (lucro / investimentoAcumulado) * 100 : 0,
    roiAnual: calcularROIAnual(lucro, investimentoAcumulado, periodoOtimo),
    descricao: 'Venda no ponto onde o ROI anualizado é máximo'
  };
};

// Estratégia 2: Venda no Ponto Ótimo de ROI Total
export const calcularEstrategia2 = (imovelConfig: ImovelConfig, indices: IndicesEconomicos): EstrategiaResultado => {
  const periodoOtimo = encontrarPontoMaximoROITotal(imovelConfig, indices);
  const investimentoAcumulado = calcularInvestimentoAte(periodoOtimo, imovelConfig.cronogramaPagamentos);
  const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, periodoOtimo);
  const valorVenda = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, periodoOtimo);
  const saldoDevedor = calcularSaldoDevedor(imovelConfig.valorTotal, investimentoAcumulado, indices.correcaoMensal, periodoOtimo);
  const lucro = valorVenda - saldoDevedor - investimentoAcumulado;

  return {
    id: 'estrategia2',
    nome: 'ROI Total Máximo',
    periodo: periodoOtimo,
    investimento: investimentoAcumulado,
    valorVenda: valorVenda,
    saldoDevedor: saldoDevedor,
    lucro: lucro,
    roiTotal: investimentoAcumulado > 0 ? (lucro / investimentoAcumulado) * 100 : 0,
    roiAnual: calcularROIAnual(lucro, investimentoAcumulado, periodoOtimo),
    descricao: 'Venda no ponto onde o ROI total é máximo'
  };
};

// Estratégia 3: Venda Pós-Entrega com Receita de Aluguel
export const calcularEstrategia3 = (imovelConfig: ImovelConfig, indices: IndicesEconomicos): EstrategiaResultado => {
  const periodoTotal = calcularMesesAteEntrega(imovelConfig) + 6;
  const investimentoTotal = imovelConfig.valorTotal;
  const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, periodoTotal);
  const valorFinalCorrigido = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, periodoTotal);
  const receitaAluguel = calcularReceitaAluguel(valorFinalCorrigido, indices.taxaAluguel, 6);
  const lucroTotal = valorFinalCorrigido + receitaAluguel - investimentoTotal;

  return {
    id: 'estrategia3',
    nome: 'Pós-Entrega + Aluguel',
    periodo: periodoTotal,
    investimento: investimentoTotal,
    valorVenda: valorFinalCorrigido,
    saldoDevedor: 0,
    lucro: lucroTotal,
    roiTotal: (lucroTotal / investimentoTotal) * 100,
    roiAnual: calcularROIAnual(lucroTotal, investimentoTotal, periodoTotal),
    receitaExtra: receitaAluguel,
    descricao: 'Aguarda entrega + 6 meses de aluguel antes da venda'
  };
};

// Calcular todas as estratégias
export const calcularTodasEstrategias = (imovelConfig: ImovelConfig, indices: IndicesEconomicos): EstrategiaResultado[] => {
  return [
    calcularEstrategia1(imovelConfig, indices),
    calcularEstrategia2(imovelConfig, indices),
    calcularEstrategia3(imovelConfig, indices)
  ];
};

// Gerar evolução do ROI no tempo
export const gerarEvolucaoROI = (
  imovelConfig: ImovelConfig, 
  indices: IndicesEconomicos, 
  maxMeses: number = 60
): ROIEvolution[] => {
  const evolucao: ROIEvolution[] = [];

  for (let mes = 1; mes <= maxMeses; mes++) {
    const investimento = calcularInvestimentoAte(mes, imovelConfig.cronogramaPagamentos);
    const valorCorrigido = aplicarCorrecao(imovelConfig.valorTotal, indices.correcaoMensal, mes);
    const valorImovel = aplicarValorizacao(valorCorrigido, indices.valorizacaoMensal, mes);
    const saldoDevedor = calcularSaldoDevedor(imovelConfig.valorTotal, investimento, indices.correcaoMensal, mes);
    const lucro = valorImovel - saldoDevedor - investimento;

    evolucao.push({
      mes,
      roiAnual: investimento > 0 ? calcularROIAnual(lucro, investimento, mes) : 0,
      roiTotal: investimento > 0 ? (lucro / investimento) * 100 : 0,
      investimentoAcumulado: investimento,
      valorImovel: valorImovel
    });
  }

  return evolucao;
};
