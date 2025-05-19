
import React from "react";
import SimulatorForm from "@/components/SimulatorForm";
import { TooltipProvider } from "@/components/ui/tooltip";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-simulae-800">
            Simulae
          </h1>
          <p className="text-slate-600 mt-2">
            Simulador de investimento imobiliário para imóveis na planta
          </p>
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
