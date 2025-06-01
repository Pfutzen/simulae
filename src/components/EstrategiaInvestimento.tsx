
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEstrategias } from '@/hooks/useEstrategias';
import ConfigPanel from './ConfigPanel';
import EstrategiaCard from './EstrategiaCard';
import ComparativoTable from './ComparativoTable';
import GraficosAnalise from './GraficosAnalise';

const EstrategiaInvestimento: React.FC = () => {
  const {
    imovelConfig,
    indices,
    estrategias,
    evolucaoROI,
    melhorEstrategia,
    isCalculating,
    updateImovelConfig,
    updateIndices
  } = useEstrategias();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Análise de Estratégias de Investimento Imobiliário
          </CardTitle>
          <CardDescription className="text-center">
            Compare diferentes estratégias de revenda e maximize seu ROI
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="configuracao" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="estrategias">Estratégias</TabsTrigger>
          <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
          <TabsTrigger value="graficos">Análise Gráfica</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracao" className="space-y-6">
          <ConfigPanel
            imovelConfig={imovelConfig}
            indices={indices}
            onUpdateImovel={updateImovelConfig}
            onUpdateIndices={updateIndices}
          />
        </TabsContent>

        <TabsContent value="estrategias" className="space-y-6">
          {isCalculating ? (
            <div className="text-center py-8">
              <div className="text-lg">Calculando estratégias...</div>
            </div>
          ) : (
            <>
              {melhorEstrategia && (
                <Card className="border-green-200 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-green-800">
                      🏆 Melhor Estratégia: {melhorEstrategia.nome}
                    </CardTitle>
                    <CardDescription>
                      ROI Anual: {melhorEstrategia.roiAnual.toFixed(1)}% | 
                      Período: {melhorEstrategia.periodo} meses
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {estrategias.map(estrategia => (
                  <EstrategiaCard 
                    key={estrategia.id} 
                    estrategia={estrategia}
                    isMelhor={estrategia.id === melhorEstrategia?.id}
                  />
                ))}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="comparativo" className="space-y-6">
          <ComparativoTable estrategias={estrategias} />
        </TabsContent>

        <TabsContent value="graficos" className="space-y-6">
          <GraficosAnalise 
            estrategias={estrategias}
            evolucaoROI={evolucaoROI}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstrategiaInvestimento;
