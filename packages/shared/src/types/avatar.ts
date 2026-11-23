/** How the user is shown in the apps; saved in the account (or locally for "device only"). */
export interface AvatarSettings {
  /** "google": the Google photo when there is one (falls back to the icon). */
  source: "google" | "icon";
  /** Lucide animal icon name, see ANIMAL_ICONS. */
  icon: string;
  /** Icon stroke color (solid CSS color). */
  color: string;
  /** Background: CSS color or gradient. */
  background: string;
}

/** Lucide icons that are animals (names as exported by lucide-react). */
export const ANIMAL_ICONS = [
  "Bird",
  "Bug",
  "Cat",
  "Dog",
  "Fish",
  "Panda",
  "Rabbit",
  "Rat",
  "Shrimp",
  "Snail",
  "Squirrel",
  "Turtle",
  "Worm",
] as const;

export type AnimalIconName = (typeof ANIMAL_ICONS)[number];

export const isAnimalIcon = (name: string): name is AnimalIconName =>
  (ANIMAL_ICONS as readonly string[]).includes(name);

/** Pleasant background/stroke pairs for the default avatar. */
const DEFAULT_PALETTES: ReadonlyArray<{ background: string; color: string }> = [
  { background: "linear-gradient(135deg, rgba(13,148,136,1) 0%, rgba(45,212,191,1) 100%)", color: "rgba(255,255,255,1)" },
  { background: "linear-gradient(135deg, rgba(79,70,229,1) 0%, rgba(129,140,248,1) 100%)", color: "rgba(255,255,255,1)" },
  { background: "linear-gradient(135deg, rgba(217,119,6,1) 0%, rgba(251,191,36,1) 100%)", color: "rgba(255,255,255,1)" },
  { background: "linear-gradient(135deg, rgba(219,39,119,1) 0%, rgba(244,114,182,1) 100%)", color: "rgba(255,255,255,1)" },
  { background: "rgba(204,251,241,1)", color: "rgba(15,118,110,1)" },
  { background: "rgba(254,243,199,1)", color: "rgba(180,83,9,1)" },
];

/** Small stable hash, so the "random" default is the same on every device. */
const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/**
 * Default avatar before the user picks one: Google photo when available,
 * otherwise a random-but-stable animal (derived from `seed`, e.g. the user id).
 */
export const defaultAvatar = (seed: string): AvatarSettings => {
  const h = hash(seed || "apply-radar");
  const palette = DEFAULT_PALETTES[h % DEFAULT_PALETTES.length];
  return {
    source: "google",
    icon: ANIMAL_ICONS[(h >>> 8) % ANIMAL_ICONS.length],
    ...palette,
  };
};

/** Fills gaps/unknown values in stored settings with the defaults. */
export const normalizeAvatar = (
  value: Partial<AvatarSettings> | null | undefined,
  seed: string,
): AvatarSettings => {
  const fallback = defaultAvatar(seed);
  if (!value) return fallback;
  return {
    source: value.source === "icon" ? "icon" : "google",
    icon: value.icon && isAnimalIcon(value.icon) ? value.icon : fallback.icon,
    color: value.color || fallback.color,
    background: value.background || fallback.background,
  };
};
