
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoIndices, TipoIndice } from '@/types/indices';
import { acumuladoAnual, descricaoIndices } from '@/data/indicesEconomicos';
import PreviewTaxas from './PreviewTaxas';

interface ConfiguracaoIndicesProps {
  config: ConfiguracaoIndices;
  onChange: (config: ConfiguracaoIndices) => void;
}

const ConfiguracaoIndicesComponent: React.FC<ConfiguracaoIndicesProps> = ({ config, onChange }) => {
  const opcoes: Array<{ value: TipoIndice; label: string; acumulado: string }> = [
    { value: 'CUB_NACIONAL', label: 'CUB Nacional', acumulado: '7,17%' },
    { value: 'IPCA', label: 'IPCA', acumulado: '5,53%' },
    { value: 'IGP_M', label: 'IGP-M', acumulado: '7,02%' },
    { value: 'INCC_NACIONAL', label: 'INCC Nacional', acumulado: '7,16%' },
    { value: 'MANUAL', label: 'Manual', acumulado: 'Customizado' }
  ];

  const handleCorrecaoChange = (tipo: TipoIndice) => {
    onChange({
      ...config,
      correcaoMonetaria: { ...config.correcaoMonetaria, tipo }
    });
  };

  const handleValorizacaoChange = (tipo: TipoIndice) => {
    onChange({
      ...config,
      valorizacao: { ...config.valorizacao, tipo }
    });
  };

  const handleCorrecaoManualChange = (valor: string) => {
    const valorNumerico = parseFloat(valor) || 0;
    onChange({
      ...config,
      correcaoMonetaria: { 
        ...config.correcaoMonetaria, 
        valorManual: valorNumerico 
      }
    });
  };

  const handleValorizacaoManualChange = (valor: string) => {
    const valorNumerico = parseFloat(valor) || 0;
    onChange({
      ...config,
      valorizacao: { 
        ...config.valorizacao, 
        valorManual: valorNumerico 
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Correção Monetária */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📈 Correção Monetária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="correcao-select">Índice de Correção</Label>
            <Select value={config.correcaoMonetaria.tipo} onValueChange={handleCorrecaoChange}>
              <SelectTrigger id="correcao-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcoes.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label} ({opcao.acumulado} a.a.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.correcaoMonetaria.tipo === 'MANUAL' && (
            <div>
              <Label htmlFor="correcao-manual">Taxa Mensal (%)</Label>
              <Input
                id="correcao-manual"
                type="number"
                step="0.01"
                placeholder="ex: 0.38"
                value={config.correcaoMonetaria.valorManual || ''}
                onChange={(e) => handleCorrecaoManualChange(e.target.value)}
              />
            </div>
          )}

          <div className="text-sm text-slate-600">
            {descricaoIndices[config.correcaoMonetaria.tipo]}
          </div>
        </CardContent>
      </Card>

      {/* Valorização */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🚀 Valorização do Imóvel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="valorizacao-select">Índice de Valorização</Label>
            <Select value={config.valorizacao.tipo} onValueChange={handleValorizacaoChange}>
              <SelectTrigger id="valorizacao-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {opcoes.map(opcao => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label} ({opcao.acumulado} a.a.)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {config.valorizacao.tipo === 'MANUAL' && (
            <div>
              <Label htmlFor="valorizacao-manual">Taxa Mensal (%)</Label>
              <Input
                id="valorizacao-manual"
                type="number"
                step="0.01"
                placeholder="ex: 1.35"
                value={config.valorizacao.valorManual || ''}
                onChange={(e) => handleValorizacaoManualChange(e.target.value)}
              />
            </div>
          )}

          <div className="text-sm text-slate-600">
            {descricaoIndices[config.valorizacao.tipo]}
          </div>
        </CardContent>
      </Card>

      {/* Preview das Taxas */}
      <PreviewTaxas config={config} />
    </div>
  );
};

export default ConfiguracaoIndicesComponent;
