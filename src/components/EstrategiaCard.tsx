
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EstrategiaResultado } from '@/types/investment.types';
import { formatCurrency } from '@/utils/formatters';

interface EstrategiaCardProps {
  estrategia: EstrategiaResultado;
  isMelhor?: boolean;
}

const EstrategiaCard: React.FC<EstrategiaCardProps> = ({ estrategia, isMelhor = false }) => {
  const getROIColor = (roi: number) => {
    if (roi >= 20) return 'text-green-600';
    if (roi >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={`relative ${isMelhor ? 'border-green-400 shadow-lg' : ''}`}>
      {isMelhor && (
        <Badge className="absolute -top-2 -right-2 bg-green-600">
          Melhor Opção
        </Badge>
      )}
      
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {estrategia.nome}
          <span className="text-sm font-normal">
            {estrategia.periodo} meses
          </span>
        </CardTitle>
        <CardDescription>
          {estrategia.descricao}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Investimento</div>
            <div className="font-semibold">{formatCurrency(estrategia.investimento)}</div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">Valor de Venda</div>
            <div className="font-semibold">{formatCurrency(estrategia.valorVenda)}</div>
          </div>
        </div>

        {estrategia.saldoDevedor > 0 && (
          <div>
            <div className="text-sm text-muted-foreground">Saldo Devedor</div>
            <div className="font-semibold text-red-600">
              {formatCurrency(estrategia.saldoDevedor)}
            </div>
          </div>
        )}

        {estrategia.receitaExtra && (
          <div>
            <div className="text-sm text-muted-foreground">Receita de Aluguel</div>
            <div className="font-semibold text-green-600">
              {formatCurrency(estrategia.receitaExtra)}
            </div>
          </div>
        )}

        <div className="border-t pt-3">
          <div>
            <div className="text-sm text-muted-foreground">Lucro</div>
            <div className={`font-bold text-lg ${estrategia.lucro >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(estrategia.lucro)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <div className="text-sm text-muted-foreground">ROI Total</div>
            <div className={`font-semibold ${getROIColor(estrategia.roiTotal)}`}>
              {estrategia.roiTotal.toFixed(1)}%
            </div>
          </div>
          
          <div>
            <div className="text-sm text-muted-foreground">ROI Anual</div>
            <div className={`font-semibold ${getROIColor(estrategia.roiAnual)}`}>
              {estrategia.roiAnual.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstrategiaCard;
