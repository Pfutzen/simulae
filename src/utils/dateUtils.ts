
/**
 * Utility functions for date manipulation in the simulation
 */

/**
 * Add months to a date while maintaining the same day of the month
 * @param date - The starting date
 * @param months - Number of months to add
 * @returns New date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();
  
  result.setMonth(result.getMonth() + months);
  
  // Handle cases where the target month has fewer days than the original day
  if (result.getDate() !== originalDay) {
    // Set to the last day of the target month
    result.setDate(0);
  }
  
  return result;
}

/**
 * Subtract months from a date while maintaining the same day of the month
 * @param date - The starting date
 * @param months - Number of months to subtract
 * @returns New date with months subtracted
 */
export function subtractMonths(date: Date, months: number): Date {
  return addMonths(date, -months);
}

/**
 * Format date to Brazilian format (dd/MM/yyyy)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Generate an array of monthly dates starting from a given date
 * @param startDate - The starting date
 * @param count - Number of monthly dates to generate
 * @returns Array of dates
 */
export function generateMonthlyDates(startDate: Date, count: number): Date[] {
  const dates: Date[] = [];
  
  for (let i = 0; i < count; i++) {
    dates.push(addMonths(startDate, i));
  }
  
  return dates;
}

/**
 * Check if a date is in the past (before today)
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Format date for display in reinforcement controls
 * @param date - Date to format
 * @returns Formatted date string with month name
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Calculate if start date would be in the past based on delivery date and installments
 * @param deliveryDate - The desired delivery date
 * @param installmentsCount - Number of installments
 * @returns True if the calculated start date would be in the past
 */
export function wouldStartDateBeInPast(deliveryDate: Date, installmentsCount: number): boolean {
  const calculatedStartDate = subtractMonths(deliveryDate, installmentsCount + 1);
  return isDateInPast(calculatedStartDate);
}

/**
 * Calculate the number of installments between current date and delivery date
 * @param deliveryDate - The desired delivery date
 * @returns Number of monthly installments possible
 */
export function calculateInstallmentsFromDeliveryDate(deliveryDate: Date): number {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const deliveryYear = deliveryDate.getFullYear();
  const deliveryMonth = deliveryDate.getMonth();
  
  // Calculate total months between current date and delivery date
  const totalMonths = (deliveryYear - currentYear) * 12 + (deliveryMonth - currentMonth);
  
  // Subtract 1 month for keys payment, ensuring minimum of 1 installment
  return Math.max(1, totalMonths - 1);
}

/**
 * Parse month/year string (MM/AAAA) to Date object
 * @param monthYear - String in format MM/AAAA
 * @returns Date object or null if invalid
 */
export function parseMonthYear(monthYear: string): Date | null {
  if (!monthYear || monthYear.length !== 7) return null;
  
  const parts = monthYear.split('/');
  if (parts.length !== 2) return null;
  
  const month = parseInt(parts[0], 10);
  const year = parseInt(parts[1], 10);
  
  // Validate month (1-12) and year (current year or later)
  const currentYear = new Date().getFullYear();
  if (month < 1 || month > 12 || year < currentYear) return null;
  
  // Create date object (day 1 of the month)
  return new Date(year, month - 1, 1);
}

/**
 * Format date to MM/AAAA string
 * @param date - Date to format
 * @returns String in MM/AAAA format
 */
export function formatToMonthYear(date: Date): string {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}
