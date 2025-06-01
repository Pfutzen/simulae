
import { useState, useCallback, useMemo } from 'react';
import { ImovelConfig, IndicesEconomicos, EstrategiaResultado, ROIEvolution } from '@/types/investment.types';
import { calcularTodasEstrategias, gerarEvolucaoROI } from '@/utils/calculosFinanceiros';

export const useEstrategias = () => {
  const [imovelConfig, setImovelConfig] = useState<ImovelConfig>({
    valorTotal: 500000,
    entrada: 50000,
    cronogramaPagamentos: [],
    dataEntrega: new Date(Date.now() + 24 * 30 * 24 * 60 * 60 * 1000), // +24 meses
    dataInicio: new Date()
  });

  const [indices, setIndices] = useState<IndicesEconomicos>({
    correcaoMensal: 0.005, // 0.5%
    valorizacaoMensal: 0.0135, // 1.35%
    inflacao: 0.004, // 0.4%
    taxaAluguel: 0.6 // 0.6%
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Gerar cronograma de pagamentos básico
  const gerarCronograma = useCallback((valorTotal: number, entrada: number, dataInicio: Date, dataEntrega: Date) => {
    const saldoRestante = valorTotal - entrada;
    const diffTime = dataEntrega.getTime() - dataInicio.getTime();
    const meses = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    const valorParcela = saldoRestante / meses;

    const cronograma = [
      {
        mes: 0,
        valor: entrada,
        data: dataInicio,
        tipo: 'entrada' as const
      }
    ];

    for (let i = 1; i <= meses; i++) {
      const dataParcela = new Date(dataInicio);
      dataParcela.setMonth(dataParcela.getMonth() + i);
      
      const valorFinal = i === meses ? saldoRestante - (valorParcela * (meses - 1)) : valorParcela;
      
      cronograma.push({
        mes: i,
        valor: valorFinal,
        data: dataParcela,
        tipo: i === meses ? 'chaves' as const : 'parcela' as const
      });
    }

    return cronograma;
  }, []);

  
  // Atualizar configuração do imóvel
  const updateImovelConfig = useCallback((updates: Partial<ImovelConfig>) => {
    setImovelConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Regenerar cronograma se valores básicos mudaram
      if (updates.valorTotal || updates.entrada || updates.dataInicio || updates.dataEntrega) {
        newConfig.cronogramaPagamentos = gerarCronograma(
          newConfig.valorTotal,
          newConfig.entrada,
          newConfig.dataInicio,
          newConfig.dataEntrega
        );
      }
      
      return newConfig;
    });
  }, [gerarCronograma]);

  // Atualizar índices econômicos
  const updateIndices = useCallback((updates: Partial<IndicesEconomicos>) => {
    setIndices(prev => ({ ...prev, ...updates }));
  }, []);

  // Calcular estratégias
  const estrategias = useMemo((): EstrategiaResultado[] => {
    if (imovelConfig.cronogramaPagamentos.length === 0) return [];
    
    try {
      setIsCalculating(true);
      return calcularTodasEstrategias(imovelConfig, indices);
    } finally {
      setIsCalculating(false);
    }
  }, [imovelConfig, indices]);

  // Gerar evolução do ROI
  const evolucaoROI = useMemo((): ROIEvolution[] => {
    if (imovelConfig.cronogramaPagamentos.length === 0) return [];
    
    return gerarEvolucaoROI(imovelConfig, indices, 60);
  }, [imovelConfig, indices]);

  // Determinar melhor estratégia
  const melhorEstrategia = useMemo(() => {
    if (estrategias.length === 0) return null;
    
    return estrategias.reduce((melhor, atual) => 
      atual.roiAnual > melhor.roiAnual ? atual : melhor
    );
  }, [estrategias]);

  // Inicializar cronograma na primeira renderização
  useMemo(() => {
    if (imovelConfig.cronogramaPagamentos.length === 0) {
      updateImovelConfig({});
    }
  }, [updateImovelConfig, imovelConfig.cronogramaPagamentos.length]);

  return {
    imovelConfig,
    indices,
    estrategias,
    evolucaoROI,
    melhorEstrategia,
    isCalculating,
    updateImovelConfig,
    updateIndices
  };
};
