import { format, differenceInDays, addDays, startOfWeek, endOfWeek, parseISO } from "date-fns";

/**
 * Format a date for display
 */
export function formatDisplayDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Format a date for input fields (YYYY-MM-DD)
 */
export function formatDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get the number of nights between two dates
 */
export function getNights(start: Date | string, end: Date | string): number {
  const s = typeof start === "string" ? parseISO(start) : start;
  const e = typeof end === "string" ? parseISO(end) : end;
  return differenceInDays(e, s);
}

/**
 * Get date range for a week starting from a given date
 */
export function getWeekRange(startDate: Date): { start: Date; end: Date } {
  return {
    start: startOfWeek(startDate, { weekStartsOn: 1 }),
    end: endOfWeek(startDate, { weekStartsOn: 1 }),
  };
}

/**
 * Generate an array of dates between start and end
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  let current = start;
  while (current <= end) {
    dates.push(current);
    current = addDays(current, 1);
  }
  return dates;
}

/**
 * Check if a date is within a range
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}
