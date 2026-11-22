export type Brand<K, T extends string> = K & { readonly __brand: T };

/**
 * Tiny helper to create a branded type at compile time.
 *
 * Usage:
 *   type ApplicationId = Brand<string, 'ApplicationId'>
 *   const id = brand<ApplicationId>('abc')
 */
export const brand = <T>(value: T): T => value;

export {
  ApplicationStatus,
  APPLICATION_STATUSES,
  isApplicationStatus,
  type Application,
  type Interview,
} from "./types/application";
export { getStatusLabel } from "./utils/status";
export {
  toDateInputValue,
  fromDateInputValue,
  getDaysSince,
  formatDaysAgo,
} from "./utils/date";
