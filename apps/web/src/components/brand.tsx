import { RadarLogo } from "@apply-radar/ui";

/** Radar logo + name, matching the extension header. */
export const Brand = ({ size = "md" }: { size?: "md" | "lg" }) => {
  const box = size === "lg" ? 52 : 36;
  return (
    <div className="flex items-center gap-3">
      <RadarLogo size={box} />
      <div className="text-left">
        <div
          className={`font-bold tracking-tight text-gray-900 dark:text-slate-100 ${
            size === "lg" ? "text-2xl" : "text-lg"
          }`}
        >
          Apply Radar
        </div>
        <div className="text-xs text-teal-700 dark:text-teal-300/75">
          Every application. Always on radar.
        </div>
      </div>
    </div>
  );
};
