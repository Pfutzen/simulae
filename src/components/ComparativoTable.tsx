
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EstrategiaResultado } from '@/types/investment.types';
import { formatCurrency } from '@/utils/formatters';

interface ComparativoTableProps {
  estrategias: EstrategiaResultado[];
}

const ComparativoTable: React.FC<ComparativoTableProps> = ({ estrategias }) => {
  if (estrategias.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p>Configure os parâmetros para ver o comparativo das estratégias</p>
        </CardContent>
      </Card>
    );
  }

  const melhorROIAnual = Math.max(...estrategias.map(e => e.roiAnual));
  const melhorROITotal = Math.max(...estrategias.map(e => e.roiTotal));
  const melhorLucro = Math.max(...estrategias.map(e => e.lucro));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparativo de Estratégias</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Estratégia</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Investimento</TableHead>
              <TableHead>Valor Venda</TableHead>
              <TableHead>Saldo Devedor</TableHead>
              <TableHead>Receita Extra</TableHead>
              <TableHead>Lucro</TableHead>
              <TableHead>ROI Total</TableHead>
              <TableHead>ROI Anual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {estrategias.map((estrategia) => (
              <TableRow key={estrategia.id}>
                <TableCell className="font-medium">
                  {estrategia.nome}
                </TableCell>
                <TableCell>{estrategia.periodo} meses</TableCell>
                <TableCell>{formatCurrency(estrategia.investimento)}</TableCell>
                <TableCell>{formatCurrency(estrategia.valorVenda)}</TableCell>
                <TableCell>
                  {estrategia.saldoDevedor > 0 ? formatCurrency(estrategia.saldoDevedor) : '-'}
                </TableCell>
                <TableCell>
                  {estrategia.receitaExtra ? formatCurrency(estrategia.receitaExtra) : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {formatCurrency(estrategia.lucro)}
                    {estrategia.lucro === melhorLucro && (
                      <Badge variant="secondary">Melhor</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {estrategia.roiTotal.toFixed(1)}%
                    {estrategia.roiTotal === melhorROITotal && (
                      <Badge variant="secondary">Melhor</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {estrategia.roiAnual.toFixed(1)}%
                    {estrategia.roiAnual === melhorROIAnual && (
                      <Badge variant="secondary">Melhor</Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ComparativoTable;
