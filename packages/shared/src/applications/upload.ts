import type { Application } from "../types/application";
import type { ApiClient, ApplicationInput } from "../api/client";

export interface UploadFailure {
  id: string;
  name: string;
  error: string;
}

export interface UploadResult {
  /** Local ids that are now stored in the account. */
  uploaded: string[];
  failed: UploadFailure[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Keeps a local id only if the API will accept it (UUID); otherwise the API assigns one. */
const withValidIds = ({ id, interviews, ...rest }: Application): ApplicationInput => ({
  ...rest,
  ...(UUID.test(id) && { id }),
  interviews: interviews?.map(({ id: interviewId, ...interview }) => ({
    ...interview,
    ...(UUID.test(interviewId) && { id: interviewId }),
  })),
});

/**
 * Uploads applications created on this device to the signed-in account, one by
 * one, keeping their ids so a retry updates instead of duplicating.
 * Never throws for a single item: failures are collected and returned.
 * The caller's local data is not modified.
 */
export const uploadApplications = async (
  api: Pick<ApiClient, "applications">,
  applications: Application[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult> => {
  const result: UploadResult = { uploaded: [], failed: [] };
  let done = 0;

  for (const app of applications) {
    try {
      await api.applications.create(withValidIds(app));
      result.uploaded.push(app.id);
    } catch (error) {
      result.failed.push({
        id: app.id,
        name: app.name || "(no name)",
        error: error instanceof Error ? error.message : String(error),
      });
    }
    onProgress?.(++done, applications.length);
  }

  return result;
};
