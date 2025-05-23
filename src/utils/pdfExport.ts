
import jsPDF from 'jspdf';
import { SavedSimulation } from './simulationHistoryUtils';
import { formatCurrency, formatPercentage } from './calculationUtils';
import { calculateRentalEstimate } from './calculationUtils';

// Function to export the simulation to a PDF
export function exportToPdf(simulation: SavedSimulation): void {
  // Define the document structure
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Add the logo
  const logoHeight = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 60;
  const logoX = (pageWidth - logoWidth) / 2;
  
  // Use the Simulae logo
  doc.addImage("/lovable-uploads/c2a68237-fb14-4957-891c-3d3581836ace.png", "PNG", logoX, 10, logoWidth, logoHeight);
  
  // Add header information
  const headerY = logoHeight + 15;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Relatório de Simulação", pageWidth / 2, headerY, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Nome: ${simulation.name}`, 20, headerY + 10);
  doc.text(`Data: ${new Intl.DateTimeFormat('pt-BR').format(simulation.timestamp)}`, 20, headerY + 15);
  
  // Add horizontal line
  const lineY = headerY + 20;
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
  
  // Format percentages correctly
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
  
  // Format percentages correctly
  doc.text(`Chaves: ${formatCurrency(simulation.formData.keysValue)} (${formatPercentage(simulation.formData.keysPercentage/100)})`, 20, yPos);
  
  yPos += 5;
  
  // Format percentages correctly
  doc.text(`Correção: ${formatPercentage(simulation.formData.correctionIndex/100)} ao mês`, 20, yPos);
  
  yPos += 5;
  
  // Format percentages correctly
  doc.text(`Valorização: ${formatPercentage(simulation.formData.appreciationIndex/100)} ao mês`, 20, yPos);
  
  yPos += 5;
  
  doc.text(`Mês para revenda: ${simulation.formData.resaleMonth}`, 20, yPos);
  
  // Add horizontal line
  yPos += 10;
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Section: Results
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
  
  // CRITICAL FIX: Use direct calculation for profit percentage - no need to divide by 100 
  // because the calculation is already correct (profit/investment * 100)
  const profitPercentage = (simulation.results.profit / simulation.results.investmentValue) * 100;
  doc.text(`Lucro na revenda: ${formatCurrency(simulation.results.profit)} (${formatPercentage(profitPercentage/100)})`, 20, yPos);
  
  // Add rental information if available
  if (simulation.formData.rentalPercentage) {
    yPos += 10;
    
    // Rental section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Estimativa de Aluguel", 20, yPos);
    
    yPos += 8;
    
    // Get the delivery month property value (last month in the schedule)
    const deliveryPropertyValue = getDeliveryPropertyValue(simulation);
    
    // Calculate rental information using the delivery property value
    const rentalData = calculateRentalEstimate(
      deliveryPropertyValue,
      simulation.formData.rentalPercentage
    );
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    // Format percentages correctly
    doc.text(`Percentual para aluguel: ${formatPercentage(simulation.formData.rentalPercentage/100)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Valor do imóvel na entrega: ${formatCurrency(deliveryPropertyValue)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Aluguel mensal estimado: ${formatCurrency(rentalData.rentalEstimate)}`, 20, yPos);
    
    yPos += 5;
    
    doc.text(`Renda anual: ${formatCurrency(rentalData.annualRental)}`, 20, yPos);
    
    yPos += 5;
    
    // Format percentages correctly
    doc.text(`Rentabilidade anual: ${formatPercentage(rentalData.annualRentalReturn/100)}`, 20, yPos);
  }
  
  // Add horizontal line
  yPos += 10;
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Best months for resale
  if (simulation.bestResaleInfo) {
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Melhores Meses para Revenda", 20, yPos);
    
    yPos += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    if (simulation.bestResaleInfo.bestProfitMonth > 0) {
      // CRITICAL FIX: Recalculate the profit percentage correctly
      const maxProfitPercentage = simulation.bestResaleInfo.maxProfit / simulation.results.investmentValue * 100;
      doc.text(
        `Maior lucro: Mês ${simulation.bestResaleInfo.bestProfitMonth} - ${formatCurrency(simulation.bestResaleInfo.maxProfit)} (${formatPercentage(maxProfitPercentage/100)})`,
        20,
        yPos
      );
      
      yPos += 5;
    }
    
    if (simulation.bestResaleInfo.bestRoiMonth > 0) {
      // CRITICAL FIX: Use maxRoi correctly - this should already be a proper percentage
      doc.text(
        `Maior ROI: Mês ${simulation.bestResaleInfo.bestRoiMonth} - ${formatCurrency(simulation.bestResaleInfo.maxRoiProfit)} (${formatPercentage(simulation.bestResaleInfo.maxRoi/100)})`,
        20,
        yPos
      );
      
      yPos += 5;
    }
    
    if (simulation.bestResaleInfo.earlyMonth) {
      // CRITICAL FIX: Recalculate the early profit percentage correctly if it exists
      const earlyProfitPercentage = (simulation.bestResaleInfo.earlyProfit || 0) / simulation.results.investmentValue * 100;
      doc.text(
        `Mais cedo: Mês ${simulation.bestResaleInfo.earlyMonth} - ${formatCurrency(simulation.bestResaleInfo.earlyProfit || 0)} (${formatPercentage(earlyProfitPercentage/100)})`,
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
