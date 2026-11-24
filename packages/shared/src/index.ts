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
export {
  capturePageSnapshot,
  PAGE_TEXT_LIMIT,
  type PageSnapshot,
} from "./job-posting/page-snapshot";
export {
  ADDED_FROM_LINK_NOTE,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  applicationDraftFrom,
  buildImportNotes,
  draftFromJsonLd,
  draftFromSnapshot,
  draftFromText,
  draftFromTitle,
  jobLinkFrom,
  mergeDrafts,
  type EmploymentType,
  type JobPostingDraft,
  type WorkMode,
} from "./job-posting/job-posting";
export {
  importFromSnapshot,
  linkOnlyImport,
  type ApplicationDraft,
  type PageImport,
  type ParsePage,
} from "./job-posting/import";
