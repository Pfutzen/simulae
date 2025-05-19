
import jsPDF from 'jspdf';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatPercentage } from './calculationUtils';

// Extend jsPDF types to include the getNumberOfPages method
declare module 'jspdf' {
  interface jsPDF {
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      },
      pages: number[];
      getNumberOfPages: () => number;
      getEncryptor: (objectId: number) => (data: string) => string;
    }
  }
}

// Function to format date
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

// Main export function
export const exportToPdf = (simulation: SavedSimulation): void => {
  const doc = new jsPDF();
  
  // Set font size and styles
  const titleSize = 16;
  const subtitleSize = 14;
  const normalSize = 10;
  const smallSize = 8;
  
  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let y = margin;
  
  // Add logo if available
  try {
    const img = new Image();
    img.src = '/lovable-uploads/e8e576bb-04f1-435e-8340-69508d489877.png';
    doc.addImage(img, 'PNG', margin, y, 50, 15);
    y += 20;
  } catch (error) {
    console.error('Error adding logo to PDF:', error);
  }
  
  // Title
  doc.setFontSize(titleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulação de Investimento Imobiliário', margin, y);
  y += 10;
  
  // Simulation name and date
  doc.setFontSize(normalSize);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${simulation.name}`, margin, y);
  y += 6;
  doc.text(`Data: ${formatDate(simulation.timestamp)}`, margin, y);
  y += 10;
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  // Parameters section
  doc.setFontSize(subtitleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Parâmetros da Simulação', margin, y);
  y += 8;
  
  // Function to add a parameter line
  const addParamLine = (label: string, value: string): void => {
    doc.setFontSize(normalSize);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 70, y);
    y += 6;
  };
  
  // Parameters
  addParamLine('Valor do imóvel:', formatCurrency(simulation.formData.propertyValue));
  addParamLine('Entrada:', `${formatCurrency(simulation.formData.downPaymentValue)} (${simulation.formData.downPaymentPercentage}%)`);
  addParamLine('Parcelas:', `${simulation.formData.installmentsCount}x de ${formatCurrency(simulation.formData.installmentsValue)} (${simulation.formData.installmentsPercentage}%)`);
  
  if (simulation.formData.reinforcementsValue > 0) {
    const reinforcementMonths = Math.floor(simulation.formData.installmentsCount / simulation.formData.reinforcementFrequency);
    addParamLine('Reforços:', `${reinforcementMonths}x de ${formatCurrency(simulation.formData.reinforcementsValue)} (${simulation.formData.reinforcementsPercentage}%)`);
    addParamLine('Frequência de reforços:', `A cada ${simulation.formData.reinforcementFrequency} meses`);
  }
  
  addParamLine('Chaves:', `${formatCurrency(simulation.formData.keysValue)} (${simulation.formData.keysPercentage}%)`);
  addParamLine('Índice de correção:', `${simulation.formData.correctionIndex}% ao mês`);
  addParamLine('Índice de valorização:', `${simulation.formData.appreciationIndex}% ao mês`);
  
  y += 5;
  
  // Separator line
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;
  
  // Results section
  doc.setFontSize(subtitleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultados da Simulação', margin, y);
  y += 8;
  
  // Add result line
  const addResultLine = (label: string, value: string): void => {
    doc.setFontSize(normalSize);
    doc.setFont('helvetica', 'bold');
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 90, y);
    y += 6;
  };
  
  // Results for chosen resale month
  addResultLine('Mês de revenda escolhido:', `Mês ${simulation.formData.resaleMonth}`);
  addResultLine('Total investido:', formatCurrency(simulation.results.investmentValue));
  addResultLine('Valor do imóvel na revenda:', formatCurrency(simulation.results.propertyValue));
  addResultLine('Saldo devedor:', formatCurrency(simulation.results.remainingBalance));
  addResultLine('Lucro na revenda:', formatCurrency(simulation.results.profit));
  addResultLine('Percentual de retorno:', formatPercentage(simulation.results.profitPercentage));
  
  y += 5;
  
  // Best months section
  doc.setFontSize(subtitleSize);
  doc.setFont('helvetica', 'bold');
  doc.text('Melhores Meses para Revenda', margin, y);
  y += 8;
  
  if (simulation.bestResaleInfo.bestProfitMonth > 0) {
    addResultLine('Mês de maior lucro:', `Mês ${simulation.bestResaleInfo.bestProfitMonth}: ${formatCurrency(simulation.bestResaleInfo.maxProfit)}`);
    addResultLine('Percentual de retorno:', formatPercentage(simulation.bestResaleInfo.maxProfitPercentage));
  }
  
  if (simulation.bestResaleInfo.bestRoiMonth > 0) {
    addResultLine('Mês de melhor ROI:', `Mês ${simulation.bestResaleInfo.bestRoiMonth}: ${formatCurrency(simulation.bestResaleInfo.maxRoiProfit)}`);
    addResultLine('Percentual de retorno:', formatPercentage(simulation.bestResaleInfo.maxRoi));
  }
  
  if (simulation.bestResaleInfo.earlyMonth) {
    addResultLine('Mês mais cedo com lucro:', `Mês ${simulation.bestResaleInfo.earlyMonth}: ${formatCurrency(simulation.bestResaleInfo.earlyProfit || 0)}`);
    addResultLine('Percentual de retorno:', formatPercentage(simulation.bestResaleInfo.earlyProfitPercentage || 0));
  }
  
  // Check if we need a new page for the schedule
  if (y > 240) {
    doc.addPage();
    y = margin;
  } else {
    y += 10;
  }
  
  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(smallSize);
    doc.setFont('helvetica', 'italic');
    doc.text(`Simulae - Página ${i} de ${totalPages}`, margin, pageWidth - 10);
    doc.text(`Gerado em ${formatDate(Date.now())}`, pageWidth - margin - 50, pageWidth - 10, { align: 'right' });
  }
  
  // Save the PDF
  doc.save(`simulacao-${simulation.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
};
