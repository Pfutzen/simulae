
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

/**
 * Formats user input as a Brazilian number, preserving cursor position
 * @param inputValue The current text value in the input field
 * @param currentCursorPosition The current cursor position
 * @param newChar The new character being added (or null if deleting)
 * @returns Object with formatted value and new cursor position
 */
export const formatNumberWithCursor = (
  inputValue: string,
  currentCursorPosition: number,
  newChar: string | null
): { formattedValue: string; cursorPosition: number } => {
  // Remove all formatting characters first to work with raw numbers
  let cleanValue = inputValue.replace(/\D/g, '');
  
  // If the clean value is empty, return zero
  if (!cleanValue) {
    return { formattedValue: '0,00', cursorPosition: 1 };
  }
  
  // Always treat the last two digits as decimal places
  if (cleanValue.length === 1) {
    cleanValue = '00' + cleanValue;
  } else if (cleanValue.length === 2) {
    cleanValue = '0' + cleanValue;
  }
  
  // Insert decimal separator
  const decimalPosition = cleanValue.length - 2;
  const integerPart = cleanValue.substring(0, decimalPosition);
  const decimalPart = cleanValue.substring(decimalPosition);
  
  // Format the integer part with thousands separators
  let formattedInteger = '';
  for (let i = 0; i < integerPart.length; i++) {
    if (i > 0 && (integerPart.length - i) % 3 === 0) {
      formattedInteger += '.';
    }
    formattedInteger += integerPart.charAt(i);
  }
  
  // Combine parts with decimal separator
  const formattedValue = formattedInteger + ',' + decimalPart;
  
  // Calculate new cursor position - improved logic to ensure cursor stays in integer part
  let newCursorPosition;
  
  if (newChar !== null) {
    // For additions, we need to count how many thousand separators are before the cursor
    const beforeCursorClean = cleanValue.substring(0, currentCursorPosition);
    const thousandSepCount = Math.floor((beforeCursorClean.length - 1) / 3);
    
    // Adjust cursor position based on separators
    newCursorPosition = currentCursorPosition + thousandSepCount;
    
    // Make sure the cursor doesn't go past the decimal separator
    if (newCursorPosition > formattedInteger.length) {
      newCursorPosition = formattedInteger.length;
    }
  } else {
    // For deletions or other operations, maintain cursor relative position
    newCursorPosition = Math.min(currentCursorPosition, formattedValue.length - 3);
  }
  
  return { formattedValue, cursorPosition: newCursorPosition };
};
