
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfiguracaoIndices } from '@/types/indices';
import { obterTaxaMensalSupabase } from '@/utils/calculosIndicesSupabase';
import { useIndicesSupabase } from '@/hooks/useIndicesSupabase';

interface PreviewTaxasProps {
  config: ConfiguracaoIndices;
}

const PreviewTaxas: React.FC<PreviewTaxasProps> = ({ config }) => {
  const { indices, loading } = useIndicesSupabase();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📅 Preview - Próximos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando índices...</div>
        </CardContent>
      </Card>
    );
  }

  const proximosMeses = Array.from({ length: 6 }, (_, i) => {
    const correcao = obterTaxaMensalSupabase(
      config.correcaoMonetaria.tipo, 
      i, 
      config.mesInicial,
      config.correcaoMonetaria.valorManual
    );
    
    const valorizacao = obterTaxaMensalSupabase(
      config.valorizacao.tipo, 
      i, 
      config.mesInicial,
      config.valorizacao.valorManual
    );

    // Determinar o nome do mês baseado nos dados do Supabase
    const mesIndex = (config.mesInicial + i) % 12;
    let mesNome = `Mês ${i + 1}`;
    
    if (indices.length > 0) {
      const mesData = indices[mesIndex % indices.length];
      mesNome = mesData?.mes_ano || `Mês ${i + 1}`;
    }

    return {
      mes: mesNome,
      correcao,
      valorizacao
    };
  });

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
            ℹ️ As taxas seguem o ciclo histórico dos dados do Supabase e se repetem mensalmente.
            O mês inicial define onde começar no ciclo.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreviewTaxas;
