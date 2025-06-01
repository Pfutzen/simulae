
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoIndices } from '@/types/indices';
import { obterTaxaMensal } from '@/utils/calculosIndices';
import { nomesMeses } from '@/data/indicesEconomicos';

interface PreviewTaxasProps {
  config: ConfiguracaoIndices;
}

const PreviewTaxas: React.FC<PreviewTaxasProps> = ({ config }) => {
  const proximosMeses = Array.from({ length: 6 }, (_, i) => ({
    mes: nomesMeses[(config.mesInicial + i) % 12],
    correcao: obterTaxaMensal(
      config.correcaoMonetaria.tipo, 
      i, 
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    ),
    valorizacao: obterTaxaMensal(
      config.valorizacao.tipo, 
      i, 
      config.mesInicial,
      config.valorizacao.valorManual
    )
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          📅 Preview - Próximos 6 Meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="font-semibold text-slate-700">Mês</div>
          <div className="font-semibold text-slate-700">Correção</div>
          <div className="font-semibold text-slate-700">Valorização</div>
          
          {proximosMeses.map((item, index) => (
            <React.Fragment key={index}>
              <div className="py-1">{item.mes}</div>
              <div className="py-1 text-blue-600 font-medium">
                {(item.correcao * 100).toFixed(2)}%
              </div>
              <div className="py-1 text-green-600 font-medium">
                {(item.valorizacao * 100).toFixed(2)}%
              </div>
            </React.Fragment>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600">
            ℹ️ As taxas seguem o ciclo histórico dos últimos 12 meses e se repetem mensalmente.
            O mês inicial define onde começar no ciclo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewTaxas;
