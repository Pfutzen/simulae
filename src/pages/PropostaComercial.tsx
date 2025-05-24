
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, FileText, Download, Copy, FileDown, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { SavedSimulation, getActiveSimulation, saveSimulation } from "@/utils/simulationHistoryUtils";
import { generatePropostaPDF } from "@/utils/propostaPdfExport";
import { generatePropostaWord } from "@/utils/propostaWordExport";
import { copyPropostaToClipboard } from "@/utils/propostaTextExport";
import PropostaForm from "@/components/PropostaForm";
import PropostaPreview from "@/components/PropostaPreview";
import { PropostaData } from "@/types/proposta";

const PropostaComercial: React.FC = () => {
  const [activeSimulation, setActiveSimulation] = useState<SavedSimulation | null>(null);
  const [propostagData, setPropostaData] = useState<PropostaData>({
    // Dados do comprador
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    email: '',
    
    // Dados da unidade
    nomeEmpreendimento: '',
    enderecoCompleto: '',
    numeroUnidade: '',
    andarPavimento: '',
    areaPrivativa: '',
    numeroVagas: '',
    possuiBox: false,
    
    // Novas datas de reforço personalizadas
    customReinforcementDates: undefined,
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const simulation = getActiveSimulation();
    if (simulation) {
      setActiveSimulation(simulation);
      // Se a simulação tem datas customizadas, carregar no form
      if (simulation.formData.customReinforcementDates) {
        setPropostaData(prev => ({
          ...prev,
          customReinforcementDates: simulation.formData.customReinforcementDates
        }));
      }
    }
  }, []);

  const handleUpdateSimulationDates = () => {
    if (!activeSimulation || !propostagData.customReinforcementDates) {
      toast({
        title: "Não é possível atualizar",
        description: "Nenhuma data de reforço personalizada foi definida.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Criar nova simulação com as datas atualizadas
      const updatedFormData = {
        ...activeSimulation.formData,
        customReinforcementDates: propostagData.customReinforcementDates
      };

      // Salvar a simulação atualizada
      const updatedSimulation = saveSimulation({
        name: `${activeSimulation.name} (Atualizado)`,
        timestamp: Date.now(),
        formData: updatedFormData,
        schedule: activeSimulation.schedule,
        results: activeSimulation.results,
        bestResaleInfo: activeSimulation.bestResaleInfo
      });

      // Atualizar o estado local
      setActiveSimulation(updatedSimulation);

      toast({
        title: "✅ Simulação atualizada com sucesso",
        description: "Os novos reforços foram aplicados à simulação ativa.",
      });
    } catch (error) {
      console.error('Erro ao atualizar simulação:', error);
      toast({
        title: "Erro ao atualizar simulação",
        description: "Ocorreu um erro ao salvar as novas datas.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    if (!activeSimulation) return;
    
    try {
      generatePropostaPDF(propostagData, activeSimulation);
      toast({
        title: "PDF gerado com sucesso!",
        description: "O arquivo PDF foi baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o arquivo PDF.",
        variant: "destructive"
      });
    }
  };

  const handleExportWord = async () => {
    if (!activeSimulation) return;
    
    try {
      await generatePropostaWord(propostagData, activeSimulation);
      toast({
        title: "Documento Word gerado com sucesso!",
        description: "O arquivo Word foi baixado.",
      });
    } catch (error) {
      console.error('Erro ao gerar Word:', error);
      toast({
        title: "Erro ao gerar Word",
        description: "Ocorreu um erro ao gerar o documento Word.",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = async () => {
    if (!activeSimulation) return;
    
    try {
      await copyPropostaToClipboard(propostagData, activeSimulation);
      toast({
        title: "Texto copiado!",
        description: "A proposta foi copiada para a área de transferência.",
      });
    } catch (error) {
      console.error('Erro ao copiar texto:', error);
      toast({
        title: "Erro ao copiar texto",
        description: "Ocorreu um erro ao copiar o texto.",
        variant: "destructive"
      });
    }
  };

  if (!activeSimulation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              <strong>Nenhuma simulação ativa encontrada.</strong> Para criar uma proposta comercial, 
              você precisa ter uma simulação ativa. Volte para a página inicial e execute uma simulação primeiro.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Proposta Comercial</h1>
              <p className="text-slate-600">
                Simulação: {activeSimulation.name}
              </p>
            </div>
          </div>

          {/* Botões de exportação */}
          <div className="flex gap-2">
            <Button onClick={handleExportPDF} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button onClick={handleExportWord} variant="outline" className="gap-2">
              <FileDown className="h-4 w-4" />
              Word
            </Button>
            <Button onClick={handleCopyText} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar Texto
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <div className="space-y-6">
            <PropostaForm 
              data={propostagData}
              onChange={setPropostaData}
              simulation={activeSimulation}
            />
            
            {/* Botão para atualizar simulação */}
            {propostagData.customReinforcementDates && propostagData.customReinforcementDates.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-800">Datas de reforço personalizadas</h3>
                    <p className="text-xs text-blue-600 mt-1">
                      Você definiu datas personalizadas para os reforços. Clique para atualizar a simulação ativa.
                    </p>
                  </div>
                  <Button
                    onClick={handleUpdateSimulationDates}
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-white hover:bg-blue-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Atualizar simulação com essas datas
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <PropostaPreview 
              data={propostagData}
              simulation={activeSimulation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropostaComercial;
