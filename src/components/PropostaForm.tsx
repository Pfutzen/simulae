import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Users, Building2, Calendar as CalendarIconLucide, Plus, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PropostaData } from "@/types/proposta";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import VendaCustosForm from "./VendaCustosForm";

interface PropostaFormProps {
  data: PropostaData;
  onChange: (data: PropostaData) => void;
  simulation: SavedSimulation | null;
}

const PropostaForm: React.FC<PropostaFormProps> = ({ data, onChange, simulation }) => {
  // Initialize default values if not set
  React.useEffect(() => {
    if (data.incluirComissao === undefined) {
      onChange({
        ...data,
        incluirComissao: true,
        percentualComissao: 5,
        incluirIRPF: true,
        percentualIRPF: 15
      });
    }
  }, []);

  const handleFieldChange = (field: keyof PropostaData, value: any) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const resalePropertyValue = simulation?.results?.propertyValue || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Dados do Comprador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeCompleto">Nome Completo</Label>
              <Input
                type="text"
                id="nomeCompleto"
                value={data.nomeCompleto}
                onChange={(e) => handleFieldChange('nomeCompleto', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cpf">CPF</Label>
              <Input
                type="text"
                id="cpf"
                value={data.cpf}
                onChange={(e) => handleFieldChange('cpf', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                type="text"
                id="telefone"
                value={data.telefone}
                onChange={(e) => handleFieldChange('telefone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                id="email"
                value={data.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Dados da Unidade</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nomeEmpreendimento">Nome do Empreendimento</Label>
              <Input
                type="text"
                id="nomeEmpreendimento"
                value={data.nomeEmpreendimento}
                onChange={(e) => handleFieldChange('nomeEmpreendimento', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="enderecoCompleto">Endereço Completo</Label>
              <Input
                type="text"
                id="enderecoCompleto"
                value={data.enderecoCompleto}
                onChange={(e) => handleFieldChange('enderecoCompleto', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="numeroUnidade">Número da Unidade</Label>
              <Input
                type="text"
                id="numeroUnidade"
                value={data.numeroUnidade}
                onChange={(e) => handleFieldChange('numeroUnidade', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="andarPavimento">Andar/Pavimento</Label>
              <Input
                type="text"
                id="andarPavimento"
                value={data.andarPavimento}
                onChange={(e) => handleFieldChange('andarPavimento', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="areaPrivativa">Área Privativa (m²)</Label>
              <Input
                type="text"
                id="areaPrivativa"
                value={data.areaPrivativa}
                onChange={(e) => handleFieldChange('areaPrivativa', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numeroVagas">Número de Vagas</Label>
              <Input
                type="text"
                id="numeroVagas"
                value={data.numeroVagas}
                onChange={(e) => handleFieldChange('numeroVagas', e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="possuiBox"
                checked={data.possuiBox}
                onCheckedChange={(checked) => handleFieldChange('possuiBox', checked)}
              />
              <Label htmlFor="possuiBox">Possui Box?</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <VendaCustosForm
        data={data}
        onChange={onChange}
        valorVendaSimulacao={resalePropertyValue}
      />
    </div>
  );
};

export default PropostaForm;
