import jsPDF from 'jspdf';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatPercentage } from './calculationUtils';
import { calculateRentalEstimate } from './calculationUtils';
import { formatDateBR } from './dateUtils';
import { CUB_CORRECTION_DATA } from './correctionData';

// Function to export the simulation to a PDF
export function exportToPdf(simulation: SavedSimulation, simulationName?: string): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const logoHeight = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 60;
  const logoX = (pageWidth - logoWidth) / 2;
  
  doc.addImage("/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png", "PNG", logoX, 10, logoWidth, logoHeight);
  
  let headerY = logoHeight + 15;
  
  // Add simulation name if provided
  if (simulationName) {
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(simulationName, pageWidth / 2, headerY, { align: "center" });
    headerY += 10;
  }
  
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Simulação", pageWidth / 2, headerY, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${simulation.name}`, 20, headerY + 10);
  doc.text(`Data: ${new Intl.DateTimeFormat('pt-BR').format(simulation.timestamp)}`, 20, headerY + 15);
  
  // Add start date and delivery date if available
  if (simulation.formData.startDate) {
    doc.text(`Data inicial: ${formatDateBR(simulation.formData.startDate)}`, 20, headerY + 20);
    
    // Calculate delivery date
    const deliveryDate = new Date(simulation.formData.startDate);
    deliveryDate.setMonth(deliveryDate.getMonth() + simulation.formData.installmentsCount + 1);
    doc.text(`Data de entrega: ${formatDateBR(deliveryDate)}`, 20, headerY + 25);
  }
  
  const lineY = simulation.formData.startDate ? headerY + 30 : headerY + 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, lineY, pageWidth - 20, lineY);
  
  // Section: Property Information
  let yPos = lineY + 10;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Informações do Imóvel", 20, yPos);
  
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Valor do imóvel: ${formatCurrency(simulation.formData.propertyValue)}`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Entrada: ${formatCurrency(simulation.formData.downPaymentValue)} (${formatPercentage(simulation.formData.downPaymentPercentage/100)})`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Parcelas: ${simulation.formData.installmentsCount} x ${formatCurrency(simulation.formData.installmentsValue)}`, 20, yPos);
  
  yPos += 5;
  
  if (simulation.formData.reinforcementFrequency > 0) {
    doc.text(
      `Reforços: ${formatCurrency(simulation.formData.reinforcementsValue)} a cada ${simulation.formData.reinforcementFrequency} meses`,
      20,
      yPos
    );
  } else {
    doc.text("Reforços: Nenhum", 20, yPos);
  }
  
  yPos += 5;
  
  doc.text(`Chaves: ${formatCurrency(simulation.formData.keysValue)} (${formatPercentage(simulation.formData.keysPercentage/100)})`, 20, yPos);
  
  yPos += 5;
  
  // Display correction based on mode
  if (simulation.formData.correctionMode === "cub") {
    // Calculate average CUB correction
    const avgCubCorrection = CUB_CORRECTION_DATA.reduce((sum, item) => sum + item.percentage, 0) / CUB_CORRECTION_DATA.length;
    doc.text(`Correção: CUB (média ${formatPercentage(avgCubCorrection/100)} ao mês)`, 20, yPos);
  } else {
    doc.text(`Correção: ${formatPercentage(simulation.formData.correctionIndex/100)} ao mês`, 20, yPos);
  }
  
  yPos += 5;
  
  doc.text(`Valorização: ${formatPercentage(simulation.formData.appreciationIndex/100)} ao mês`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Mês para revenda: ${simulation.formData.resaleMonth}`, 20, yPos);
  
  // Add horizontal line
  yPos += 10;
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Section: Results - Use the exact values from simulation.results
  yPos += 10;
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resultados", 20, yPos);
  
  yPos += 8;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Total investido: ${formatCurrency(simulation.results.investmentValue)}`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Valor do imóvel na revenda: ${formatCurrency(simulation.results.propertyValue)}`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Saldo devedor: ${formatCurrency(simulation.results.remainingBalance)}`, 20, yPos);
  
  yPos += 5;
  
  // Use the profit percentage directly from results - it should already be calculated correctly
  doc.text(`Lucro na revenda: ${formatCurrency(simulation.results.profit)} (${formatPercentage(simulation.results.profitPercentage/100)})`, 20, yPos);
  
  // Add rental information if available
  if (simulation.formData.rentalPercentage && simulation.results.rentalEstimate) {
    yPos += 10;
    
    // Rental section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estimativa de Aluguel", 20, yPos);
    
    yPos += 8;
    
    // Get the delivery month property value (last month in the schedule)
    const deliveryPropertyValue = getDeliveryPropertyValue(simulation);
    
    // CRITICAL FIX: Calculate the rental estimate based on the delivery property value
    // This ensures the calculation matches what's shown in the UI
    const correctRentalEstimate = calculateRentalEstimate(deliveryPropertyValue, simulation.formData.rentalPercentage);
    const rentalEstimate = correctRentalEstimate.rentalEstimate;
    const annualRental = rentalEstimate * 12;
    const annualRentalReturn = correctRentalEstimate.annualRentalReturn;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Percentual para aluguel: ${formatPercentage(simulation.formData.rentalPercentage/100)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Valor do imóvel na entrega: ${formatCurrency(deliveryPropertyValue)}`, 20, yPos);
    
    yPos += 5;
    
    // Use the correctly calculated rental estimate
    doc.text(`Aluguel mensal estimado: ${formatCurrency(rentalEstimate)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Renda anual: ${formatCurrency(annualRental)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Rentabilidade anual: ${formatPercentage(annualRentalReturn/100)}`, 20, yPos);
  }

  // Add sales costs section if any costs are enabled
  if (simulation.formData.incluirComissao || simulation.formData.incluirIRPF) {
    yPos += 15;
    
    // Sales costs section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("💰 Resumo da Venda com Custos", 20, yPos);
    
    yPos += 10;
    
    // Get values for calculations
    const valorVenda = simulation.formData.valorVendaPrevisto || simulation.results.propertyValue;
    const totalInvestido = simulation.results.investmentValue;
    const lucroBruto = valorVenda - totalInvestido;
    
    // Calculate costs
    const comissao = simulation.formData.incluirComissao ? (valorVenda * simulation.formData.percentualComissao / 100) : 0;
    const irpf = simulation.formData.incluirIRPF ? (lucroBruto * simulation.formData.percentualIRPF / 100) : 0;
    const lucroLiquido = lucroBruto - comissao - irpf;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Valor de venda previsto
    doc.text(`Valor de Venda Previsto: ${formatCurrency(valorVenda)}`, 20, yPos);
    yPos += 5;
    
    // Total investido
    doc.text(`Total Investido até a Revenda: ${formatCurrency(totalInvestido)}`, 20, yPos);
    yPos += 5;
    
    // Lucro bruto
    doc.text(`Lucro Bruto: ${formatCurrency(lucroBruto)}`, 20, yPos);
    yPos += 8;
    
    // Costs breakdown
    if (simulation.formData.incluirComissao) {
      doc.text(`− Comissão de Corretagem (${simulation.formData.percentualComissao}%): ${formatCurrency(comissao)}`, 25, yPos);
      yPos += 5;
    }
    
    if (simulation.formData.incluirIRPF) {
      doc.text(`− IRPF sobre Ganho de Capital (${simulation.formData.percentualIRPF}%): ${formatCurrency(irpf)}`, 25, yPos);
      yPos += 5;
    }
    
    yPos += 3;
    
    // Draw line for final result
    doc.setDrawColor(100, 100, 100);
    doc.line(20, yPos, 120, yPos);
    yPos += 8;
    
    // Final net profit
    doc.setFont("helvetica", "bold");
    doc.text(`= Lucro Líquido após Custos: ${formatCurrency(lucroLiquido)}`, 20, yPos);
    
    // Calculate net profit percentage
    const lucroLiquidoPercentual = totalInvestido > 0 ? (lucroLiquido / totalInvestido) * 100 : 0;
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.text(`Rentabilidade líquida: ${formatPercentage(lucroLiquidoPercentual/100)}`, 20, yPos);
  }

  // Add horizontal line
  yPos += 10;
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Best months for resale - Use the exact values from simulation.bestResaleInfo
  if (simulation.bestResaleInfo) {
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Melhores Meses para Revenda", 20, yPos);
    
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    if (simulation.bestResaleInfo.bestProfitMonth > 0) {
      doc.text(
        `Maior lucro: Mês ${simulation.bestResaleInfo.bestProfitMonth} - ${formatCurrency(simulation.bestResaleInfo.maxProfit)} (${formatPercentage(simulation.bestResaleInfo.maxProfitPercentage/100)})`,
        20,
        yPos
      );
      
      yPos += 5;
    }
    
    if (simulation.bestResaleInfo.bestRoiMonth > 0) {
      doc.text(
        `Maior ROI: Mês ${simulation.bestResaleInfo.bestRoiMonth} - ${formatCurrency(simulation.bestResaleInfo.maxRoiProfit)} (${formatPercentage(simulation.bestResaleInfo.maxRoi/100)})`,
        20,
        yPos
      );
      
      yPos += 5;
    }
    
    if (simulation.bestResaleInfo.earlyMonth && simulation.bestResaleInfo.earlyProfit && simulation.bestResaleInfo.earlyProfitPercentage) {
      doc.text(
        `Mais cedo: Mês ${simulation.bestResaleInfo.earlyMonth} - ${formatCurrency(simulation.bestResaleInfo.earlyProfit)} (${formatPercentage(simulation.bestResaleInfo.earlyProfitPercentage/100)})`,
        20,
        yPos
      );
    }
  }
  
  // Save the PDF
  doc.save(`simulae_${simulation.id}.pdf`);
}

// Helper function to get the delivery property value
function getDeliveryPropertyValue(simulation: SavedSimulation): number {
  // If we have a schedule, use the last month's property value
  if (simulation.schedule && simulation.schedule.length > 0) {
    const deliveryMonthData = simulation.schedule[simulation.schedule.length - 1];
    return deliveryMonthData.propertyValue;
  }
  
  // Fallback to the property value in the results
  return simulation.results.propertyValue;
}

// Export the function with the expected name
export const generatePDF = exportToPdf;
