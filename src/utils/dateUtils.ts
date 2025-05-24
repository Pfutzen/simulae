
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
  date.setHours(0, 0, 0, 0);
  return date < today;
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
