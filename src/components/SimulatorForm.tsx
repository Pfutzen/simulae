import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ToastAction } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import PercentageSlider from "@/components/PercentageSlider";
import { formatToBrazilianNumber } from "@/utils/formatUtils";
import { TrendingUp, Home, KeyRound, Coins, PiggyBank, Percent, Users, Building2, Ruler, Calendar as CalendarIconLucide } from "lucide-react";

const formSchema = z.object({
  valorDoImovel: z.number(),
  valorDaEntrada: z.number(),
  taxaDeJurosAnual: z.number(),
  prazoEmAnos: z.number(),
  dataDoContrato: z.date(),
  taxaDeAdministracaoMensal: z.number(),
  valorização: z.number(),
  percentualParaAluguel: z.number(),
});

interface SimulationData {
  valorDoImovel: number;
  valorDaEntrada: number;
  taxaDeJurosAnual: number;
  prazoEmAnos: number;
  dataDoContrato: Date;
  taxaDeAdministracaoMensal: number;
  valorização: number;
  percentualParaAluguel: number;
}

export default function SimulatorForm() {
  const [simulationData, setSimulationData] = useState<SimulationData>({
    valorDoImovel: 350000,
    valorDaEntrada: 100000,
    taxaDeJurosAnual: 8.5,
    prazoEmAnos: 30,
    dataDoContrato: new Date(),
    taxaDeAdministracaoMensal: 0.25,
    valorização: 0.35,
    percentualParaAluguel: 0.5,
  });
  const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
  const [totalPayment, setTotalPayment] = useState<number>(0);
  const [totalInterestPaid, setTotalInterestPaid] = useState<number>(0);
  const [showResults, setShowResults] = useState<boolean>(false);
  const { toast } = useToast()

  useEffect(() => {
    calculateAmortization();
  }, [simulationData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      valorDoImovel: simulationData.valorDoImovel,
      valorDaEntrada: simulationData.valorDaEntrada,
      taxaDeJurosAnual: simulationData.taxaDeJurosAnual,
      prazoEmAnos: simulationData.prazoEmAnos,
      dataDoContrato: simulationData.dataDoContrato,
      taxaDeAdministracaoMensal: simulationData.taxaDeAdministracaoMensal,
      valorização: simulationData.valorização,
      percentualParaAluguel: simulationData.percentualParaAluguel,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  const calculateAmortization = () => {
    const {
      valorDoImovel,
      valorDaEntrada,
      taxaDeJurosAnual,
      prazoEmAnos,
    } = simulationData;

    const principal = valorDoImovel - valorDaEntrada;
    const monthlyInterestRate = taxaDeJurosAnual / 100 / 12;
    const numberOfPayments = prazoEmAnos * 12;

    const monthlyPaymentValue =
      (principal * monthlyInterestRate) /
      (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));

    const totalPaymentValue = monthlyPaymentValue * numberOfPayments;
    const totalInterestPaidValue = totalPaymentValue - principal;

    setMonthlyPayment(monthlyPaymentValue);
    setTotalPayment(totalPaymentValue);
    setTotalInterestPaid(totalInterestPaidValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculateAmortization();
    setShowResults(true);
    toast({
      title: "Simulação Concluída.",
      description: "Confira os resultados abaixo.",
      action: <ToastAction altText="Ver resultados">Ver</ToastAction>,
    })
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Simulador de Financiamento Imobiliário
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Home className="mr-2 h-5 w-5 text-simulae-600" />
              Informações do Imóvel
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="valorDoImovel" className="text-base font-medium">
                  Valor do Imóvel
                </Label>
                <Input
                  type="number"
                  id="valorDoImovel"
                  value={simulationData.valorDoImovel}
                  onChange={(e) => setSimulationData(prev => ({ ...prev, valorDoImovel: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="valorDaEntrada" className="text-base font-medium">
                  Valor da Entrada
                </Label>
                <Input
                  type="number"
                  id="valorDaEntrada"
                  value={simulationData.valorDaEntrada}
                  onChange={(e) => setSimulationData(prev => ({ ...prev, valorDaEntrada: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <KeyRound className="mr-2 h-5 w-5 text-simulae-600" />
              Condições de Financiamento
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="taxaDeJurosAnual" className="text-base font-medium">
                  Taxa de Juros Anual (%)
                </Label>
                <Input
                  type="number"
                  id="taxaDeJurosAnual"
                  value={simulationData.taxaDeJurosAnual}
                  onChange={(e) => setSimulationData(prev => ({ ...prev, taxaDeJurosAnual: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="prazoEmAnos" className="text-base font-medium">
                  Prazo de Financiamento (anos)
                </Label>
                <Input
                  type="number"
                  id="prazoEmAnos"
                  value={simulationData.prazoEmAnos}
                  onChange={(e) => setSimulationData(prev => ({ ...prev, prazoEmAnos: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="taxaDeAdministracaoMensal" className="text-base font-medium">
                  Taxa de Administração Mensal (%)
                </Label>
                <Input
                  type="number"
                  id="taxaDeAdministracaoMensal"
                  value={simulationData.taxaDeAdministracaoMensal}
                  onChange={(e) => setSimulationData(prev => ({ ...prev, taxaDeAdministracaoMensal: parseFloat(e.target.value) }))}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="dataDoContrato" className="text-base font-medium">Data do Contrato</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={
                        "w-full justify-start text-left font-normal" +
                        (simulationData.dataDoContrato ? " text-black" : " text-muted-foreground")
                      }
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {simulationData.dataDoContrato ? (
                        format(simulationData.dataDoContrato, "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        <span>Escolher Data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      locale={ptBR}
                      selected={simulationData.dataDoContrato}
                      onSelect={(date) => {
                        if (date) {
                          setSimulationData(prev => ({ ...prev, dataDoContrato: date }));
                        }
                      }}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-simulae-600" />
              Parâmetros de Valorização
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <PercentageSlider
                  id="valorização"
                  label="Índice de valorização mensal"
                  value={simulationData.valorização}
                  onChange={(value) => setSimulationData(prev => ({ ...prev, valorização: value }))}
                  min={0}
                  max={5}
                  step={0.05}
                  suffix="%"
                  showIncrementButtons={true}
                  incrementStep={0.05}
                  showInfoLink={true}
                  infoLinkUrl="https://www.datazap.com.br/conteudos-fipezap/"
                  infoLinkTooltip="Consultar os índices de valorização FipeZap por região"
                  useFipeLogo={true}
                />
              </div>
              
              <div>
                <PercentageSlider
                  id="percentualParaAluguel"
                  label="Percentual para aluguel"
                  value={simulationData.percentualParaAluguel}
                  onChange={(value) => setSimulationData(prev => ({ ...prev, percentualParaAluguel: value }))}
                  min={0}
                  max={10}
                  step={0.05}
                  suffix="%"
                  showIncrementButtons={true}
                  incrementStep={0.05}
                />
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full">
            Simular Financiamento
          </Button>
        </form>
        
        {showResults && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Resultados da Simulação
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valor da Parcela Mensal</CardTitle>
                  <CardDescription>
                    Este é o valor que você pagará mensalmente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">
                    R$ {formatToBrazilianNumber(monthlyPayment)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total Pago ao Final do Financiamento</CardTitle>
                  <CardDescription>
                    Valor total pago, incluindo juros e amortização.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">
                    R$ {formatToBrazilianNumber(totalPayment)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Total de Juros Pagos</CardTitle>
                  <CardDescription>
                    O montante total de juros pagos ao longo do financiamento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-700">
                    R$ {formatToBrazilianNumber(totalInterestPaid)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
