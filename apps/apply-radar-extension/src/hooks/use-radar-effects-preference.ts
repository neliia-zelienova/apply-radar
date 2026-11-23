import { useCallback, useEffect, useState } from "react";
import type { RadarEffectsContextType } from "@apply-radar/ui";
import { getFromStorage, setInStorage } from "../utils/storage";

const STORAGE_KEY = "radarEffects";

/** Radar background on/off, saved in chrome.storage (default on). */
export const useRadarEffectsPreference = (): RadarEffectsContextType => {
  const [enabled, setState] = useState(true);

  useEffect(() => {
    getFromStorage<boolean>(STORAGE_KEY)
      .then((stored) => {
        if (stored === false) setState(false);
      })
      .catch(() => {});
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setState(value);
    void setInStorage(STORAGE_KEY, value).catch(() => {});
  }, []);

  return { enabled, setEnabled };
};
