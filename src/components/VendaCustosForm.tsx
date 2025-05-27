
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Calculator } from "lucide-react";
import { PropostaData } from "@/types/proposta";
import { formatCurrency } from "@/utils/formatUtils";

interface VendaCustosFormProps {
  data: PropostaData;
  onChange: (data: PropostaData) => void;
  valorVendaSimulacao: number;
}

const VendaCustosForm: React.FC<VendaCustosFormProps> = ({
  data,
  onChange,
  valorVendaSimulacao
}) => {
  const valorVenda = data.valorVendaPrevisto || valorVendaSimulacao;
  const comissao = data.incluirComissao ? (valorVenda * data.percentualComissao / 100) : 0;
  const irpf = data.incluirIRPF ? (valorVenda * data.percentualIRPF / 100) : 0; // Simplificado para demonstração
  
  const handleFieldChange = (field: keyof PropostaData, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-600" />
          Custos da Venda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Valor de Venda Previsto */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="valorVendaPrevisto">Valor de Venda Previsto</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Valor que você pretende vender o imóvel. Se não informado, será usado o valor da simulação.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="valorVendaPrevisto"
            type="number"
            placeholder={formatCurrency(valorVendaSimulacao)}
            value={data.valorVendaPrevisto || ''}
            onChange={(e) => handleFieldChange('valorVendaPrevisto', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
          <p className="text-sm text-slate-500">
            Valor atual da simulação: {formatCurrency(valorVendaSimulacao)}
          </p>
        </div>

        {/* Comissão de Corretagem */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="incluirComissao"
              checked={data.incluirComissao}
              onCheckedChange={(checked) => handleFieldChange('incluirComissao', checked)}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="incluirComissao">Incluir Comissão de Corretagem</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentual pago ao corretor sobre o valor de venda. Padrão é 5%.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {data.incluirComissao && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="percentualComissao">Percentual (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="percentualComissao"
                  type="number"
                  value={data.percentualComissao}
                  onChange={(e) => handleFieldChange('percentualComissao', parseFloat(e.target.value) || 0)}
                  className="w-24"
                  min="0"
                  max="20"
                  step="0.1"
                />
                <span className="text-sm text-slate-600">
                  = {formatCurrency(comissao)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* IRPF */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="incluirIRPF"
              checked={data.incluirIRPF}
              onCheckedChange={(checked) => handleFieldChange('incluirIRPF', checked)}
            />
            <div className="flex items-center gap-2">
              <Label htmlFor="incluirIRPF">Incluir IRPF sobre Ganho de Capital</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Imposto de Renda sobre ganho de capital. Padrão é 15% sobre o lucro.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {data.incluirIRPF && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="percentualIRPF">Percentual (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="percentualIRPF"
                  type="number"
                  value={data.percentualIRPF}
                  onChange={(e) => handleFieldChange('percentualIRPF', parseFloat(e.target.value) || 0)}
                  className="w-24"
                  min="0"
                  max="30"
                  step="0.1"
                />
                <span className="text-sm text-slate-600">
                  = {formatCurrency(irpf)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Resumo dos Custos */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-3">Resumo dos Custos</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Valor de Venda:</span>
              <span className="font-semibold">{formatCurrency(valorVenda)}</span>
            </div>
            {data.incluirComissao && (
              <div className="flex justify-between text-red-600">
                <span>− Comissão ({data.percentualComissao}%):</span>
                <span className="font-semibold">{formatCurrency(comissao)}</span>
              </div>
            )}
            {data.incluirIRPF && (
              <div className="flex justify-between text-red-600">
                <span>− IRPF ({data.percentualIRPF}%):</span>
                <span className="font-semibold">{formatCurrency(irpf)}</span>
              </div>
            )}
            <hr className="border-blue-300" />
            <div className="flex justify-between font-semibold text-blue-800">
              <span>Valor Líquido:</span>
              <span>{formatCurrency(valorVenda - comissao - irpf)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendaCustosForm;
