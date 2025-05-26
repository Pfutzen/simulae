
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Info } from "lucide-react";
import { formatCurrency } from "@/utils/formatUtils";

interface FinancingSimulatorProps {
  keysValue: number;
}

const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({
  keysValue
}) => {
  const [showSimulation, setShowSimulation] = useState(false);
  
  const estimatedMonthlyPayment = keysValue * 0.01; // 1% do valor das chaves

  const handleSimulate = () => {
    setShowSimulation(true);
  };

  const handleClose = () => {
    setShowSimulation(false);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSimulate}
        variant="outline"
        className="w-full sm:w-auto flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
      >
        <CreditCard className="h-4 w-4" />
        Simular financiamento bancário do saldo das chaves
      </Button>

      {showSimulation && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Simulação de Financiamento Bancário
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="ml-auto h-6 w-6 p-0 text-blue-600 hover:bg-blue-100"
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-slate-600 mb-1">Valor do saldo a financiar</p>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(keysValue)}
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm text-slate-600 mb-1">Parcela média estimada</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estimatedMonthlyPayment)}
                </p>
                <p className="text-xs text-slate-500 mt-1">por mês</p>
              </div>
            </div>

            <Alert className="border-amber-200 bg-amber-50">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Simulação meramente ilustrativa</strong> com base em taxa média de mercado de 1% ao mês. 
                Consulte seu banco para valores exatos e condições reais de financiamento.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancingSimulator;
