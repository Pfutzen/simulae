import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, RefreshCw, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePDF } from "@/utils/pdfExport";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formatCurrency, formatPercentage } from "@/utils/formatUtils";
import { calculateSchedule } from "@/utils/calculationUtils";
import { SimulationResults } from ".";
import { PropostaButton } from ".";
import {
  saveSimulation,
  getSimulation,
  SavedSimulation,
} from "@/utils/simulationHistoryUtils";
import { useSearchParams } from "react-router-dom";

const formSchema = z.object({
  propertyValue: z.number().min(1, { message: "O valor deve ser maior que zero." }),
  downPaymentPercentage: z.number().min(0, { message: "A entrada deve ser maior ou igual a zero." }).max(100, { message: "A entrada deve ser menor ou igual a 100." }),
  installmentsCount: z.number().min(1, { message: "O número de parcelas deve ser maior que zero." }),
  installmentsValue: z.number().min(1, { message: "O valor da parcela deve ser maior que zero." }),
  reinforcementFrequency: z.number().min(0, { message: "A frequência deve ser maior ou igual a zero." }),
  reinforcementsValue: z.number().min(0, { message: "O valor do reforço deve ser maior ou igual a zero." }),
  keysPercentage: z.number().min(0, { message: "O valor deve ser maior ou igual a zero." }).max(100, { message: "O valor deve ser menor ou igual a 100." }),
  keysValue: z.number().min(0, { message: "O valor deve ser maior ou igual a zero." }),
  correctionIndex: z.number().min(0, { message: "O índice deve ser maior ou igual a zero." }),
  appreciationIndex: z.number().min(0, { message: "O índice deve ser maior ou igual a zero." }),
  resaleMonth: z.number().min(0, { message: "O mês deve ser maior ou igual a zero." }),
  startDate: z.date(),
  rentalPercentage: z.number().min(0, { message: "O percentual deve ser maior ou igual a zero." }).max(100, { message: "O percentual deve ser menor ou igual a 100." }),
  calculateRental: z.boolean().default(false).optional(),
});

const SimulatorForm: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [bestResaleInfo, setBestResaleInfo] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [searchParams] = useSearchParams();
  const [currentSimulation, setCurrentSimulation] = useState<SavedSimulation | null>(null);
  const { toast } = useToast();

  // Load simulation from URL
  useEffect(() => {
    const simulationId = searchParams.get('simulationId');
    if (simulationId) {
      const loadedSimulation = getSimulation(simulationId);
      if (loadedSimulation) {
        setCurrentSimulation(loadedSimulation);
        form.reset(loadedSimulation.formData);
        toast({
          title: "Simulação carregada",
          description: `Simulação "${loadedSimulation.name}" carregada com sucesso.`,
        });
      } else {
        toast({
          title: "Simulação não encontrada",
          description: "Não foi possível encontrar a simulação com o ID especificado.",
          variant: "destructive",
        });
      }
    }
  }, [searchParams, toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyValue: 350000,
      downPaymentPercentage: 20,
      installmentsCount: 36,
      installmentsValue: 1500,
      reinforcementFrequency: 12,
      reinforcementsValue: 10000,
      keysPercentage: 10,
      keysValue: 35000,
      correctionIndex: 0.8,
      appreciationIndex: 0.5,
      resaleMonth: 60,
      startDate: new Date(),
      rentalPercentage: 0.5,
      calculateRental: false,
    },
    mode: "onChange"
  });

  const { watch } = form;
  const { propertyValue, downPaymentPercentage } = watch();

  // Calculate down payment value based on property value and percentage
  const downPaymentValue = propertyValue && downPaymentPercentage ? (propertyValue * (downPaymentPercentage / 100)) : 0;

  // Update form values when downPaymentValue changes
  useEffect(() => {
    form.setValue("downPaymentValue", downPaymentValue);
  }, [downPaymentValue, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsCalculating(true);
    setResults(null);
    setSchedule([]);
    setBestResaleInfo(null);

    try {
      const { schedule: calculatedSchedule, resaleResults, bestResaleInfo: calculatedBestResaleInfo } = calculateSchedule(values);
      setSchedule(calculatedSchedule);
      setResults(resaleResults);
      setBestResaleInfo(calculatedBestResaleInfo);

      // Save simulation data
      const simulationData = {
        name: "Simulação",
        timestamp: Date.now(),
        formData: values,
        schedule: calculatedSchedule,
        results: resaleResults,
        bestResaleInfo: calculatedBestResaleInfo,
        appreciationIndex: values.appreciationIndex
      };

      const savedSimulation = saveSimulation(simulationData);
      setCurrentSimulation(savedSimulation);

      toast({
        title: "Simulação completa",
        description: "Os resultados da simulação foram calculados com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao calcular simulação:", error);
      toast({
        title: "Erro ao calcular simulação",
        description: "Ocorreu um erro ao calcular a simulação. Verifique os valores informados.",
        variant: "destructive",
      });
    } finally {
      setIsCalculating(false);
    }
  }

  return (
    <div className="container max-w-5xl mx-auto py-10">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Simulador de Investimento Imobiliário</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="propertyValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Imóvel</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="R$ 350.000,00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="downPaymentPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entrada (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="20%" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="installmentsCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="36" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="installmentsValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor da Parcela</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="R$ 1.500,00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="reinforcementFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de Reforços (meses)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="12" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reinforcementsValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor do Reforço</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="R$ 10.000,00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="keysPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chaves (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10%" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keysValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor das Chaves</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="R$ 35.000,00" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="correctionIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correção ao Mês (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.8%" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appreciationIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valorização ao Mês (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.5%" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="resaleMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mês para Revenda</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="60" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rentalPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Percentual para Aluguel (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0.5%" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data Inicial</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          locale={ptBR}
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Calculando...
                  </>
                ) : (
                  "Calcular Simulação"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {results && (
        <div className="mt-8 space-y-6">
          {/* Botões de ação organizados */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PropostaButton
              simulation={currentSimulation}
              schedule={schedule}
              resaleResults={results}
              bestResaleInfo={bestResaleInfo}
              formData={form.getValues()}
              appreciationIndex={form.getValues().appreciationIndex}
            />
            
            <Button
              onClick={() => {
                if (currentSimulation) {
                  console.log('Exportando PDF para simulação:', currentSimulation.id);
                  generatePDF(currentSimulation);
                } else {
                  toast({
                    title: "Simulação necessária",
                    description: "Execute uma simulação antes de exportar o PDF.",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg w-full sm:w-auto gap-2"
              disabled={!currentSimulation}
            >
              <Download className="h-5 w-5" />
              Exportar PDF
            </Button>
          </div>

          <SimulationResults
            schedule={schedule}
            investmentValue={results.investmentValue}
            propertyValue={results.propertyValue}
            profit={results.profit}
            profitPercentage={results.profitPercentage}
            remainingBalance={results.remainingBalance}
            resaleMonth={form.getValues().resaleMonth}
            bestResaleInfo={bestResaleInfo}
            simulationData={currentSimulation}
            rentalPercentage={form.getValues().rentalPercentage || 0}
            rentalEstimate={results.rentalEstimate || 0}
            annualRentalReturn={results.annualRentalReturn || 0}
            appreciationIndex={form.getValues().appreciationIndex}
          />
        </div>
      )}
    </div>
  );
};

export default SimulatorForm;
