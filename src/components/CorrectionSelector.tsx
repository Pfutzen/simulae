
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TipoIndice } from "@/types/indices";
import { indicesHistoricos, descricaoIndices, acumuladoAnual } from "@/data/indicesEconomicos";
import { HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CorrectionSelectorProps {
  value: TipoIndice;
  onChange: (value: TipoIndice) => void;
}

const CorrectionSelector: React.FC<CorrectionSelectorProps> = ({ value, onChange }) => {
  const handleValueChange = (newValue: string) => {
    onChange(newValue as TipoIndice);
  };

  const opcoes = [
    { value: 'CUB_NACIONAL', label: 'CUB Nacional', acumulado: acumuladoAnual.CUB_NACIONAL },
    { value: 'IPCA', label: 'IPCA', acumulado: acumuladoAnual.IPCA },
    { value: 'IGP_M', label: 'IGP-M', acumulado: acumuladoAnual.IGP_M },
    { value: 'INCC_NACIONAL', label: 'INCC Nacional', acumulado: acumuladoAnual.INCC_NACIONAL },
    { value: 'MANUAL', label: 'Manual', acumulado: null }
  ] as const;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor="correction-mode" className="text-base font-medium">
          Modo de Correção
        </Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[400px]">
            <div className="space-y-2">
              <p><strong>Manual:</strong> Use um índice fixo mensal para correção.</p>
              <p><strong>Índices Econômicos:</strong> Use dados históricos reais dos últimos 12 meses que se repetem ciclicamente.</p>
              <div className="max-h-[300px] overflow-auto mt-2">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-2/3">Índice</TableHead>
                      <TableHead className="text-right">Anual (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {opcoes.filter(opcao => opcao.acumulado !== null).map((opcao) => (
                      <TableRow key={opcao.value}>
                        <TableCell>{opcao.label}</TableCell>
                        <TableCell className="text-right">{opcao.acumulado.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                📊 Os índices seguem o ciclo histórico de Mai/24 a Abr/25 e se repetem mensalmente.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id="correction-mode" className="w-full">
          <SelectValue placeholder="Selecione o modo de correção" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {opcoes.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label} {opcao.acumulado !== null && `(${opcao.acumulado.toFixed(2)}% a.a.)`}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CorrectionSelector;
