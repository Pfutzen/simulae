
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Import as a side effect to extend jsPDF
import html2canvas from 'html2canvas';
import { PaymentType, formatCurrency, formatPercentage } from './calculationUtils';

// Define the interface for simulation data
interface SimulationPdfData {
  date: Date;
  propertyValue: number;
  correctionMode: string;
  correctionIndex?: number;
  appreciationIndex: number;
  downPaymentValue: number;
  downPaymentPercentage: number;
  installmentsValue: number;
  installmentsPercentage: number;
  installmentsCount: number;
  reinforcementsValue: number;
  reinforcementsPercentage: number;
  reinforcementFrequency: number;
  keysValue: number;
  keysPercentage: number;
  investmentValue: number;
  currentPropertyValue: number;
  remainingBalance: number;
  profit: number;
  profitPercentage: number;
  resaleMonth: number;
  schedule: PaymentType[];
  bestResaleInfo: {
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
  };
  chartRef?: React.RefObject<HTMLDivElement>;
}

// Extend the jsPDF type to include the autotable properties
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
    internal: any;
  }
}

export const exportSimulationPdf = async (data: SimulationPdfData) => {
  // Create a new PDF document
  const pdf = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

  // Add title and date
  pdf.setFontSize(18);
  pdf.setTextColor(33, 33, 33);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Resumo da Simulação Imobiliária', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 30;
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);
  const formattedDate = data.date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  pdf.text(`Data da simulação: ${formattedDate}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 40;

  // Main information section
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(33, 33, 33);
  pdf.text('Informações Principais', margin, yPos);
  
  yPos += 20;

  // Prepare information as two columns
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  
  const addInfoRow = (label: string, value: string, y: number) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(label, margin, y);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(33, 33, 33);
    pdf.text(value, margin + 200, y);
    return y + 20;
  };

  // Column 1
  yPos = addInfoRow('Valor total do imóvel:', formatCurrency(data.propertyValue), yPos);
  yPos = addInfoRow('Correção utilizada:', 
    data.correctionMode === 'manual' 
      ? `Manual (${formatPercentage(data.correctionIndex || 0)} ao mês)` 
      : 'CUB/SC', 
    yPos);
  yPos = addInfoRow('Valorização mensal:', formatPercentage(data.appreciationIndex), yPos);
  yPos = addInfoRow('Entrada:', `${formatCurrency(data.downPaymentValue)} (${formatPercentage(data.downPaymentPercentage)})`, yPos);
  yPos = addInfoRow('Parcelas:', `${formatCurrency(data.installmentsValue)} × ${data.installmentsCount} (${formatPercentage(data.installmentsPercentage)})`, yPos);
  yPos = addInfoRow('Reforços:', `${formatCurrency(data.reinforcementsValue)} a cada ${data.reinforcementFrequency} meses (${formatPercentage(data.reinforcementsPercentage)})`, yPos);
  yPos = addInfoRow('Chaves:', `${formatCurrency(data.keysValue)} (${formatPercentage(data.keysPercentage)})`, yPos);

  // Add a little spacing
  yPos += 10;

  // Column 2 - Resale info
  yPos = addInfoRow('Total investido até o mês:', `${formatCurrency(data.investmentValue)} (mês ${data.resaleMonth})`, yPos);
  yPos = addInfoRow('Valor do imóvel no mês:', formatCurrency(data.currentPropertyValue), yPos);
  yPos = addInfoRow('Saldo devedor no mês:', formatCurrency(data.remainingBalance), yPos);
  yPos = addInfoRow('Lucro líquido estimado:', `${formatCurrency(data.profit)} (${formatPercentage(data.profitPercentage)})`, yPos);
  
  if (data.bestResaleInfo && data.bestResaleInfo.bestProfitMonth > 0) {
    yPos = addInfoRow('Melhor mês para revenda:', 
      `Mês ${data.bestResaleInfo.bestProfitMonth} - ${formatCurrency(data.bestResaleInfo.maxProfit)} (${formatPercentage(data.bestResaleInfo.maxProfitPercentage)})`, 
      yPos);
  }

  // Add chart if available
  if (data.chartRef?.current) {
    yPos += 30;
    
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(33, 33, 33);
    pdf.text('Evolução do Investimento', margin, yPos);
    
    yPos += 20;
    
    try {
      const canvas = await html2canvas(data.chartRef.current, {
        scale: 2,
        backgroundColor: null,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Check if we need to add a new page for the chart
      if (yPos + imgHeight > pdf.internal.pageSize.getHeight() - margin) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.addImage(imgData, 'PNG', margin, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 20;
    } catch (error) {
      console.error('Error capturing chart:', error);
      // Continue without the chart if there's an error
    }
  }

  // Check if we need to add a new page for the schedule table
  if (yPos + 200 > pdf.internal.pageSize.getHeight() - margin) {
    pdf.addPage();
    yPos = margin;
  }

  // Payment schedule table
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(33, 33, 33);
  pdf.text('Cronograma de Pagamentos', margin, yPos);
  
  yPos += 20;
  
  // Prepare table data
  const tableHeaders = [
    'Mês', 
    'Descrição', 
    'Valor Mensal', 
    'Total Acumulado', 
    'Valor do Imóvel', 
    'Saldo Devedor', 
    'Lucro'
  ];
  
  const tableBody = data.schedule.map(payment => [
    payment.month.toString(),
    payment.description,
    formatCurrency(payment.amount),
    formatCurrency(payment.totalPaid),
    formatCurrency(payment.propertyValue),
    formatCurrency(payment.balance),
    formatCurrency(payment.propertyValue - payment.totalPaid - payment.balance),
  ]);

  // Add table with autotable
  pdf.autoTable({
    head: [tableHeaders],
    body: tableBody,
    startY: yPos,
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Month
      1: { cellWidth: 60 }, // Description
      2: { cellWidth: 65 }, // Value
      3: { cellWidth: 70 }, // Total Paid
      4: { cellWidth: 70 }, // Property Value
      5: { cellWidth: 70 }, // Balance
      6: { cellWidth: 65 }, // Profit
    },
  });

  // Get the final y position after the table
  const finalY = pdf.lastAutoTable.finalY + 30;

  // Add footer on each page
  const addFooter = (pdf: jsPDF) => {
    const totalPages = pdf.internal.pages.length - 1;
    
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Logo and system name
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(41, 128, 185);
      pdf.text('Simulae', margin, pageHeight - 50);
      
      // Disclaimer
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        'Simulação estimada com base nos índices informados, sem caráter contratual.',
        margin,
        pageHeight - 30
      );
      
      // Page numbers
      pdf.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin,
        pageHeight - 30,
        { align: 'right' }
      );
    }
  };
  
  addFooter(pdf);
  
  // Save the PDF
  pdf.save('simulacao-imobiliaria.pdf');
};
