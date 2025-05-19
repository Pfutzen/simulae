
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SavedSimulation } from "@/utils/simulationTypes";
import { formatCurrency } from "@/utils/formatUtils";
import { Trash2, Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimulationHistoryProps {
  simulations: SavedSimulation[];
  onView: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const SimulationHistory: React.FC<SimulationHistoryProps> = ({ 
  simulations, 
  onView, 
  onDuplicate, 
  onDelete 
}) => {
  const { toast } = useToast();
  
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a simulação "${name}"?`)) {
      onDelete(id);
      toast({
        title: "Simulação excluída",
        description: `A simulação "${name}" foi removida do histórico.`
      });
    }
  };

  const handleDuplicate = (id: string) => {
    onDuplicate(id);
    toast({
      title: "Simulação duplicada",
      description: "Uma cópia da simulação foi criada no histórico."
    });
  };

  if (simulations.length === 0) {
    return (
      <Card className="shadow mt-8">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Nenhuma simulação salva.</p>
            <p className="mt-2">Preencha o formulário, nomeie sua simulação e clique em "Simular" para salvar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow mt-8">
      <CardContent className="pt-6">
        <h3 className="text-xl font-bold mb-4">Histórico de Simulações</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Simulação</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor do Imóvel</TableHead>
                <TableHead>Lucro Estimado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulations.map((simulation) => (
                <TableRow key={simulation.id}>
                  <TableCell className="font-medium">{simulation.name}</TableCell>
                  <TableCell>
                    {simulation.date.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </TableCell>
                  <TableCell>{formatCurrency(simulation.propertyValue)}</TableCell>
                  <TableCell>
                    {simulation.results?.profit ? (
                      <span className="text-green-600">
                        {formatCurrency(simulation.results.profit)}
                      </span>
                    ) : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onView(simulation.id)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDuplicate(simulation.id)}
                        title="Duplicar simulação"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(simulation.id, simulation.name)}
                        className="text-red-500 hover:text-red-700 hover:border-red-200"
                        title="Excluir simulação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulationHistory;
