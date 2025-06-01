import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, DollarSign } from "lucide-react";
import { formatCurrency, formatDateBR } from "@/utils/formatUtils";
import { PropostaData } from "@/types/proposta";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";

interface PropostaPreviewProps {
  data: PropostaData;
  simulation: SavedSimulation;
}

const PropostaPreview: React.FC<PropostaPreviewProps> = ({ data, simulation }) => {
  // Calcular data de entrega das chaves
  const getKeysDeliveryDate = () => {
    if (simulation.formData.startDate) {
      const keysDate = new Date(simulation.formData.startDate);
      keysDate.setMonth(keysDate.getMonth() + simulation.formData.installmentsCount + 1);
      return formatDateBR(keysDate);
    }
    return `${simulation.formData.installmentsCount + 1} meses após o início`;
  };

  // Gerar descrição da correção monetária baseada no modo
  const getCorrectionDescription = () => {
    if (simulation.formData.correctionMode === "cub") {
      return "Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice CUB acumulado (média dos últimos 12 meses) até a data de vencimento de cada parcela, conforme política vigente da construtora.";
    } else {
      const percentage = (simulation.formData.correctionIndex * 100).toFixed(2);
      return `Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice de ${percentage}% ao mês até a data de vencimento de cada parcela, conforme política vigente da construtora.`;
    }
  };

  // Get reinforcements, ensuring schedule exists
  const reinforcements = simulation.schedule?.filter(payment => 
    payment.description.includes("Reforço")
  ) || [];

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-purple-600" />
          Preview da Proposta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-800">PROPOSTA COMERCIAL</h2>
          <Badge variant="outline" className="bg-blue-50">
            Simulação: {simulation.name}
          </Badge>
        </div>

        <Separator />

        {/* Dados do Comprador */}
        <div>
          <h3 className="font-semibold text-slate-700 mb-3">DADOS DO COMPRADOR</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {data.nomeCompleto || "___________________"}</p>
            <p><strong>CPF:</strong> {data.cpf || "___.___.___-__"}</p>
            <p><strong>Telefone:</strong> {data.telefone || "(__) _____-____"}</p>
            <p><strong>E-mail:</strong> {data.email || "_________________"}</p>
          </div>
        </div>

        <Separator />

        {/* Dados da Unidade */}
        <div>
          <h3 className="font-semibold text-slate-700 mb-3">DADOS DA UNIDADE</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Empreendimento:</strong> {data.nomeEmpreendimento || "___________________"}</p>
            <p><strong>Endereço:</strong> {data.enderecoCompleto || "___________________"}</p>
            <p><strong>Unidade:</strong> {data.numeroUnidade || "___"} - {data.andarPavimento || "___º andar"}</p>
            <p><strong>Área privativa:</strong> {data.areaPrivativa || "___"} m²</p>
            <p><strong>Vagas:</strong> {data.numeroVagas || "___"} {data.possuiBox ? "com box" : "sem box"}</p>
          </div>
        </div>

        <Separator />

        {/* Dados Financeiros */}
        <div>
          <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            PROPOSTA FINANCEIRA
          </h3>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-800">Valor total do imóvel:</p>
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(simulation.formData.propertyValue)}
              </p>
            </div>

            <div className="space-y-2">
              <p><strong>Entrada:</strong> {formatCurrency(simulation.formData.downPaymentValue)}</p>
              {simulation.formData.startDate && (
                <p className="text-xs text-slate-600">
                  Data: {formatDateBR(new Date(simulation.formData.startDate))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <p><strong>Parcelas mensais:</strong></p>
              <p className="ml-4">
                {simulation.formData.installmentsCount}x de {formatCurrency(simulation.formData.installmentsValue)}
              </p>
              {simulation.formData.startDate && (
                <p className="text-xs text-slate-600 ml-4">
                  Período: {formatDateBR(new Date(new Date(simulation.formData.startDate).setMonth(new Date(simulation.formData.startDate).getMonth() + 1)))} até{' '}
                  {formatDateBR(new Date(new Date(simulation.formData.startDate).setMonth(new Date(simulation.formData.startDate).getMonth() + simulation.formData.installmentsCount)))}
                </p>
              )}
            </div>

            {reinforcements.length > 0 && (
              <div className="space-y-2">
                <p><strong>Reforços:</strong></p>
                {reinforcements.map((reinforcement, index) => (
                  <p key={index} className="ml-4 text-xs">
                    Mês {reinforcement.month}: {formatCurrency(reinforcement.amount)}
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <p><strong>Saldo na entrega das chaves:</strong></p>
              <p className="ml-4">
                {formatCurrency(simulation.formData.keysValue)}
              </p>
              <p className="text-xs text-slate-600 ml-4">
                Data prevista: {getKeysDeliveryDate()}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Texto sobre correção monetária */}
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            CORREÇÃO MONETÁRIA
          </h3>
          <p className="text-xs text-amber-700 leading-relaxed">
            {getCorrectionDescription()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropostaPreview;
