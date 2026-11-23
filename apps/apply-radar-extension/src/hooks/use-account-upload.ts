import { useCallback, useEffect, useState } from "react";
import { uploadApplications, type UploadFailure } from "@apply-radar/shared";
import { api } from "../services/app-radar-api";
import { readLocalApplications } from "../utils/local-repository";
import { getFromStorage, setInStorage } from "../utils/storage";

/** Per account: ids of local applications already uploaded. */
const UPLOADED_KEY = "applications_uploaded_to_account";
type UploadedRecord = Record<string, string[]>;

export type AccountUploadState =
  | { status: "idle" }
  | { status: "uploading"; done: number; total: number }
  | { status: "done"; uploaded: number }
  | { status: "partial"; uploaded: number; failed: UploadFailure[] };

/**
 * After a Google sign-in, uploads applications saved on this device ("device
 * only" mode) to the account — once per application. Local data is never
 * changed or deleted. Failures are reported and can be retried.
 */
export const useAccountUpload = ({
  enabled,
  userId,
  onUploaded,
}: {
  enabled: boolean;
  userId: string;
  onUploaded: () => void;
}) => {
  const [state, setState] = useState<AccountUploadState>({ status: "idle" });

  const run = useCallback(async () => {
    if (!enabled || !userId) return;
    const local = await readLocalApplications();
    const record = (await getFromStorage<UploadedRecord>(UPLOADED_KEY)) ?? {};
    const alreadyUploaded = new Set(record[userId] ?? []);
    const pending = local.filter((app) => !alreadyUploaded.has(app.id));
    if (pending.length === 0) return;

    setState({ status: "uploading", done: 0, total: pending.length });
    const result = await uploadApplications(api, pending, (done, total) =>
      setState({ status: "uploading", done, total }),
    );

    await setInStorage<UploadedRecord>(UPLOADED_KEY, {
      ...record,
      [userId]: [...alreadyUploaded, ...result.uploaded],
    });
    setState(
      result.failed.length > 0
        ? { status: "partial", uploaded: result.uploaded.length, failed: result.failed }
        : { status: "done", uploaded: result.uploaded.length },
    );
    if (result.uploaded.length > 0) onUploaded();
  }, [enabled, userId, onUploaded]);

  useEffect(() => {
    void run();
  }, [run]);

  return {
    state,
    retry: run,
    dismiss: useCallback(() => setState({ status: "idle" }), []),
  };
};
