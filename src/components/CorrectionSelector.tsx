
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
import { CorrectionMode } from "@/utils/types";
import { CUB_CORRECTION_DATA } from "@/utils/correctionData";
import { HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CorrectionSelectorProps {
  value: CorrectionMode;
  onChange: (value: CorrectionMode) => void;
}

const CorrectionSelector: React.FC<CorrectionSelectorProps> = ({ value, onChange }) => {
  const handleValueChange = (newValue: string) => {
    onChange(newValue as CorrectionMode);
  };

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
          <TooltipContent className="max-w-[350px]">
            <div className="space-y-2">
              <p><strong>Manual:</strong> Use um índice fixo mensal para correção.</p>
              <p><strong>CUB:</strong> Use os índices reais do CUB nacional dos últimos 12 meses.</p>
              <div className="max-h-[300px] overflow-auto mt-2">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Período</TableHead>
                      <TableHead className="text-right">Variação (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {CUB_CORRECTION_DATA.map((item) => (
                      <TableRow key={item.month}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.percentage.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="cub">CUB</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default CorrectionSelector;
