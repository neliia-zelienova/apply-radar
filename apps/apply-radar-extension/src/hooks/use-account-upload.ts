import { useCallback, useEffect, useRef, useState } from "react";
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
  // The account signed in right now (empty when signed out).
  const activeUserRef = useRef(enabled ? userId : "");
  activeUserRef.current = enabled ? userId : "";

  useEffect(() => {
    // Progress/results of another account's batch don't belong on screen.
    setState({ status: "idle" });
  }, [enabled, userId]);

  const run = useCallback(async () => {
    if (!enabled || !userId) return;
    // The API client is shared, so after a switch further creates would land
    // in the new account: stop the batch as soon as this one isn't active.
    const stillActive = () => activeUserRef.current === userId;
    const local = await readLocalApplications();
    const record = (await getFromStorage<UploadedRecord>(UPLOADED_KEY)) ?? {};
    const alreadyUploaded = new Set(record[userId] ?? []);
    const pending = local.filter((app) => !alreadyUploaded.has(app.id));
    if (pending.length === 0) return;

    if (!stillActive()) return;
    setState({ status: "uploading", done: 0, total: pending.length });
    const result = await uploadApplications(
      api,
      pending,
      (done, total) => {
        if (stillActive()) setState({ status: "uploading", done, total });
      },
      stillActive,
    );

    // Re-read: another account's batch may have written its markers meanwhile.
    const latest = (await getFromStorage<UploadedRecord>(UPLOADED_KEY)) ?? {};
    await setInStorage<UploadedRecord>(UPLOADED_KEY, {
      ...latest,
      [userId]: [...new Set([...(latest[userId] ?? []), ...result.uploaded])],
    });
    if (!stillActive()) return;
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
