
import { useState, useMemo } from 'react';
import { ConfiguracaoIndices, TipoIndice } from '@/types/indices';
import { 
  carregarIndicesDoSupabase,
  obterTaxaMensalSupabase, 
  calcularValorCorrigidoSupabase, 
  calcularSaldoComIndiceSupabase 
} from '@/utils/calculosIndicesSupabase';
import { useIndicesSupabase } from './useIndicesSupabase';

export const useIndicesEconomicos = () => {
  const { indices, loading, error } = useIndicesSupabase();
  
  const [config, setConfig] = useState<ConfiguracaoIndices>({
    correcaoMonetaria: {
      tipo: 'CUB_NACIONAL'
    },
    valorizacao: {
      tipo: 'MANUAL',
      valorManual: 1.35 // 1.35% ao mês
    },
    mesInicial: 0 // Começar em Maio (posição 0 do array)
  });

  // Carregar índices do Supabase automaticamente
  useMemo(() => {
    carregarIndicesDoSupabase().catch(error => {
      console.error('Erro ao carregar índices:', error);
    });
  }, []);

  const getTaxaCorrecao = (mesSimulacao: number): number => {
    return obterTaxaMensalSupabase(
      config.correcaoMonetaria.tipo,
      mesSimulacao,
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    );
  };

  const getTaxaValorizacao = (mesSimulacao: number): number => {
    return obterTaxaMensalSupabase(
      config.valorizacao.tipo,
      mesSimulacao,
      config.mesInicial,
      config.valorizacao.valorManual
    );
  };

  const calcularSaldoCorrigido = (saldoAnterior: number, mesSimulacao: number): number => {
    return calcularSaldoComIndiceSupabase(
      saldoAnterior,
      config.correcaoMonetaria.tipo,
      mesSimulacao,
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    );
  };

  const calcularValorImovel = (valorBase: number, meses: number): number => {
    return calcularValorCorrigidoSupabase(
      valorBase,
      config.correcaoMonetaria.tipo,
      config.valorizacao.tipo,
      meses,
      config.mesInicial,
      config.correcaoMonetaria.valorManual,
      config.valorizacao.valorManual
    );
  };

  const estatisticas = useMemo(() => {
    // Calcular médias e totais para 12 meses usando dados do Supabase
    let somaCorrecao = 0;
    let somaValorizacao = 0;
    
    for (let mes = 0; mes < 12; mes++) {
      somaCorrecao += getTaxaCorrecao(mes);
      somaValorizacao += getTaxaValorizacao(mes);
    }
    
    return {
      mediaCorrecaoMensal: somaCorrecao / 12,
      mediaValorizacaoMensal: somaValorizacao / 12,
      correcaoAnual: somaCorrecao,
      valorizacaoAnual: somaValorizacao
    };
  }, [config, indices]);

  return {
    config,
    setConfig,
    getTaxaCorrecao,
    getTaxaValorizacao,
    calcularSaldoCorrigido,
    calcularValorImovel,
    estatisticas,
    loading,
    error,
    indices
  };
};
