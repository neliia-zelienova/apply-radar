import { useCallback, useEffect, useState } from "react";
import { normalizeAvatar, type AvatarSettings } from "@apply-radar/shared";

/** Where avatar settings are kept (the account via the API, or local storage). */
export interface AvatarStore {
  load(): Promise<AvatarSettings | null>;
  save(avatar: AvatarSettings): Promise<AvatarSettings>;
}

/**
 * Current avatar settings. Until something is saved, a random-but-stable
 * default (from `seed`, e.g. the user id) is shown.
 */
export const useAvatarSettings = ({
  seed,
  store,
}: {
  seed: string;
  store: AvatarStore | null;
}) => {
  const [stored, setStored] = useState<AvatarSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStored(null);
    store
      ?.load()
      .then((value) => {
        if (!cancelled) setStored(value);
      })
      .catch(() => {
        // Keep the default; the avatar isn't worth an error banner.
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const saveAvatar = useCallback(
    async (avatar: AvatarSettings) => {
      if (!store) return;
      setStored(await store.save(avatar));
    },
    [store],
  );

  return { avatar: normalizeAvatar(stored, seed), saveAvatar };
};
