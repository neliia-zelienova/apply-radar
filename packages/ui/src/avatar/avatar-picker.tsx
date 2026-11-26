import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { ANIMAL_ICONS, type AvatarSettings } from "@apply-radar/shared";
import classNames from "classnames";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../dialog";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { useThemeContext } from "../context/theme-context";
import { ANIMAL_ICON_COMPONENTS } from "./animal-icons";
import { UserAvatar } from "./user-avatar";

// The color picker is large: it's fetched when the avatar dialog opens and
// shown only when a color is clicked.
const loadColorPicker = () => import("react-best-gradient-color-picker");
const ColorPicker = lazy(loadColorPicker);

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

/**
 * One color: a tile with the current color in a circle; clicking it opens the
 * full picker in a popover.
 */
const ColorField = ({
  label,
  value,
  onChange,
  solidOnly = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** SVG strokes take a solid color only. */
  solidOnly?: boolean;
}) => {
  const { theme } = useThemeContext();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: change color`}
          className="group flex min-w-0 cursor-pointer items-center gap-2.5 rounded-xl border border-black/10 px-2.5 py-2 text-left transition-colors hover:bg-black/[0.03] focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/25 data-[state=open]:border-teal-500/60 data-[state=open]:bg-teal-500/[0.06] dark:border-white/10 dark:hover:bg-white/[0.04]"
        >
          <span
            aria-hidden
            className="h-7 w-7 shrink-0 rounded-full shadow-inner ring-1 ring-black/10 transition-transform group-hover:scale-105 dark:ring-white/20"
            style={{ background: value }}
          />
          <span className="min-w-0 flex-1 truncate whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-200">
            {label}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-gray-400 max-sm:hidden transition-transform group-data-[state=open]:rotate-90 dark:text-slate-500" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        withArrow={false}
        // Below the tiles, so the preview above stays visible while choosing.
        side="bottom"
        align="start"
        collisionPadding={12}
        // Above the dialog (z-[110]); scrolls if the screen is too short for it.
        style={{ zIndex: 150, maxHeight: "var(--radix-popover-content-available-height)" }}
        className="custom-scroll w-auto overflow-y-auto p-3"
        aria-label={`${label} color`}
      >
        <Suspense
          fallback={
            <div className="flex h-[240px] w-[280px] items-center justify-center text-xs text-gray-400">
              Loading colors…
            </div>
          }
        >
          <ColorPicker
            value={value}
            onChange={onChange}
            width={280}
            height={120}
            hideColorTypeBtns={solidOnly}
            presets={solidOnly ? SWATCHES.filter((s) => !s.startsWith("linear")) : SWATCHES}
            hideEyeDrop
            hideAdvancedSliders
            hideColorGuide
            hideInputType
            disableDarkMode={theme !== "dark"}
            disableLightMode={theme === "dark"}
          />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
};

/** Pick an animal icon, its stroke color and background (solid or gradient). */
export const AvatarPicker = ({
  open,
  onOpenChange,
  value,
  photoUrl,
  onSave,
}: AvatarPickerProps) => {
  const [draft, setDraft] = useState<AvatarSettings>(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start from the saved value each time the dialog opens.
  useEffect(() => {
    if (open) {
      setDraft(value);
      setError(null);
      // Fetch the picker now, so it's ready when a color is clicked.
      void loadColorPicker();
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
            {/* Colors: the current ones; click to change */}
            <div>
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                Colors
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ColorField
                  label="Background"
                  value={draft.background}
                  onChange={(background) => update({ background, source: "icon" })}
                />
                <ColorField
                  label="Icon color"
                  value={draft.color}
                  onChange={(color) => update({ color, source: "icon" })}
                  solidOnly
                />
              </div>
            </div>
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
