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
 * @returns Object with formatted value, new cursor position, and numeric value
 */
export const formatNumberWithCursor = (
  inputValue: string,
  currentCursorPosition: number
): { formattedValue: string; cursorPosition: number; numericValue: number } => {
  // Keep track of the original input to calculate proper cursor position later
  const originalInput = inputValue;
  
  // Handle decimal separator input (convert . to ,)
  inputValue = inputValue.replace(/\./g, ',');
  
  // Store if cursor is before or after decimal separator
  const parts = inputValue.split(',');
  const cursorInIntegerPart = parts.length === 1 || 
    (parts.length > 1 && currentCursorPosition <= parts[0].length);
  
  // Calculate position relative to decimal point
  const positionBeforeDecimal = parts.length > 1 && currentCursorPosition <= parts[0].length 
    ? currentCursorPosition 
    : parts[0].length;
  
  // Save integer part's digits before any formatting
  const originalDigitsBeforeCursor = parts[0]
    .replace(/\D/g, '')
    .substring(0, positionBeforeDecimal);
  
  // If there's a comma in the input, we need special handling
  if (inputValue.includes(',')) {
    if (parts.length > 2) {
      // Keep only the first comma
      inputValue = parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Ensure we have exactly 2 digits after the comma
    if (parts.length === 2) {
      const decimalPart = parts[1].replace(/\D/g, '');
      if (decimalPart.length > 2) {
        parts[1] = decimalPart.substring(0, 2);
        inputValue = parts.join(',');
      }
    }
  }
  
  // Remove all formatting characters to work with raw numbers
  let cleanValue = inputValue.replace(/\D/g, '');
  
  // If the clean value is empty, return zero
  if (!cleanValue) {
    return { formattedValue: '0,00', cursorPosition: 1, numericValue: 0 };
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
  
  // Calculate numeric value
  const numericValue = parseBrazilianNumber(formattedValue);
  
  // Calculate new cursor position based on formatting changes
  let newCursorPosition;
  
  if (cursorInIntegerPart) {
    // Count how many thousand separators were added before the cursor
    const formattedDigitsSoFar = formattedInteger.replace(/\./g, '');
    const originalDigitsCount = originalDigitsBeforeCursor.length;
    
    // Find position in formatted value that contains the same number of digits
    let digitCount = 0;
    let newPos = 0;
    
    for (let i = 0; i < formattedInteger.length; i++) {
      if (/\d/.test(formattedInteger[i])) {
        digitCount++;
      }
      if (digitCount === originalDigitsCount) {
        newPos = i + 1; // +1 because we want the position after this digit
        break;
      }
    }
    
    newCursorPosition = newPos;
  } else {
    // If cursor is in decimal part, adjust based on decimal point position
    newCursorPosition = formattedInteger.length + 1 + (currentCursorPosition - parts[0].length - 1);
    
    // Make sure we don't exceed the length of the formatted value
    newCursorPosition = Math.min(newCursorPosition, formattedValue.length);
  }
  
  return { formattedValue, cursorPosition: newCursorPosition, numericValue };
};
