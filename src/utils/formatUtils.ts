
/**
 * Formats a number to Brazilian currency format (1.000,00)
 */
export const formatToBrazilianNumber = (value: number | string): string => {
  // Convert to string and ensure it's a valid number
  let valueStr = typeof value === 'string' ? value : value.toString();
  
  // Remove non-numeric characters except decimal separator
  valueStr = valueStr.replace(/[^\d.,]/g, '');
  
  // Convert all decimal separators to dots for calculation
  valueStr = valueStr.replace(',', '.');
  
  // Parse as float and handle NaN
  const numValue = parseFloat(valueStr);
  if (isNaN(numValue)) return '0,00';
  
  // Format with Brazilian number format (using . for thousands and , for decimals)
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

/**
 * Parse a Brazilian formatted number to a regular float
 */
export const parseBrazilianNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remove non-numeric characters except decimal and thousands separators
  const cleanValue = value.replace(/[^\d.,]/g, '');
  
  // Replace dots with empty string (remove thousand separators) and commas with dots
  const convertedValue = cleanValue.replace(/\./g, '').replace(',', '.');
  
  return parseFloat(convertedValue) || 0;
};
