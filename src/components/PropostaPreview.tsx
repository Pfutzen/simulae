import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropostaData } from "@/types/proposta";
import { SavedSimulation } from "@/utils/simulationHistoryUtils";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";

interface PropostaPreviewProps {
  data: PropostaData;
  simulation: SavedSimulation | null;
}

const PropostaPreview: React.FC<PropostaPreviewProps> = ({ data, simulation }) => {
  if (!simulation) {
    return (
      <Card className="h-[600px] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-lg">Preview da Proposta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>Nenhuma simulação ativa encontrada.</p>
        </CardContent>
      </Card>
    );
  }

  const propertyInfo = [
    { label: 'Empreendimento', value: data.nomeEmpreendimento },
    { label: 'Endereço', value: data.enderecoCompleto },
    { label: 'Unidade', value: data.numeroUnidade },
    { label: 'Andar/Pavimento', value: data.andarPavimento },
    { label: 'Área Privativa', value: data.areaPrivativa },
    { label: 'Vagas de Garagem', value: data.numeroVagas },
    { label: 'Possui Box?', value: data.possuiBox ? 'Sim' : 'Não' },
  ];

  // Calculate sales costs
  const valorVenda = data.valorVendaPrevisto || simulation.results.propertyValue;
  const totalInvestido = simulation.results.investmentValue;
  const lucroBruto = valorVenda - totalInvestido;
  const comissao = data.incluirComissao ? (valorVenda * data.percentualComissao / 100) : 0;
  const irpf = data.incluirIRPF ? (lucroBruto * data.percentualIRPF / 100) : 0;
  const lucroLiquido = lucroBruto - comissao - irpf;

  return (
    <Card className="h-[600px] overflow-y-auto">
      <CardHeader>
        <CardTitle className="text-lg">Preview da Proposta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-slate-700 mb-2">Informações do Cliente</h3>
          <div className="space-y-1 pl-4">
            <p><strong>Nome:</strong> {data.nomeCompleto}</p>
            <p><strong>CPF:</strong> {data.cpf}</p>
            <p><strong>Telefone:</strong> {data.telefone}</p>
            <p><strong>Email:</strong> {data.email}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 mb-2">Informações do Imóvel</h3>
          <div className="space-y-1 pl-4">
            {propertyInfo.map((item, index) => (
              <p key={index}>
                <strong>{item.label}:</strong> {item.value}
              </p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-700 mb-2">Cronograma de Pagamentos</h3>
          <div className="space-y-1 pl-4">
            <p><strong>Valor do Imóvel:</strong> {formatCurrency(simulation.results.propertyValue)}</p>
            <p><strong>Total Investido:</strong> {formatCurrency(simulation.results.investmentValue)}</p>
            {simulation.schedule && simulation.schedule.map((payment, index) => (
              <p key={index}>
                <strong>{payment.description} ({payment.month} meses):</strong> {formatCurrency(payment.amount)}
              </p>
            ))}
          </div>
        </div>
        
        {(data.incluirComissao || data.incluirIRPF) && (
          <div>
            <h3 className="font-semibold text-green-700 mb-2">💰 Resumo da Venda com Custos</h3>
            <div className="space-y-1 pl-4">
              <p><strong>Valor de Venda Previsto:</strong> {formatCurrency(valorVenda)}</p>
              <p><strong>Total Investido até a Revenda:</strong> {formatCurrency(totalInvestido)}</p>
              <p><strong>Lucro Bruto:</strong> {formatCurrency(lucroBruto)}</p>
              
              {data.incluirComissao && (
                <p className="text-red-600">
                  <strong>− Comissão de Corretagem ({data.percentualComissao}%):</strong> {formatCurrency(comissao)}
                </p>
              )}
              
              {data.incluirIRPF && (
                <p className="text-red-600">
                  <strong>− IRPF sobre Ganho de Capital ({data.percentualIRPF}%):</strong> {formatCurrency(irpf)}
                </p>
              )}
              
              <hr className="my-2" />
              <p className="text-green-700 font-bold">
                <strong>= Lucro Líquido após Custos:</strong> {formatCurrency(lucroLiquido)}
              </p>
              <p className="text-sm text-slate-600">
                Rentabilidade líquida: {formatPercentage((lucroLiquido / totalInvestido) * 100 / 100)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropostaPreview;
