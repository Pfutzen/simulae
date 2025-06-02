
import { TipoIndice } from '../types/indices';

// Cache para os índices carregados
let indicesCarregados: { [key in TipoIndice]?: number[] } = {};
let indicesCarregadosFlag = false;
let promiseCarregamento: Promise<void> | null = null;

export async function carregarIndicesDoSupabase(): Promise<void> {
  if (indicesCarregadosFlag) return;
  
  // Se já existe uma promise de carregamento, aguarda ela
  if (promiseCarregamento) return promiseCarregamento;

  promiseCarregamento = (async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase
        .from('indices_economicos')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.warn('Erro ao carregar índices do Supabase, usando fallback:', error);
        usarDadosFallback();
      } else if (data && data.length > 0) {
        console.log('Índices carregados do Supabase:', data);
        
        indicesCarregados = {
          CUB_NACIONAL: data.map(item => item.cub_nacional || 0),
          IPCA: data.map(item => item.ipca || 0),
          IGP_M: data.map(item => item.igpm || 0),
          INCC_NACIONAL: data.map(item => item.incc || 0)
        };
        
        console.log('Índices organizados por tipo:', indicesCarregados);
      } else {
        console.warn('Nenhum dado encontrado no Supabase, usando fallback');
        usarDadosFallback();
      }
      
      indicesCarregadosFlag = true;
    } catch (error) {
      console.warn('Erro ao conectar com Supabase, usando dados estáticos:', error);
      usarDadosFallback();
      indicesCarregadosFlag = true;
    }
  })();

  return promiseCarregamento;
}

function usarDadosFallback() {
  indicesCarregados = {
    CUB_NACIONAL: [0.59, 0.93, 0.69, 0.64, 0.61, 0.67, 0.44, 0.51, 0.71, 0.51, 0.38, 0.59],
    IPCA: [0.46, 0.21, 0.12, -0.02, 0.44, 0.24, 0.39, 0.52, 0.42, 0.83, 0.16, 0.43],
    IGP_M: [0.89, 0.81, 0.61, 0.29, 0.62, 1.52, 1.30, 0.94, 0.27, 1.06, -0.34, 0.24],
    INCC_NACIONAL: [0.59, 0.93, 0.69, 0.64, 0.61, 0.67, 0.44, 0.51, 0.71, 0.51, 0.38, 0.59]
  };
}

export function obterTaxaMensalSupabase(
  tipo: TipoIndice, 
  mesSimulacao: number, 
  mesInicial: number = 0,
  valorManual?: number
): number {
  // Garantir que os índices foram carregados
  if (!indicesCarregadosFlag) {
    console.warn('Índices não carregados ainda, usando fallback temporário');
    usarDadosFallback();
  }

  if (tipo === 'MANUAL') {
    return valorManual ? valorManual / 100 : 0;
  }

  const indices = indicesCarregados[tipo];
  if (!indices || indices.length === 0) {
    console.warn(`Índices não encontrados para ${tipo}, retornando 0`);
    return 0;
  }

  // Calcula a posição no ciclo de 12 meses
  const posicaoNoCiclo = (mesInicial + mesSimulacao) % indices.length;
  const taxa = indices[posicaoNoCiclo];
  
  console.log(`Taxa ${tipo} mês ${mesSimulacao}: ${taxa}% (posição ${posicaoNoCiclo}, mesInicial: ${mesInicial})`);
  
  // Retorna a taxa em decimal (ex: 0.59% -> 0.0059)
  return taxa / 100;
}

export function calcularCorrecaoAcumuladaSupabase(
  tipo: TipoIndice,
  meses: number,
  mesInicial: number = 0,
  valorManual?: number
): number {
  let valorAcumulado = 1;

  for (let mes = 0; mes < meses; mes++) {
    const taxa = obterTaxaMensalSupabase(tipo, mes, mesInicial, valorManual);
    valorAcumulado *= (1 + taxa);
  }

  console.log(`Correção acumulada ${tipo} ${meses} meses: ${((valorAcumulado - 1) * 100).toFixed(2)}%`);
  
  return valorAcumulado;
}

export function calcularValorCorrigidoSupabase(
  valorBase: number,
  tipoCorrecao: TipoIndice,
  tipoValorizacao: TipoIndice,
  meses: number,
  mesInicial: number = 0,
  valorManualCorrecao?: number,
  valorManualValorizacao?: number
): number {
  const correcaoAcumulada = calcularCorrecaoAcumuladaSupabase(
    tipoCorrecao, meses, mesInicial, valorManualCorrecao
  );
  
  const valorizacaoAcumulada = calcularCorrecaoAcumuladaSupabase(
    tipoValorizacao, meses, mesInicial, valorManualValorizacao
  );

  const valorFinal = valorBase * correcaoAcumulada * valorizacaoAcumulada;
  
  console.log(`=== VALOR CORRIGIDO MÊS ${meses} (SUPABASE) ===`);
  console.log(`Valor base: R$ ${valorBase.toFixed(2)}`);
  console.log(`Correção ${tipoCorrecao}: ${((correcaoAcumulada - 1) * 100).toFixed(2)}%`);
  console.log(`Valorização ${tipoValorizacao}: ${((valorizacaoAcumulada - 1) * 100).toFixed(2)}%`);
  console.log(`Valor final: R$ ${valorFinal.toFixed(2)}`);
  
  return valorFinal;
}

export function calcularSaldoComIndiceSupabase(
  saldoAnterior: number,
  tipo: TipoIndice,
  mesSimulacao: number,
  mesInicial: number = 0,
  valorManual?: number
): number {
  const taxa = obterTaxaMensalSupabase(tipo, mesSimulacao, mesInicial, valorManual);
  const saldoCorrigido = saldoAnterior * (1 + taxa);
  
  console.log(`=== CORREÇÃO SALDO MÊS ${mesSimulacao + 1} (SUPABASE) ===`);
  console.log(`Saldo anterior: R$ ${saldoAnterior.toFixed(2)}`);
  console.log(`Taxa ${tipo}: ${(taxa * 100).toFixed(4)}%`);
  console.log(`Saldo corrigido: R$ ${saldoCorrigido.toFixed(2)}`);
  
  return saldoCorrigido;
}
