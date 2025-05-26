
import { PaymentType } from './types';
import { formatCurrency } from './formatters';
import { formatDateForDisplay } from './dateUtils';

export const exportScheduleToCSV = (schedule: PaymentType[], fileName: string = 'cronograma-pagamentos') => {
  // Cabeçalhos do CSV
  const headers = [
    'Data do Pagamento',
    'Tipo',
    'Valor',
    'Saldo',
    'Total Pago',
    'Valor Corrigido do Imóvel'
  ];

  // Converter dados para CSV
  const csvData = schedule.map(payment => [
    payment.date ? formatDateForDisplay(payment.date) : '-',
    payment.description,
    formatCurrency(payment.amount),
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
