
import { PaymentType } from './types';
import { formatCurrency } from './formatters';
import { formatDateForDisplay } from './dateUtils';
import jsPDF from 'jspdf';

export const exportScheduleToCSV = (schedule: PaymentType[], fileName: string = 'cronograma-pagamentos') => {
  // Cabeçalhos do CSV
  const headers = [
    'Data do Pagamento',
    'Tipo',
    'Valor',
    'Valor do Reforço',
    'Saldo',
    'Total Pago',
    'Valor Corrigido do Imóvel'
  ];

  // Converter dados para CSV
  const csvData = schedule.map(payment => [
    payment.date ? formatDateForDisplay(payment.date) : '-',
    payment.description,
    formatCurrency(payment.amount),
    formatCurrency(payment.reinforcementValue || 0),
    formatCurrency(payment.balance),
    formatCurrency(payment.totalPaid),
    formatCurrency(payment.propertyValue)
  ]);

  // Combinar cabeçalhos e dados
  const csvContent = [headers, ...csvData]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');

  // Criar e baixar arquivo
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportScheduleToExcel = (schedule: PaymentType[], fileName: string = 'cronograma-pagamentos') => {
  // Criar dados para Excel (formato HTML que o Excel pode interpretar)
  const headers = [
    'Data do Pagamento',
    'Tipo',
    'Valor',
    'Valor do Reforço',
    'Saldo',
    'Total Pago',
    'Valor Corrigido do Imóvel'
  ];

  let excelContent = '<table>';
  
  // Cabeçalhos
  excelContent += '<tr>';
  headers.forEach(header => {
    excelContent += `<th style="background-color: #f0f0f0; font-weight: bold; border: 1px solid #ccc; padding: 8px;">${header}</th>`;
  });
  excelContent += '</tr>';

  // Dados
  schedule.forEach(payment => {
    excelContent += '<tr>';
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${payment.date ? formatDateForDisplay(payment.date) : '-'}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${payment.description}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${formatCurrency(payment.amount)}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${formatCurrency(payment.reinforcementValue || 0)}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${formatCurrency(payment.balance)}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${formatCurrency(payment.totalPaid)}</td>`;
    excelContent += `<td style="border: 1px solid #ccc; padding: 8px;">${formatCurrency(payment.propertyValue)}</td>`;
    excelContent += '</tr>';
  });

  excelContent += '</table>';

  // Criar e baixar arquivo
  const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportScheduleToPDF = (schedule: PaymentType[], fileName: string = 'cronograma-pagamentos') => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const tableWidth = pageWidth - (2 * margin);
  
  // Título
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Cronograma de Pagamentos", pageWidth / 2, 20, { align: "center" });
  
  // Cabeçalhos da tabela
  const headers = [
    'Data',
    'Tipo',
    'Valor',
    'Reforço',
    'Saldo',
    'Total Pago',
    'Valor do Imóvel'
  ];
  
  // Ajustar larguras das colunas para melhor distribuição
  const colWidths = [30, 40, 35, 30, 35, 35, 40]; // larguras aumentadas e melhor distribuídas
  let startX = margin;
  let currentY = 35;
  
  // Desenhar cabeçalhos
  doc.setFontSize(9); // Diminuir fonte para caber melhor
  doc.setFont("helvetica", "bold");
  headers.forEach((header, index) => {
    doc.rect(startX, currentY - 5, colWidths[index], 10);
    doc.text(header, startX + 2, currentY, { maxWidth: colWidths[index] - 4 });
    startX += colWidths[index];
  });
  
  currentY += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8); // Fonte menor para os dados
  
  // Adicionar dados
  schedule.forEach((payment, index) => {
    // Verificar se precisa de nova página
    if (currentY > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      
      // Redesenhar cabeçalhos na nova página
      startX = margin;
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      headers.forEach((header, headerIndex) => {
        doc.rect(startX, currentY - 5, colWidths[headerIndex], 10);
        doc.text(header, startX + 2, currentY, { maxWidth: colWidths[headerIndex] - 4 });
        startX += colWidths[headerIndex];
      });
      currentY += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
    }
    
    startX = margin;
    const rowData = [
      payment.date ? formatDateForDisplay(payment.date) : '-',
      payment.description,
      formatCurrency(payment.amount),
      formatCurrency(payment.reinforcementValue || 0),
      formatCurrency(payment.balance),
      formatCurrency(payment.totalPaid),
      formatCurrency(payment.propertyValue)
    ];
    
    rowData.forEach((data, colIndex) => {
      doc.rect(startX, currentY - 5, colWidths[colIndex], 8);
      doc.text(data.toString(), startX + 1, currentY, { 
        maxWidth: colWidths[colIndex] - 2 
      });
      startX += colWidths[colIndex];
    });
    
    currentY += 8;
  });
  
  // Salvar o PDF
  doc.save(`${fileName}.pdf`);
};
