import { createContext, useContext } from "react";

/** "Radar effects" preference (background net, sweep, detections). */
export interface RadarEffectsContextType {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const RadarEffectsContext = createContext<RadarEffectsContextType>({
  enabled: true,
  setEnabled: () => {},
});

export const useRadarEffects = () => useContext(RadarEffectsContext);
