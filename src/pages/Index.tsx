
import React from "react";
import SimulatorForm from "@/components/SimulatorForm";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
import HeroSection from "@/components/HeroSection";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

const Index = () => {
  const { isSessionExpired, resetSession } = useSessionTimeout();

  const handleValidPassword = () => {
    resetSession();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png" 
                alt="Simulae Logo" 
                className="h-10 md:h-12"
              />
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#simulator" className="text-slate-600 hover:text-primary transition-colors">
                Simulador
              </a>
              <a href="#testimonials" className="text-slate-600 hover:text-primary transition-colors">
                Depoimentos
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <HeroSection />
      
      <main id="simulator" className="flex-grow px-4 sm:px-6 py-12" data-simulator-form>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comece sua simulação agora
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Preencha os dados do imóvel e descubra o potencial de investimento completo
            </p>
          </div>
          
          <TooltipProvider>
            <SimulatorForm />
          </TooltipProvider>
        </div>
      </main>
      
      <footer className="bg-white py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div>
              <img 
                src="/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png" 
                alt="Simulae Logo" 
                className="h-10 mb-4"
              />
              <p className="text-slate-600 text-sm">
                O simulador mais completo para investimento em imóveis na planta.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Funcionalidades</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Simulação de parcelas</li>
                <li>Análise de valorização</li>
                <li>Cálculo de revenda</li>
                <li>Proposta comercial</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Suporte</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>Central de ajuda</li>
                <li>Contato</li>
                <li>Termos de uso</li>
                <li>Política de privacidade</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-6 text-center text-slate-500 text-sm">
            © 2025 Simulae. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <SessionTimeoutModal 
        isOpen={isSessionExpired}
        onValidPassword={handleValidPassword}
      />
    </div>
  );
};

export default Index;
