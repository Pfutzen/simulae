
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calculator, FileText, Users, Star } from "lucide-react";

const HeroSection = () => {
  const testimonials = [
    {
      name: "André Silva",
      location: "Balneário Piçarras",
      text: "Descobri que o lucro de revenda podia passar de 70%! Nunca mais compro no escuro.",
      rating: 5
    },
    {
      name: "Marina Costa",
      location: "Florianópolis",
      text: "O simulador me ajudou a escolher o melhor plano de pagamento. Economia de mais de R$ 50mil!",
      rating: 5
    },
    {
      name: "Roberto Oliveira",
      location: "Camboriú",
      text: "Ferramenta indispensável para quem investe em imóveis na planta. Muito completa!",
      rating: 5
    }
  ];

  const scrollToSimulator = () => {
    const simulatorElement = document.querySelector('[data-simulator-form]');
    if (simulatorElement) {
      simulatorElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-gradient-to-br from-primary/5 via-slate-50 to-simulae-100/20 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <TrendingUp className="h-4 w-4 mr-2" />
                Simulador #1 para imóveis na planta
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Transforme sua decisão de compra em{" "}
                <span className="text-primary">estratégia</span>
              </h1>
              
              <p className="text-xl text-slate-600 leading-relaxed">
                Simule, compare e invista com confiança. Analise parcelas, valorização e potencial de revenda antes de assinar o contrato.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={scrollToSimulator}
              >
                <Calculator className="h-5 w-5 mr-2" />
                Simule agora gratuitamente
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => {
                  const demoElement = document.querySelector('[data-demo-section]');
                  if (demoElement) {
                    demoElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <FileText className="h-5 w-5 mr-2" />
                Ver demonstração
              </Button>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-slate-700">Simulação completa</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-slate-700">Análise de valorização</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-slate-700">Proposta comercial</p>
              </div>
            </div>
          </div>

          {/* Demo Visual */}
          <div className="relative" data-demo-section>
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="ml-4 text-sm text-slate-300">simulae.com</span>
                  </div>
                  <img 
                    src="/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png" 
                    alt="Demonstração do Simulae"
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                </div>
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">+15%</p>
                      <p className="text-sm text-slate-600">Valorização média</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">R$ 85mil</p>
                      <p className="text-sm text-slate-600">Lucro projetado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
              Lucro: +70%
            </div>
            <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Análise completa
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mt-20" data-testimonials-section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Investidores que já usaram recomendam
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-slate-600 ml-2">4.9/5 baseado em +200 simulações</span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-slate-700 mb-4 italic">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="bg-primary/10 rounded-full p-2 mr-3">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
