
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
 * Format date for display in reinforcement controls and payment schedule
 * Uses MM/YYYY format for cleaner display
 * @param date - Date to format
 * @returns Formatted date string as MM/YYYY
 */
export function formatDateForDisplay(date: Date): string {
  return formatToMonthYear(date);
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
 * Calculate the number of installments between valuation date and delivery date
 * Fixed logic: First installment starts in the month AFTER valuation date (entrada)
 * @param valuationDate - The valuation date (when property was valued)
 * @param deliveryDate - The desired delivery date
 * @returns Number of monthly installments possible
 */
export function calculateInstallmentsFromValuationAndDelivery(valuationDate: Date, deliveryDate: Date): number {
  const valuationYear = valuationDate.getFullYear();
  const valuationMonth = valuationDate.getMonth();
  
  const deliveryYear = deliveryDate.getFullYear();
  const deliveryMonth = deliveryDate.getMonth();
  
  // Calculate total months between valuation date and delivery date
  const totalMonths = (deliveryYear - valuationYear) * 12 + (deliveryMonth - valuationMonth);
  
  // First installment starts in the month AFTER valuation (entrada paid in valuation month)
  // Subtract 1 month for keys payment at delivery
  return Math.max(1, totalMonths - 1);
}

/**
 * Calculate the number of installments between current date and delivery date
 * Fixed logic: First installment starts in the month AFTER current date (entrada)
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
  
  // First installment starts in the month AFTER current date (entrada paid this month)
  // Subtract 1 month for keys payment at delivery
  return Math.max(1, totalMonths - 1);
}

/**
 * Calculate the start date for installments based on valuation date
 * The first installment starts in the month AFTER the valuation date
 * @param valuationDate - The valuation date
 * @returns The start date for the first installment
 */
export function calculateStartDateFromValuation(valuationDate: Date): Date {
  return addMonths(valuationDate, 1);
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
  // Add validation to ensure date is a valid Date object
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('formatToMonthYear received invalid date:', date);
    return '';
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${year}`;
}

/**
 * Check if valuation date is valid (not in future beyond current month)
 * @param valuationDate - The valuation date to check
 * @returns True if valid
 */
export function isValidValuationDate(valuationDate: Date): boolean {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  
  const valuationYear = valuationDate.getFullYear();
  const valuationMonth = valuationDate.getMonth();
  
  // Valuation date cannot be in future beyond current month
  return (valuationYear < currentYear) || 
         (valuationYear === currentYear && valuationMonth <= currentMonth);
}

/**
 * Check if delivery date is valid in relation to valuation date
 * @param valuationDate - The valuation date
 * @param deliveryDate - The delivery date
 * @returns True if delivery date is at least 3 months after valuation date
 */
export function isValidDeliveryDate(valuationDate: Date, deliveryDate: Date): boolean {
  const minDeliveryDate = addMonths(valuationDate, 3); // Minimum 3 months gap
  return deliveryDate >= minDeliveryDate;
}

/**
 * Safely convert date strings back to Date objects for saved simulations
 * @param dateValue - Value that might be a date string or Date object
 * @returns Date object or undefined
 */
export function safeDateConversion(dateValue: any): Date | undefined {
  if (!dateValue) return undefined;
  
  if (dateValue instanceof Date) return dateValue;
  
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  
  return undefined;
}
