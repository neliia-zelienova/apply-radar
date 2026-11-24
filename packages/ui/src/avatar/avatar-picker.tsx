import { lazy, Suspense, useEffect, useState } from "react";
import { ANIMAL_ICONS, type AvatarSettings } from "@apply-radar/shared";
import classNames from "classnames";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog";
import { Button } from "../button";
import { useThemeContext } from "../context/theme-context";
import { ANIMAL_ICON_COMPONENTS } from "./animal-icons";
import { UserAvatar } from "./user-avatar";

// The color picker is large; load it only when the avatar dialog is opened.
const ColorPicker = lazy(() => import("react-best-gradient-color-picker"));

type ColorTab = "color" | "background";

const SWATCHES = [
  "rgba(255,255,255,1)",
  "rgba(15,23,42,1)",
  "rgba(13,148,136,1)",
  "rgba(79,70,229,1)",
  "rgba(217,119,6,1)",
  "rgba(219,39,119,1)",
  "rgba(220,38,38,1)",
  "rgba(22,163,74,1)",
  "linear-gradient(135deg, rgba(13,148,136,1) 0%, rgba(45,212,191,1) 100%)",
  "linear-gradient(135deg, rgba(79,70,229,1) 0%, rgba(129,140,248,1) 100%)",
  "linear-gradient(135deg, rgba(217,119,6,1) 0%, rgba(251,191,36,1) 100%)",
  "linear-gradient(135deg, rgba(219,39,119,1) 0%, rgba(244,114,182,1) 100%)",
];

export interface AvatarPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: AvatarSettings;
  /** Google photo, if any — enables the "Use Google photo" option. */
  photoUrl?: string;
  onSave: (avatar: AvatarSettings) => Promise<void> | void;
}

/** Pick an animal icon, its stroke color and background (solid or gradient). */
export const AvatarPicker = ({
  open,
  onOpenChange,
  value,
  photoUrl,
  onSave,
}: AvatarPickerProps) => {
  const { theme } = useThemeContext();
  const [draft, setDraft] = useState<AvatarSettings>(value);
  const [tab, setTab] = useState<ColorTab>("background");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start from the saved value each time the dialog opens.
  useEffect(() => {
    if (open) {
      setDraft(value);
      setError(null);
    }
  }, [open, value]);

  const update = (patch: Partial<AvatarSettings>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      onOpenChange(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const usingPhoto = draft.source === "google" && !!photoUrl;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your avatar</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-left">
          {/* Preview + source */}
          <div className="flex items-center gap-4">
            <UserAvatar avatar={draft} photoUrl={photoUrl} size={64} />
            <div className="flex flex-col gap-1.5 text-sm">
              {photoUrl ? (
                <>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="avatar-source"
                      checked={draft.source === "google"}
                      onChange={() => update({ source: "google" })}
                    />
                    Google photo
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="avatar-source"
                      checked={draft.source === "icon"}
                      onChange={() => update({ source: "icon" })}
                    />
                    Animal icon
                  </label>
                </>
              ) : (
                <span className="text-gray-500 dark:text-slate-400">
                  Pick an animal and colors.
                </span>
              )}
            </div>
          </div>

          <div className={classNames("flex flex-col gap-4", usingPhoto && "pointer-events-none opacity-40")}>
            {/* Icons */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                Animal
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {ANIMAL_ICONS.map((name) => {
                  const Icon = ANIMAL_ICON_COMPONENTS[name];
                  const selected = draft.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      aria-label={name}
                      aria-pressed={selected}
                      onClick={() => update({ icon: name, source: "icon" })}
                      className={classNames(
                        "flex h-10 cursor-pointer items-center justify-center rounded-lg border transition-colors",
                        selected
                          ? "border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-300"
                          : "border-black/10 text-gray-600 hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <div className="mb-2 flex gap-1 rounded-full bg-black/5 p-1 text-xs font-semibold dark:bg-white/5">
                {(["background", "color"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={classNames(
                      "flex-1 cursor-pointer rounded-full px-2 py-1.5 transition-colors",
                      tab === t
                        ? "bg-white text-gray-900 shadow-sm dark:bg-[#1e293b] dark:text-slate-100"
                        : "text-gray-500 dark:text-slate-400",
                    )}
                  >
                    {t === "background" ? "Background" : "Icon color"}
                  </button>
                ))}
              </div>
              <div className="flex min-h-[260px] justify-center">
                <Suspense
                  fallback={
                    <span className="self-center text-xs text-gray-400">Loading colors…</span>
                  }
                >
                  {tab === "background" ? (
                    <ColorPicker
                      key="background"
                      value={draft.background}
                      onChange={(background) => update({ background, source: "icon" })}
                      width={300}
                      height={150}
                      presets={SWATCHES}
                      hideEyeDrop
                      hideAdvancedSliders
                      hideColorGuide
                      hideInputType
                      disableDarkMode={theme !== "dark"}
                      disableLightMode={theme === "dark"}
                    />
                  ) : (
                    <ColorPicker
                      key="color"
                      value={draft.color}
                      onChange={(color) => update({ color, source: "icon" })}
                      width={300}
                      height={150}
                      // SVG strokes take a solid color only.
                      hideColorTypeBtns
                      presets={SWATCHES.filter((s) => !s.startsWith("linear"))}
                      hideEyeDrop
                      hideAdvancedSliders
                      hideColorGuide
                      hideInputType
                      disableDarkMode={theme !== "dark"}
                      disableLightMode={theme === "dark"}
                    />
                  )}
                </Suspense>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">Couldn't save: {error}</p>}
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
