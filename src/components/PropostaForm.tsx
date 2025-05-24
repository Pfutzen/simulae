
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Home, Calendar } from "lucide-react";
import { PropostaData } from "@/types/proposta";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { getReinforcementMonths } from "@/utils/calculationUtils";
import { addMonths, calculateStartDateFromValuation } from "@/utils/dateUtils";
import MonthYearPicker from "./MonthYearPicker";

interface PropostaFormProps {
  data: PropostaData;
  onChange: (data: PropostaData) => void;
  simulation: SavedSimulation;
}

const PropostaForm: React.FC<PropostaFormProps> = ({ data, onChange, simulation }) => {
  const handleInputChange = (field: keyof PropostaData, value: string | boolean | Date[] | undefined) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Calcular datas automáticas dos reforços
  const reinforcementMonths = getReinforcementMonths(
    simulation.formData.installmentsCount,
    simulation.formData.reinforcementFrequency,
    simulation.formData.finalMonthsWithoutReinforcement
  );

  const generateAutomaticDates = (): Date[] => {
    if (!simulation.formData.valuationDate) return [];
    
    const startDate = calculateStartDateFromValuation(new Date(simulation.formData.valuationDate));
    
    return reinforcementMonths.map(month => 
      addMonths(startDate, month - 1)
    );
  };

  const automaticDates = generateAutomaticDates();
  const hasCustomDates = data.customReinforcementDates && data.customReinforcementDates.length > 0;
  const displayDates = hasCustomDates ? data.customReinforcementDates : automaticDates;

  const handleEnableCustomDates = () => {
    handleInputChange('customReinforcementDates', [...automaticDates]);
  };

  const handleResetToAutomatic = () => {
    handleInputChange('customReinforcementDates', undefined);
  };

  const handleCustomDateChange = (index: number, date: Date | undefined) => {
    if (!data.customReinforcementDates || !date) return;
    
    const newDates = [...data.customReinforcementDates];
    newDates[index] = date;
    handleInputChange('customReinforcementDates', newDates);
  };

  return (
    <div className="space-y-6">
      {/* Dados do Comprador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Dados do Comprador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nomeCompleto">Nome completo</Label>
            <Input
              id="nomeCompleto"
              value={data.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              placeholder="Digite o nome completo"
            />
          </div>

          <div>
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={data.cpf}
              onChange={(e) => handleInputChange('cpf', e.target.value)}
              placeholder="000.000.000-00"
            />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              value={data.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados da Unidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5 text-green-600" />
            Dados da Unidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nomeEmpreendimento">Nome do empreendimento</Label>
            <Input
              id="nomeEmpreendimento"
              value={data.nomeEmpreendimento}
              onChange={(e) => handleInputChange('nomeEmpreendimento', e.target.value)}
              placeholder="Nome do empreendimento"
            />
          </div>

          <div>
            <Label htmlFor="enderecoCompleto">Endereço completo</Label>
            <Input
              id="enderecoCompleto"
              value={data.enderecoCompleto}
              onChange={(e) => handleInputChange('enderecoCompleto', e.target.value)}
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroUnidade">Número da unidade</Label>
              <Input
                id="numeroUnidade"
                value={data.numeroUnidade}
                onChange={(e) => handleInputChange('numeroUnidade', e.target.value)}
                placeholder="101"
              />
            </div>

            <div>
              <Label htmlFor="andarPavimento">Andar/pavimento</Label>
              <Input
                id="andarPavimento"
                value={data.andarPavimento}
                onChange={(e) => handleInputChange('andarPavimento', e.target.value)}
                placeholder="1º andar"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="areaPrivativa">Área privativa (m²)</Label>
              <Input
                id="areaPrivativa"
                value={data.areaPrivativa}
                onChange={(e) => handleInputChange('areaPrivativa', e.target.value)}
                placeholder="65,50"
              />
            </div>

            <div>
              <Label htmlFor="numeroVagas">Número de vagas</Label>
              <Input
                id="numeroVagas"
                value={data.numeroVagas}
                onChange={(e) => handleInputChange('numeroVagas', e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="possuiBox"
              checked={data.possuiBox}
              onCheckedChange={(checked) => handleInputChange('possuiBox', checked as boolean)}
            />
            <Label htmlFor="possuiBox">Possui box</Label>
          </div>
        </CardContent>
      </Card>

      {/* Datas dos Reforços */}
      {reinforcementMonths.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Datas dos Reforços
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-slate-600">
                {hasCustomDates ? 'Datas personalizadas' : 'Datas automáticas da simulação'}
              </p>
              {!hasCustomDates ? (
                <button
                  type="button"
                  onClick={handleEnableCustomDates}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Personalizar datas
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetToAutomatic}
                  className="text-sm text-slate-600 hover:text-slate-800"
                >
                  Voltar ao automático
                </button>
              )}
            </div>

            <div className="space-y-3">
              {displayDates.map((date, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      Reforço {index + 1} (Mês {reinforcementMonths[index]})
                    </Label>
                  </div>
                  
                  {hasCustomDates ? (
                    <div className="w-40">
                      <MonthYearPicker
                        value={date}
                        onChange={(newDate) => handleCustomDateChange(index, newDate)}
                        placeholder="MM/AAAA"
                        disablePastDates={true}
                      />
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600 w-40 text-right">
                      {date.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {hasCustomDates && (
              <p className="text-xs text-amber-600 mt-3">
                💡 Após personalizar as datas, use o botão "Atualizar simulação com essas datas" para sincronizar.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PropostaForm;
