
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SavedSimulation, setActiveSimulation, saveSimulation } from "@/utils/simulationHistoryUtils";
import { PaymentType } from "@/utils/types";

interface PropostaButtonProps {
  simulation?: SavedSimulation;
  schedule: PaymentType[];
  resaleResults: {
    investmentValue: number;
    propertyValue: number;
    profit: number;
    profitPercentage: number;
    remainingBalance: number;
    rentalEstimate: number;
    annualRentalReturn: number;
  };
  bestResaleInfo: {
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    maxProfitTotalPaid: number;
    bestRoiMonth: number;
    maxRoi: number;
    maxRoiProfit: number;
    maxRoiTotalPaid: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
    earlyTotalPaid?: number;
  };
  formData: any;
  appreciationIndex: number;
}

const PropostaButton: React.FC<PropostaButtonProps> = ({
  simulation,
  schedule,
  resaleResults,
  bestResaleInfo,
  formData,
  appreciationIndex
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateProposta = () => {
    if (!schedule || schedule.length === 0) {
      toast({
        title: "Simulação necessária",
        description: "Execute uma simulação antes de criar a proposta comercial.",
        variant: "destructive"
      });
      return;
    }

    try {
      let activeSimulationData: SavedSimulation;

      // Se já existe uma simulação salva, usar ela
      if (simulation) {
        activeSimulationData = simulation;
      } else {
        // Se não existe, criar e salvar uma nova simulação
        const newSimulation = {
          name: "Simulação para Proposta",
          timestamp: Date.now(),
          formData,
          schedule,
          results: resaleResults,
          bestResaleInfo,
          appreciationIndex
        };

        // Salvar no histórico
        activeSimulationData = saveSimulation(newSimulation);
        
        toast({
          title: "Simulação salva",
          description: "A simulação foi salva automaticamente no histórico.",
        });
      }

      // Garantir que a simulação está definida como ativa
      setActiveSimulation(activeSimulationData);

      console.log('PropostaButton: Navegando para proposta comercial com simulação:', {
        id: activeSimulationData.id,
        hasSchedule: activeSimulationData.schedule.length > 0,
        hasResults: !!activeSimulationData.results
      });

      // Navegar para a página de proposta
      navigate('/proposta-comercial');

      toast({
        title: "Proposta comercial",
        description: "Redirecionando para a criação da proposta comercial..."
      });

    } catch (error) {
      console.error('Erro ao preparar proposta comercial:', error);
      toast({
        title: "Erro ao criar proposta",
        description: "Ocorreu um erro ao preparar a proposta comercial.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleCreateProposta}
      className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg w-full sm:w-auto gap-2"
      disabled={!schedule || schedule.length === 0}
    >
      <FileText className="h-5 w-5" />
      Gerar Proposta Comercial
    </Button>
  );
};

export default PropostaButton;
