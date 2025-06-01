
import { useState, useMemo } from 'react';
import { ConfiguracaoIndices, TipoIndice } from '@/types/indices';
import { obterTaxaMensal, calcularValorCorrigido, calcularSaldoComIndice } from '@/utils/calculosIndices';

export const useIndicesEconomicos = () => {
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

  const getTaxaCorrecao = (mesSimulacao: number): number => {
    return obterTaxaMensal(
      config.correcaoMonetaria.tipo,
      mesSimulacao,
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    );
  };

  const getTaxaValorizacao = (mesSimulacao: number): number => {
    return obterTaxaMensal(
      config.valorizacao.tipo,
      mesSimulacao,
      config.mesInicial,
      config.valorizacao.valorManual
    );
  };

  const calcularSaldoCorrigido = (saldoAnterior: number, mesSimulacao: number): number => {
    return calcularSaldoComIndice(
      saldoAnterior,
      config.correcaoMonetaria.tipo,
      mesSimulacao,
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    );
  };

  const calcularValorImovel = (valorBase: number, meses: number): number => {
    return calcularValorCorrigido(
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
    // Calcular médias e totais para 12 meses
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
  }, [config]);

  return {
    config,
    setConfig,
    getTaxaCorrecao,
    getTaxaValorizacao,
    calcularSaldoCorrigido,
    calcularValorImovel,
    estatisticas
  };
};
