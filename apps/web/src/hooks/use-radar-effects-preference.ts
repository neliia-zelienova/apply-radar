import { useCallback, useState } from "react";
import type { RadarEffectsContextType } from "@apply-radar/ui";

const STORAGE_KEY = "apply-radar-radar-effects";

const read = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

/** Radar background on/off for this browser (default on). */
export const useRadarEffectsPreference = (): RadarEffectsContextType => {
  const [enabled, setState] = useState<boolean>(read);
  const setEnabled = useCallback((value: boolean) => {
    setState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "on" : "off");
    } catch {
      // not persisted; fine
    }
  }, []);
  return { enabled, setEnabled };
};
