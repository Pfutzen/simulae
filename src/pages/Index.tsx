
import React, { useState } from "react";
import SimulatorForm from "@/components/SimulatorForm";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SimulationHistory from "@/components/SimulationHistory";
import { useSimulationHistory } from "@/hooks/useSimulationHistory";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("simulator");
  const { 
    simulations, 
    selectedSimulation, 
    saveSimulation, 
    deleteSimulation, 
    selectSimulation, 
    duplicateSimulation, 
    clearSelection 
  } = useSimulationHistory();

  const handleViewSimulation = (id: string) => {
    selectSimulation(id);
    setActiveTab("simulator");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center md:items-start">
            <img 
              src="/lovable-uploads/e8e576bb-04f1-435e-8340-69508d489877.png" 
              alt="Simulae Logo" 
              className="h-16 md:h-20 mb-2"
            />
            <p className="text-slate-600 mt-1">
              Simulador de investimento imobiliário para imóveis na planta
            </p>
          </div>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="simulator">Simulador</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="simulator" className="w-full">
            <TooltipProvider>
              <SimulatorForm 
                initialData={selectedSimulation} 
                onSimulationSave={saveSimulation}
                onClearSelection={clearSelection}
              />
            </TooltipProvider>
          </TabsContent>
          
          <TabsContent value="history">
            <SimulationHistory 
              simulations={simulations} 
              onView={handleViewSimulation}
              onDuplicate={duplicateSimulation}
              onDelete={deleteSimulation}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-white py-6 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          © 2025 Simulae. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default Index;
