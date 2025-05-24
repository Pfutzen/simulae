
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
 * @param newChar Optional new character that was added (used for cursor positioning)
 * @param isSelection Whether the text was selected before input
 * @returns Object with formatted value, new cursor position, and numeric value
 */
export const formatNumberWithCursor = (
  inputValue: string,
  currentCursorPosition: number,
  newChar?: string | null,
  isSelection?: boolean
): { formattedValue: string; cursorPosition: number; numericValue: number } => {
  // Handle case where all text was selected and user started typing a new number
  if (isSelection && newChar && /\d/.test(newChar)) {
    // If it was a selection and the user typed a digit, we should replace everything with just that digit
    inputValue = newChar;
    currentCursorPosition = 1;
  }
  
  // Remove all non-numeric characters except commas and periods
  const cleanedValue = inputValue.replace(/[^\d.,]/g, '');
  
  // If the value is empty, return a default
  if (!cleanedValue) {
    return { formattedValue: '0,00', cursorPosition: 1, numericValue: 0 };
  }

  // Track the number of digits before the cursor in the cleaned input
  let digitsBeforeCursor = 0;
  for (let i = 0; i < Math.min(currentCursorPosition, cleanedValue.length); i++) {
    if (/\d/.test(cleanedValue[i])) {
      digitsBeforeCursor++;
    }
  }

  // Parse as number and format
  const numericValue = parseBrazilianNumber(cleanedValue);
  const formattedValue = formatToBrazilianNumber(numericValue);
  
  // Count digits and separators in the formatted value to determine new cursor position
  let newPosition = 0;
  let digitCount = 0;
  for (let i = 0; i < formattedValue.length; i++) {
    if (/\d/.test(formattedValue[i])) {
      digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newPosition = i + 1;
        break;
      }
    }
  }

  // If we didn't find the position, put cursor at the end of integer part
  if (newPosition === 0 && digitsBeforeCursor > 0) {
    newPosition = formattedValue.indexOf(',');
    if (newPosition === -1) {
      newPosition = formattedValue.length;
    }
  }

  return {
    formattedValue,
    cursorPosition: newPosition,
    numericValue
  };
};

/**
 * Formats a number as currency with R$ prefix
 */
export const formatCurrency = (value: number): string => {
  return `R$ ${formatToBrazilianNumber(value)}`;
};

/**
 * Formats a number as percentage
 */
export const formatPercentage = (value: number): string => {
  return `${formatToBrazilianNumber(value)}%`;
};
