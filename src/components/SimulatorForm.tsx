import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SimulationFormData, PaymentType } from "@/utils/types";
import { simulationFormSchema } from "@/utils/validationSchemas";
import { useSimulationFlow } from "@/hooks/useSimulationFlow";
import { generatePaymentScheduleComIndicesSupabase } from "@/utils/paymentScheduleSupabase";
import { calculateResaleProfit, calculateBestResaleMonth } from "@/utils/resaleAnalysis";
import { calculateRentalEstimate } from "@/utils/calculationUtils";
import { ConfiguracaoIndices, TipoIndice } from "@/types/indices";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import ResultsChart from "@/components/ResultsChart";
import PaymentScheduleTable from "@/components/PaymentScheduleTable";
import ResaleStrategiesTable from "@/components/ResaleStrategiesTable";
import { useToast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

export default function SimulatorForm() {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [schedule, setSchedule] = useState<PaymentType[]>([]);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("form");
  const [customResaleEnabled, setCustomResaleEnabled] = useState(false);
  const [customReinforcementEnabled, setCustomReinforcementEnabled] = useState(false);
  const [customReinforcementDates, setCustomReinforcementDates] = useState<Date[]>([]);
  const [tempReinforcementDate, setTempReinforcementDate] = useState<Date | undefined>(undefined);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const form = useForm<SimulationFormData>({
    resolver: zodResolver(simulationFormSchema),
    defaultValues: {
      propertyValue: 500000,
      downPaymentValue: 50000,
      installmentsCount: 36,
      installmentsValue: 3000,
      keysValue: 150000,
      reinforcementsValue: 10000,
      reinforcementFrequency: 6,
      finalMonthsWithoutReinforcement: 6,
      appreciationIndex: 0.8,
      correctionIndex: 0.5,
      rentalPercentage: 0.5,
      resaleMonth: 36,
      valuationDate: new Date(),
      startDate: new Date(),
      deliveryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)),
      correctionMode: "IPCA" as TipoIndice,
      appreciationMode: "IPCA" as TipoIndice,
    },
  });

  const { watch, control, handleSubmit, setValue, getValues, formState: { errors } } = form;

  const watchedInstallmentsCount = watch("installmentsCount");
  const watchedCorrectionMode = watch("correctionMode");
  const watchedAppreciationMode = watch("appreciationMode");

  // Reset resale month when installments count changes
  useEffect(() => {
    if (!customResaleEnabled) {
      setValue("resaleMonth", watchedInstallmentsCount);
    }
  }, [watchedInstallmentsCount, customResaleEnabled, setValue]);

  const onSubmit = (data: SimulationFormData) => {
    // Add custom reinforcement dates if enabled
    if (customReinforcementEnabled && customReinforcementDates.length > 0) {
      data.customReinforcementDates = [...customReinforcementDates].sort((a, b) => a.getTime() - b.getTime());
    } else {
      data.customReinforcementDates = [];
    }
    
    runSimulation();
  };

  const addReinforcementDate = () => {
    if (tempReinforcementDate) {
      setCustomReinforcementDates(prev => [...prev, tempReinforcementDate]);
      setTempReinforcementDate(undefined);
    }
  };

  const removeReinforcementDate = (index: number) => {
    setCustomReinforcementDates(prev => prev.filter((_, i) => i !== index));
  };

  const runSimulation = async () => {
    setIsCalculating(true);
    setResults(null);

    try {
      const formData = getValues();
      
      // Configurar índices
      const configAtualizada: ConfiguracaoIndices = {
        correcaoMonetaria: {
          tipo: formData.correctionMode,
          valorManual: formData.correctionIndex / 100
        },
        valorizacao: {
          tipo: formData.appreciationMode,
          valorManual: formData.appreciationIndex / 100
        },
        mesInicial: 0
      };
      
      const paymentSchedule = await generatePaymentScheduleComIndicesSupabase(formData, configAtualizada);
      setSchedule(paymentSchedule);
      
      // Corrigir a lógica do mês de revenda
      let effectiveResaleMonth: number;
      
      if (customResaleEnabled) {
        // Se o usuário habilitou a opção customizada
        if (formData.resaleMonth >= formData.installmentsCount) {
          // Se o mês digitado é o último ou maior, usar o mês das chaves
          effectiveResaleMonth = formData.installmentsCount + 1;
        } else {
          // Caso contrário, usar o mês especificado pelo usuário
          effectiveResaleMonth = formData.resaleMonth;
        }
      } else {
        // Se não, usar o mês das chaves (último item do cronograma)
        // O cronograma inclui: entrada (mês 0) + parcelas + chaves
        // O mês das chaves é sempre installmentsCount + 1
        effectiveResaleMonth = formData.installmentsCount + 1;
      }
      
      console.log('Mês efetivo para revenda:', effectiveResaleMonth);
      console.log('Custom resale habilitado:', customResaleEnabled);
      console.log('Mês das chaves (calculado):', formData.installmentsCount + 1);
      console.log('Mês digitado pelo usuário:', formData.resaleMonth);
        
      const results = calculateResaleProfit(paymentSchedule, effectiveResaleMonth);
      
      // Calculate rental estimates
      const rentalData = calculateRentalEstimate(
        results.propertyValue, 
        formData.rentalPercentage
      );
      
      const resaleResults = {
        ...results,
        rentalEstimate: rentalData.rentalEstimate,
        annualRentalReturn: rentalData.annualRentalReturn
      };
      
      // Calculate best resale info
      const bestResaleInfo = calculateBestResaleMonth(paymentSchedule);
      
      setResults({
        schedule: paymentSchedule,
        resaleResults,
        bestResaleInfo
      });
      
      setActiveTab("results");
      
      toast({
        title: "Simulação concluída",
        description: "Os resultados da simulação estão disponíveis.",
      });
    } catch (error) {
      console.error("Erro na simulação:", error);
      toast({
        variant: "destructive",
        title: "Erro na simulação",
        description: "Ocorreu um erro ao processar a simulação. Verifique os dados e tente novamente.",
      });
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="form">Formulário</TabsTrigger>
          <TabsTrigger value="results" disabled={!results}>Resultados</TabsTrigger>
          <TabsTrigger value="schedule" disabled={!results}>Cronograma</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valores do Imóvel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Valores do Imóvel</CardTitle>
                  <CardDescription>Informe os valores principais do imóvel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyValue">
                      Valor do Imóvel
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Valor total do imóvel na data de avaliação</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="propertyValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="propertyValue"
                          type="number"
                          placeholder="500000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.propertyValue && (
                      <p className="text-sm text-red-500">{errors.propertyValue.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPaymentValue">
                      Valor da Entrada
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Valor pago como entrada</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="downPaymentValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="downPaymentValue"
                          type="number"
                          placeholder="50000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.downPaymentValue && (
                      <p className="text-sm text-red-500">{errors.downPaymentValue.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keysValue">
                      Valor das Chaves
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Valor a ser pago na entrega das chaves</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="keysValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="keysValue"
                          type="number"
                          placeholder="150000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.keysValue && (
                      <p className="text-sm text-red-500">{errors.keysValue.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Parcelas e Reforços */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parcelas e Reforços</CardTitle>
                  <CardDescription>Configure as parcelas mensais e reforços</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="installmentsCount">
                      Quantidade de Parcelas
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Número total de parcelas mensais</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="installmentsCount"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="installmentsCount"
                          type="number"
                          placeholder="36"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.installmentsCount && (
                      <p className="text-sm text-red-500">{errors.installmentsCount.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="installmentsValue">
                      Valor da Parcela
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Valor inicial da parcela mensal</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="installmentsValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="installmentsValue"
                          type="number"
                          placeholder="3000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.installmentsValue && (
                      <p className="text-sm text-red-500">{errors.installmentsValue.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reinforcementsValue">
                        Valor do Reforço
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Valor inicial do reforço periódico</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                    </div>
                    <Controller
                      name="reinforcementsValue"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="reinforcementsValue"
                          type="number"
                          placeholder="10000"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.reinforcementsValue && (
                      <p className="text-sm text-red-500">{errors.reinforcementsValue.message}</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="customReinforcementEnabled"
                      checked={customReinforcementEnabled}
                      onCheckedChange={setCustomReinforcementEnabled}
                    />
                    <Label htmlFor="customReinforcementEnabled">Datas de reforço personalizadas</Label>
                  </div>

                  {!customReinforcementEnabled ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reinforcementFrequency">
                          Frequência (meses)
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">A cada quantos meses ocorre um reforço</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Controller
                          name="reinforcementFrequency"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="reinforcementFrequency"
                              type="number"
                              placeholder="6"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="finalMonthsWithoutReinforcement">
                          Meses finais sem reforço
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">Quantos meses finais não terão reforço</p>
                            </TooltipContent>
                          </Tooltip>
                        </Label>
                        <Controller
                          name="finalMonthsWithoutReinforcement"
                          control={control}
                          render={({ field }) => (
                            <Input
                              id="finalMonthsWithoutReinforcement"
                              type="number"
                              placeholder="6"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !tempReinforcementDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {tempReinforcementDate ? format(tempReinforcementDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={tempReinforcementDate}
                              onSelect={setTempReinforcementDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <Button type="button" onClick={addReinforcementDate} disabled={!tempReinforcementDate}>
                          Adicionar
                        </Button>
                      </div>

                      {customReinforcementDates.length > 0 ? (
                        <div className="border rounded-md p-3">
                          <p className="text-sm font-medium mb-2">Datas de reforço:</p>
                          <ul className="space-y-1">
                            {customReinforcementDates.map((date, index) => (
                              <li key={index} className="flex justify-between items-center text-sm">
                                <span>{format(date, "dd/MM/yyyy")}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeReinforcementDate(index)}
                                >
                                  Remover
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Nenhuma data de reforço adicionada.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Datas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Datas</CardTitle>
                  <CardDescription>Configure as datas importantes do projeto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valuationDate">
                      Data de Avaliação
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Data em que o imóvel foi avaliado</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="valuationDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="valuationDate"
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors.valuationDate && (
                      <p className="text-sm text-red-500">{errors.valuationDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">
                      Data de Início
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Data de início dos pagamentos mensais</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="startDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="startDate"
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">
                      Data de Entrega
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Data prevista para entrega das chaves</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="deliveryDate"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          id="deliveryDate"
                          date={field.value}
                          onSelect={field.onChange}
                        />
                      )}
                    />
                    {errors.deliveryDate && (
                      <p className="text-sm text-red-500">{errors.deliveryDate.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Índices e Taxas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Índices e Taxas</CardTitle>
                  <CardDescription>Configure os índices de correção e valorização</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="correctionMode">
                      Índice de Correção
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Índice usado para corrigir as parcelas</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="correctionMode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as TipoIndice)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um índice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IPCA">IPCA</SelectItem>
                            <SelectItem value="INCC">INCC</SelectItem>
                            <SelectItem value="IGP-M">IGP-M</SelectItem>
                            <SelectItem value="MANUAL">Taxa Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {watchedCorrectionMode === "MANUAL" && (
                    <div className="space-y-2">
                      <Label htmlFor="correctionIndex">
                        Taxa de Correção (% ao mês)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Taxa mensal para correção das parcelas</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Controller
                        name="correctionIndex"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="correctionIndex"
                            type="number"
                            step="0.01"
                            placeholder="0.5"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                      {errors.correctionIndex && (
                        <p className="text-sm text-red-500">{errors.correctionIndex.message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="appreciationMode">
                      Índice de Valorização
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Índice usado para valorizar o imóvel</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="appreciationMode"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value as TipoIndice)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um índice" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="IPCA">IPCA</SelectItem>
                            <SelectItem value="INCC">INCC</SelectItem>
                            <SelectItem value="IGP-M">IGP-M</SelectItem>
                            <SelectItem value="MANUAL">Taxa Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {watchedAppreciationMode === "MANUAL" && (
                    <div className="space-y-2">
                      <Label htmlFor="appreciationIndex">
                        Taxa de Valorização (% ao mês)
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Taxa mensal para valorização do imóvel</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Controller
                        name="appreciationIndex"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="appreciationIndex"
                            type="number"
                            step="0.01"
                            placeholder="0.8"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                      {errors.appreciationIndex && (
                        <p className="text-sm text-red-500">{errors.appreciationIndex.message}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="rentalPercentage">
                      Percentual de Aluguel (% ao ano)
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Percentual anual do valor do imóvel como aluguel</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Controller
                      name="rentalPercentage"
                      control={control}
                      render={({ field }) => (
                        <Input
                          id="rentalPercentage"
                          type="number"
                          step="0.01"
                          placeholder="0.5"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      )}
                    />
                    {errors.rentalPercentage && (
                      <p className="text-sm text-red-500">{errors.rentalPercentage.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Revenda */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Revenda</CardTitle>
                  <CardDescription>Configure opções de revenda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="customResaleEnabled"
                      checked={customResaleEnabled}
                      onCheckedChange={setCustomResaleEnabled}
                    />
                    <Label htmlFor="customResaleEnabled">Revenda antes da entrega</Label>
                  </div>

                  {customResaleEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="resaleMonth">
                        Mês de Revenda
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <InfoCircledIcon className="h-4 w-4 inline-block ml-1 text-slate-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Em qual mês você pretende revender o imóvel</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Controller
                        name="resaleMonth"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="resaleMonth"
                            type="number"
                            placeholder="24"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        )}
                      />
                      {errors.resaleMonth && (
                        <p className="text-sm text-red-500">{errors.resaleMonth.message}</p>
                      )}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                      className="w-full"
                    >
                      {showAdvancedOptions ? "Ocultar opções avançadas" : "Mostrar opções avançadas"}
                    </Button>
                  </div>

                  {showAdvancedOptions && (
                    <div className="space-y-4 pt-2">
                      <Alert>
                        <InfoCircledIcon className="h-4 w-4" />
                        <AlertTitle>Opções avançadas</AlertTitle>
                        <AlertDescription>
                          Estas configurações são para usuários experientes e podem afetar significativamente os resultados da simulação.
                        </AlertDescription>
                      </Alert>
                      
                      {/* Opções avançadas aqui */}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isCalculating}
                  >
                    {isCalculating ? "Calculando..." : "Simular Investimento"}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="results" className="space-y-6 py-4">
          {results ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultados da Simulação</CardTitle>
                    <CardDescription>
                      {customResaleEnabled 
                        ? `Revenda no mês ${results.resaleResults.month || "final"}`
                        : "Revenda na entrega das chaves"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Valor investido</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(results.resaleResults.investmentValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Valor do imóvel</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(results.resaleResults.propertyValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Saldo devedor</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(results.resaleResults.remainingBalance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Lucro</p>
                        <p className={`text-lg font-semibold ${results.resaleResults.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(results.resaleResults.profit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Rentabilidade</p>
                        <p className={`text-lg font-semibold ${results.resaleResults.profitPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(results.resaleResults.profitPercentage)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Valorização total</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage((results.resaleResults.propertyValue / watch("propertyValue") - 1) * 100)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estimativa de Aluguel</CardTitle>
                    <CardDescription>
                      Baseado em {formatPercentage(watch("rentalPercentage"))} ao ano do valor do imóvel
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500">Aluguel mensal estimado</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(results.resaleResults.rentalEstimate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Retorno anual</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(results.resaleResults.annualRentalReturn)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Aluguel anual</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(results.resaleResults.rentalEstimate * 12)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Retorno sobre investimento</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage((results.resaleResults.rentalEstimate * 12) / results.resaleResults.investmentValue * 100)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estratégias de Revenda</CardTitle>
                  <CardDescription>
                    Análise das melhores opções de revenda
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResaleStrategiesTable bestResaleInfo={results.bestResaleInfo} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução do Investimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultsChart 
                    schedule={results.schedule} 
                    resaleMonth={customResaleEnabled ? watch("resaleMonth") : watch("installmentsCount") + 1}
                  />
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-[150px] w-full" />
                <Skeleton className="h-[150px] w-full" />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6 py-4">
          {results ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cronograma de Pagamentos</CardTitle>
                <CardDescription>
                  Detalhamento mês a mês dos pagamentos e valores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <PaymentScheduleTable schedule={results.schedule} />
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Skeleton className="h-[500px] w-full" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
