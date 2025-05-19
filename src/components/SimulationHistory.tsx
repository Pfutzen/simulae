
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatToBrazilianNumber } from "@/utils/formatUtils";
import { deleteSimulation, SavedSimulation } from "@/utils/simulationHistoryUtils";
import { Copy, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SimulationHistoryProps {
  simulations: SavedSimulation[];
  onViewSimulation: (simulation: SavedSimulation) => void;
  onDuplicateSimulation: (simulation: SavedSimulation) => void;
  onDeleteSimulation: (id: string) => void;
}

const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  simulations,
  onViewSimulation,
  onDuplicateSimulation,
  onDeleteSimulation,
}) => {
  const { toast } = useToast();

  if (simulations.length === 0) {
    return (
      <Card className="mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-slate-500">
            Nenhuma simulação salva ainda.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = (id: string) => {
    deleteSimulation(id);
    onDeleteSimulation(id);
    toast({
      title: "Simulação excluída",
      description: "A simulação foi removida do histórico",
    });
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Histórico de Simulações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {simulations.map((simulation) => (
          <div
            key={simulation.id}
            className="p-4 border border-slate-200 rounded-md hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="flex-1">
                <h3 className="font-medium">{simulation.name}</h3>
                <div className="text-sm text-slate-500">
                  {format(
                    new Date(simulation.timestamp),
                    "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                    { locale: ptBR }
                  )}
                </div>
                <div className="mt-1 text-sm space-x-4">
                  <span>
                    Valor: R$ {formatToBrazilianNumber(simulation.formData.propertyValue)}
                  </span>
                  <span>
                    Lucro: R$ {formatToBrazilianNumber(simulation.results.profit)}
                  </span>
                  <span>
                    Retorno: {simulation.results.profitPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewSimulation(simulation)}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicateSimulation(simulation)}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Duplicar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(simulation.id)}
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SimulationHistory;
