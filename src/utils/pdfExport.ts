import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { formatCurrency, formatPercentage } from './formatUtils';
import { PaymentType } from './calculationUtils';

// Add types for jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: { finalY: number };
    internal: {
      events: any;
      scaleFactor: number;
      pageSize: {
        width: number;
        getWidth: () => number;
        height: number;
        getHeight: () => number;
      };
      pages: number[];
      // Add both methods to ensure compatibility
      getNumberOfPages: () => number;
      getEncryptor: (objectId: number) => (data: string) => string;
    };
  }
}

interface PdfExportData {
  simulationName: string;
  date: Date;
  propertyValue: number;
  correctionMode: string;
  correctionIndex?: number;
  appreciationIndex: number;
  downPaymentValue: number;
  downPaymentPercentage: number;
  installmentsValue: number;
  installmentsCount: number;
  installmentsPercentage: number;
  reinforcementsValue: number;
  reinforcementFrequency: number;
  reinforcementsPercentage: number;
  keysValue: number;
  keysPercentage: number;
  resaleMonth: number;
  investmentValue: number;
  currentPropertyValue: number;
  remainingBalance: number;
  profit: number;
  profitPercentage: number;
  schedule: PaymentType[];
  bestResaleInfo?: {
    bestProfitMonth: number;
    maxProfit: number;
    maxProfitPercentage: number;
    bestRoiMonth?: number;
    maxRoi?: number;
    maxRoiProfit?: number;
    earlyMonth?: number;
    earlyProfit?: number;
    earlyProfitPercentage?: number;
  };
  chartRef?: React.RefObject<HTMLDivElement>;
}

export const exportSimulationPdf = async (data: PdfExportData) => {
  // Create a new PDF document
  const pdf = new jsPDF('portrait', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  // Add title and date
  pdf.setFontSize(18);
  pdf.setTextColor(33, 33, 33);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${data.simulationName}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 30;

  pdf.setFontSize(14);
  pdf.setTextColor(80, 80, 80);
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
  yPos = addInfoRow(
    'Correção utilizada:', 
    data.correctionMode === 'manual' ? 
      `Manual (${formatPercentage(data.correctionIndex || 0)} ao mês)` : 
      'CUB/SC', 
    yPos
  );
  yPos = addInfoRow('Valorização mensal:', formatPercentage(data.appreciationIndex), yPos);
  yPos = addInfoRow(
    'Entrada:', 
    `${formatCurrency(data.downPaymentValue)} (${formatPercentage(data.downPaymentPercentage)})`, 
    yPos
  );
  yPos = addInfoRow(
    'Parcelas:', 
    `${formatCurrency(data.installmentsValue)} × ${data.installmentsCount} (${formatPercentage(data.installmentsPercentage)})`, 
    yPos
  );
  yPos = addInfoRow(
    'Reforços:', 
    `${formatCurrency(data.reinforcementsValue)} a cada ${data.reinforcementFrequency} meses (${formatPercentage(data.reinforcementsPercentage)})`, 
    yPos
  );
  yPos = addInfoRow(
    'Chaves:', 
    `${formatCurrency(data.keysValue)} (${formatPercentage(data.keysPercentage)})`, 
    yPos
  );

  // Add a little spacing
  yPos += 10;

  // Column 2 - Resale info
  yPos = addInfoRow(
    'Total investido até o mês:', 
    `${formatCurrency(data.investmentValue)} (mês ${data.resaleMonth})`, 
    yPos
  );
  yPos = addInfoRow('Valor do imóvel no mês:', formatCurrency(data.currentPropertyValue), yPos);
  yPos = addInfoRow('Saldo devedor no mês:', formatCurrency(data.remainingBalance), yPos);
  yPos = addInfoRow(
    'Lucro líquido estimado:', 
    `${formatCurrency(data.profit)} (${formatPercentage(data.profitPercentage > 0 ? data.profitPercentage : Math.abs(data.profitPercentage))})`, 
    yPos
  );

  if (data.bestResaleInfo && data.bestResaleInfo.bestProfitMonth > 0) {
    yPos = addInfoRow(
      'Melhor mês para revenda:', 
      `Mês ${data.bestResaleInfo.bestProfitMonth} - ${formatCurrency(data.bestResaleInfo.maxProfit)} (${formatPercentage(data.bestResaleInfo.maxProfitPercentage)})`, 
      yPos
    );
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
        backgroundColor: null
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = canvas.height * imgWidth / canvas.width;

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
    formatCurrency(payment.propertyValue - payment.totalPaid - payment.balance)
  ]);

  // Add table with autotable
  if (typeof pdf.autoTable === 'function') {
    pdf.autoTable({
      head: [tableHeaders],
      body: tableBody,
      startY: yPos,
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 65 },
        3: { cellWidth: 70 },
        4: { cellWidth: 70 },
        5: { cellWidth: 70 },
        6: { cellWidth: 65 }
      }
    });
  } else {
    console.error('autoTable function is not available');
    // Fallback to simple text for the table
    yPos += 20;
    pdf.text('O cronograma de pagamentos não pode ser exibido', margin, yPos);
  }

  // Add footer on each page
  const addFooter = (pdf: jsPDF) => {
    const pageCount = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
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
      pdf.text('Simulação estimada com base nos índices informados, sem caráter contratual.', margin, pageHeight - 30);

      // Page numbers
      pdf.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 30, { align: 'right' });
    }
  };

  addFooter(pdf);

  // Save the PDF with the simulation name
  const fileName = `simulacao-${data.simulationName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
  pdf.save(fileName);
};
