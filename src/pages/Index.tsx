
import React from "react";
import SimulatorForm from "@/components/SimulatorForm";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center md:items-start">
            <img 
              src="/lovable-uploads/7119182c-6f6b-4785-9c9c-b340b7d3dc22.png" 
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
        <TooltipProvider>
          <SimulatorForm />
        </TooltipProvider>
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
