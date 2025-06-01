import jsPDF from 'jspdf';
import { PropostaData } from '@/types/proposta';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatDateBR } from './formatUtils';

export const generatePropostaPDF = (data: PropostaData, simulation: SavedSimulation): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Gerar descrição da correção monetária baseada no modo
  const getCorrectionDescription = () => {
    if (simulation.formData.correctionMode === "cub") {
      return "Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice CUB acumulado (média dos últimos 12 meses) até a data de vencimento de cada parcela, conforme política vigente da construtora.";
    } else {
      const percentage = (simulation.formData.correctionIndex * 100).toFixed(2);
      return `Os valores apresentados acima são nominais. Toda a composição será corrigida mensalmente pelo índice de ${percentage}% ao mês até a data de vencimento de cada parcela, conforme política vigente da construtora.`;
    }
  };

  // Configuração inicial
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Título
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA COMERCIAL", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 15;
  
  // Subtítulo
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Simulação: ${simulation.name}`, pageWidth / 2, yPos, { align: "center" });
  
  yPos += 15;
  
  // Linha divisória
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // DADOS DO COMPRADOR
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO COMPRADOR", margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const compradorData = [
    `Nome: ${data.nomeCompleto || "___________________"}`,
    `CPF: ${data.cpf || "___.___.___-__"}`,
    `Telefone: ${data.telefone || "(__) _____-____"}`,
    `E-mail: ${data.email || "_________________"}`
  ];

  compradorData.forEach(item => {
    doc.text(item, margin, yPos);
    yPos += 5;
  });

  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // DADOS DA UNIDADE
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DA UNIDADE", margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const unidadeData = [
    `Empreendimento: ${data.nomeEmpreendimento || "___________________"}`,
    `Endereço: ${data.enderecoCompleto || "___________________"}`,
    `Unidade: ${data.numeroUnidade || "___"} - ${data.andarPavimento || "___º andar"}`,
    `Área privativa: ${data.areaPrivativa || "___"} m²`,
    `Vagas: ${data.numeroVagas || "___"} ${data.possuiBox ? "com box" : "sem box"}`
  ];

  unidadeData.forEach(item => {
    doc.text(item, margin, yPos);
    yPos += 5;
  });

  yPos += 5;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // PROPOSTA FINANCEIRA
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSTA FINANCEIRA", margin, yPos);
  yPos += 8;

  // Valor total destacado
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Valor total do imóvel: ${formatCurrency(simulation.formData.propertyValue)}`, margin, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  // Entrada
  doc.text(`Entrada: ${formatCurrency(simulation.formData.downPaymentValue)}`, margin, yPos);
  yPos += 5;
  
  if (simulation.formData.startDate) {
    doc.text(`Data: ${formatDateBR(new Date(simulation.formData.startDate))}`, margin + 5, yPos);
    yPos += 5;
  }

  yPos += 3;

  // Parcelas
  doc.text(`Parcelas mensais:`, margin, yPos);
  yPos += 5;
  doc.text(`${simulation.formData.installmentsCount}x de ${formatCurrency(simulation.formData.installmentsValue)}`, margin + 5, yPos);
  yPos += 5;

  if (simulation.formData.startDate) {
    const startDate = new Date(simulation.formData.startDate);
    const firstInstallment = new Date(startDate.setMonth(startDate.getMonth() + 1));
    const lastInstallment = new Date(startDate.setMonth(startDate.getMonth() + simulation.formData.installmentsCount - 1));
    
    doc.text(`Período: ${formatDateBR(firstInstallment)} até ${formatDateBR(lastInstallment)}`, margin + 5, yPos);
    yPos += 5;
  }

  yPos += 3;

  // Reforços (se houver)
  const reinforcements = simulation.schedule?.filter(payment => 
    payment.description.includes("Reforço")
  ) || [];

  if (reinforcements.length > 0) {
    doc.text(`Reforços:`, margin, yPos);
    yPos += 5;
    reinforcements.forEach(reinforcement => {
      doc.text(`Mês ${reinforcement.month}: ${formatCurrency(reinforcement.amount)}`, margin + 5, yPos);
      yPos += 4;
    });
    yPos += 3;
  }

  // Saldo na entrega
  doc.text(`Saldo na entrega das chaves: ${formatCurrency(simulation.formData.keysValue)}`, margin, yPos);
  yPos += 5;
  
  // Data prevista de entrega
  if (simulation.formData.startDate) {
    const keysDate = new Date(simulation.formData.startDate);
    keysDate.setMonth(keysDate.getMonth() + simulation.formData.installmentsCount + 1);
    doc.text(`Data prevista: ${formatDateBR(keysDate)}`, margin + 5, yPos);
    yPos += 5;
  }

  yPos += 10;
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // CORREÇÃO MONETÁRIA
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CORREÇÃO MONETÁRIA", margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const correcaoText = getCorrectionDescription();
  
  const splitText = doc.splitTextToSize(correcaoText, pageWidth - (margin * 2));
  doc.text(splitText, margin, yPos);

  // Salvar o PDF
  doc.save(`proposta_comercial_${simulation.name.replace(/\s+/g, '_')}.pdf`);
};
