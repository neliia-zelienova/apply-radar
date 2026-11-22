/** Local calendar date as `YYYY-MM-DD`, the value format of `<input type="date">`. */
export const toDateInputValue = (date: string | Date): string =>
  new Date(date).toLocaleDateString("en-CA");

/**
 * Converts a `YYYY-MM-DD` input value back to an ISO string.
 * If the day is unchanged from `original`, `original` is returned as-is so its time of day is kept.
 */
export const fromDateInputValue = (value: string, original?: string): string => {
  if (original && toDateInputValue(original) === value) return original;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toISOString();
};

/** Whole local calendar days from `date` to today (0 for today or a future date). */
export const getDaysSince = (date: string): number => {
  const then = new Date(date);
  const now = new Date();
  const startOfThen = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // Math.round absorbs the ±1h of a DST switch between the two midnights.
  return Math.max(
    0,
    Math.round((startOfToday.getTime() - startOfThen.getTime()) / 86_400_000),
  );
};

/** "Today", "1 day ago", "12 days ago" — counted in local calendar days. */
export const formatDaysAgo = (date: string): string => {
  const days = getDaysSince(date);
  if (days === 0) return "Today";
  return days === 1 ? "1 day ago" : `${days} days ago`;
};
