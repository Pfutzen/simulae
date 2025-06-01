
import { indicesHistoricos } from '../data/indicesEconomicos';
import { TipoIndice } from '../types/indices';

export function obterTaxaMensal(
  tipo: TipoIndice, 
  mesSimulacao: number, 
  mesInicial: number = 0,
  valorManual?: number
): number {
  if (tipo === 'MANUAL') {
    return valorManual ? valorManual / 100 : 0;
  }

  const indices = indicesHistoricos[tipo];
  if (!indices) return 0;

  // Calcula a posição no ciclo de 12 meses
  const posicaoNoCiclo = (mesInicial + mesSimulacao) % 12;
  
  console.log(`Taxa ${tipo} mês ${mesSimulacao}: ${indices[posicaoNoCiclo]}% (posição ${posicaoNoCiclo})`);
  
  // Retorna a taxa em decimal (ex: 0.59% -> 0.0059)
  return indices[posicaoNoCiclo] / 100;
}

export function calcularCorrecaoAcumulada(
  tipo: TipoIndice,
  meses: number,
  mesInicial: number = 0,
  valorManual?: number
): number {
  let valorAcumulado = 1;

  for (let mes = 0; mes < meses; mes++) {
    const taxa = obterTaxaMensal(tipo, mes, mesInicial, valorManual);
    valorAcumulado *= (1 + taxa);
  }

  console.log(`Correção acumulada ${tipo} ${meses} meses: ${((valorAcumulado - 1) * 100).toFixed(2)}%`);
  
  return valorAcumulado;
}

export function calcularValorCorrigido(
  valorBase: number,
  tipoCorrecao: TipoIndice,
  tipoValorizacao: TipoIndice,
  meses: number,
  mesInicial: number = 0,
  valorManualCorrecao?: number,
  valorManualValorizacao?: number
): number {
  const correcaoAcumulada = calcularCorrecaoAcumulada(
    tipoCorrecao, meses, mesInicial, valorManualCorrecao
  );
  
  const valorizacaoAcumulada = calcularCorrecaoAcumulada(
    tipoValorizacao, meses, mesInicial, valorManualValorizacao
  );

  const valorFinal = valorBase * correcaoAcumulada * valorizacaoAcumulada;
  
  console.log(`=== VALOR CORRIGIDO MÊS ${meses} ===`);
  console.log(`Valor base: R$ ${valorBase.toFixed(2)}`);
  console.log(`Correção ${tipoCorrecao}: ${((correcaoAcumulada - 1) * 100).toFixed(2)}%`);
  console.log(`Valorização ${tipoValorizacao}: ${((valorizacaoAcumulada - 1) * 100).toFixed(2)}%`);
  console.log(`Valor final: R$ ${valorFinal.toFixed(2)}`);
  
  return valorFinal;
}

export function calcularSaldoComIndice(
  saldoAnterior: number,
  tipo: TipoIndice,
  mesSimulacao: number,
  mesInicial: number = 0,
  valorManual?: number
): number {
  const taxa = obterTaxaMensal(tipo, mesSimulacao, mesInicial, valorManual);
  const saldoCorrigido = saldoAnterior * (1 + taxa);
  
  console.log(`=== CORREÇÃO SALDO MÊS ${mesSimulacao + 1} ===`);
  console.log(`Saldo anterior: R$ ${saldoAnterior.toFixed(2)}`);
  console.log(`Taxa ${tipo}: ${(taxa * 100).toFixed(4)}%`);
  console.log(`Saldo corrigido: R$ ${saldoCorrigido.toFixed(2)}`);
  
  return saldoCorrigido;
}
