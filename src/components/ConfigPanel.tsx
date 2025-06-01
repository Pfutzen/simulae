
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ImovelConfig, IndicesEconomicos } from '@/types/investment.types';
import CurrencyInput from '@/components/CurrencyInput';
import DatePicker from '@/components/DatePicker';
import PercentageInput from '@/components/PercentageInput';

interface ConfigPanelProps {
  imovelConfig: ImovelConfig;
  indices: IndicesEconomicos;
  onUpdateImovel: (updates: Partial<ImovelConfig>) => void;
  onUpdateIndices: (updates: Partial<IndicesEconomicos>) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  imovelConfig,
  indices,
  onUpdateImovel,
  onUpdateIndices
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Imóvel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="valorTotal">Valor Total do Imóvel</Label>
            <CurrencyInput
              id="valorTotal"
              value={imovelConfig.valorTotal}
              onChange={(value) => onUpdateImovel({ valorTotal: value })}
            />
          </div>

          <div>
            <Label htmlFor="entrada">Valor da Entrada</Label>
            <CurrencyInput
              id="entrada"
              value={imovelConfig.entrada}
              onChange={(value) => onUpdateImovel({ entrada: value })}
            />
          </div>

          <div>
            <Label htmlFor="dataInicio">Data do Primeiro Pagamento</Label>
            <DatePicker
              id="dataInicio"
              value={imovelConfig.dataInicio}
              onChange={(date) => date && onUpdateImovel({ dataInicio: date })}
            />
          </div>

          <div>
            <Label htmlFor="dataEntrega">Data Prevista de Entrega</Label>
            <DatePicker
              id="dataEntrega"
              value={imovelConfig.dataEntrega}
              onChange={(date) => date && onUpdateImovel({ dataEntrega: date })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Índices Econômicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="correcaoMensal">Correção Mensal (%)</Label>
            <PercentageInput
              id="correcaoMensal"
              value={indices.correcaoMensal * 100}
              onChange={(value) => onUpdateIndices({ correcaoMensal: value / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="valorizacaoMensal">Valorização Mensal (%)</Label>
            <PercentageInput
              id="valorizacaoMensal"
              value={indices.valorizacaoMensal * 100}
              onChange={(value) => onUpdateIndices({ valorizacaoMensal: value / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="inflacao">Inflação Mensal (%)</Label>
            <PercentageInput
              id="inflacao"
              value={indices.inflacao * 100}
              onChange={(value) => onUpdateIndices({ inflacao: value / 100 })}
            />
          </div>

          <div>
            <Label htmlFor="taxaAluguel">Taxa de Aluguel Mensal (%)</Label>
            <PercentageInput
              id="taxaAluguel"
              value={indices.taxaAluguel * 100}
              onChange={(value) => onUpdateIndices({ taxaAluguel: value / 100 })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigPanel;
