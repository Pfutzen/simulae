
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Edit3, RotateCcw, RefreshCw } from "lucide-react";
import MonthYearPicker from "./MonthYearPicker";
import { formatDateForDisplay, addMonths } from "@/utils/dateUtils";
import { getReinforcementMonths, calculateStartDateFromValuation } from "@/utils/calculationUtils";

interface ReinforcementDatesControlProps {
  valuationDate?: Date;
  deliveryDate?: Date;
  installmentsCount: number;
  reinforcementFrequency: number;
  finalMonthsWithoutReinforcement: number;
  customDates?: Date[];
  onCustomDatesChange: (dates: Date[] | undefined) => void;
  onUpdateSimulation?: () => void;
  hasSchedule?: boolean;
}

const ReinforcementDatesControl: React.FC<ReinforcementDatesControlProps> = ({
  valuationDate,
  deliveryDate,
  installmentsCount,
  reinforcementFrequency,
  finalMonthsWithoutReinforcement,
  customDates,
  onCustomDatesChange,
  onUpdateSimulation,
  hasSchedule = false
}) => {
  // Calculate automatic reinforcement months
  const reinforcementMonths = getReinforcementMonths(
    installmentsCount,
    reinforcementFrequency,
    finalMonthsWithoutReinforcement
  );

  // Generate automatic dates based on valuation date
  const generateAutomaticDates = (): Date[] => {
    if (!valuationDate) return [];
    
    // Calculate start date from valuation date (first installment month after valuation)
    const startDate = calculateStartDateFromValuation(valuationDate);
    
    return reinforcementMonths.map(month => 
      addMonths(startDate, month - 1) // month-1 because month 1 is first installment
    );
  };

  const automaticDates = generateAutomaticDates();
  const isUsingCustomDates = customDates && customDates.length > 0;
  const displayDates = isUsingCustomDates ? customDates : automaticDates;

  const handleEnableCustomDates = () => {
    onCustomDatesChange([...automaticDates]);
  };

  const handleResetToAutomatic = () => {
    onCustomDatesChange(undefined);
  };

  const handleCustomDateChange = (index: number, date: Date | undefined) => {
    if (!customDates || !date) return;
    
    const newDates = [...customDates];
    newDates[index] = date;
    onCustomDatesChange(newDates);
  };

  const handleUpdateSimulation = () => {
    if (onUpdateSimulation) {
      onUpdateSimulation();
    }
  };

  if (reinforcementMonths.length === 0) {
    return (
      <Card className="border-slate-200">
        <CardContent className="pt-6">
          <p className="text-slate-500 text-center">
            Nenhum reforço será aplicado com a configuração atual
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Datas dos Reforços
          </CardTitle>
          
          <div className="flex gap-2">
            {!isUsingCustomDates ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableCustomDates}
                disabled={!valuationDate}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-4 w-4" />
                Personalizar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToAutomatic}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Automático
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!valuationDate && (
          <p className="text-amber-600 text-sm">
            Defina a data de avaliação para calcular as datas dos reforços
          </p>
        )}
        
        {valuationDate && (
          <div className="grid gap-3">
            {displayDates.map((date, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-slate-600">
                    Reforço {index + 1} (Mês {reinforcementMonths[index]})
                  </div>
                </div>
                
                {isUsingCustomDates ? (
                  <div className="w-52">
                    <MonthYearPicker
                      value={date}
                      onChange={(newDate) => handleCustomDateChange(index, newDate)}
                      placeholder="MM/AAAA"
                      disablePastDates={true}
                    />
                  </div>
                ) : (
                  <div className="text-sm font-medium text-blue-600">
                    {formatDateForDisplay(date)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {isUsingCustomDates && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              💡 Você pode editar as datas digitando diretamente (MM/AAAA) ou usando o calendário. O cálculo dos valores permanece baseado na frequência configurada.
            </div>
            
            {hasSchedule && onUpdateSimulation && (
              <div className="pt-2 border-t border-slate-200">
                <Button
                  onClick={handleUpdateSimulation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2"
                  size="sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar reforços na simulação
                </Button>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Clique para recalcular o cronograma com as novas datas
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReinforcementDatesControl;
