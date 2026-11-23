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
export {
  createApiClient,
  ApiError,
  fromApiApplication,
  fromApiInterview,
  type ApiClient,
  type ApiClientOptions,
  type ApplicationInput,
  type InterviewInput,
  type TokenStore,
} from "./api/client";
export {
  createRemoteRepository,
  filterAndSortApplications,
  type ApplicationsRepository,
  type ApplicationQuery,
  type ApplicationSortField,
} from "./applications/repository";
export {
  uploadApplications,
  type UploadFailure,
  type UploadResult,
} from "./applications/upload";
export { decodeAccessToken, type AccessTokenClaims } from "./utils/jwt";
export {
  ANIMAL_ICONS,
  defaultAvatar,
  isAnimalIcon,
  normalizeAvatar,
  type AnimalIconName,
  type AvatarSettings,
} from "./types/avatar";
