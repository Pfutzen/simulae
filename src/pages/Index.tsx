
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FinancingSimulator from '@/components/FinancingSimulator';
import EstrategiaInvestimento from '@/components/EstrategiaInvestimento';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto">
        <Tabs defaultValue="simulador" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="simulador">Simulador Financeiro</TabsTrigger>
            <TabsTrigger value="estrategias">Estratégias de Investimento</TabsTrigger>
          </TabsList>

          <TabsContent value="simulador">
            <FinancingSimulator keysValue={250000} />
          </TabsContent>

          <TabsContent value="estrategias">
            <EstrategiaInvestimento />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
