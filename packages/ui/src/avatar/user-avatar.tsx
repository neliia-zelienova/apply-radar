import { useEffect, useState } from "react";
import { isAnimalIcon, type AvatarSettings } from "@apply-radar/shared";
import { ANIMAL_ICON_COMPONENTS } from "./animal-icons";

export interface UserAvatarProps {
  avatar: AvatarSettings;
  /** Google profile photo, if the account has one. */
  photoUrl?: string;
  /** Diameter in px. */
  size?: number;
  /** Accessible label, e.g. the user's name. */
  label?: string;
}

/**
 * The user's avatar: the Google photo when chosen and available (falls back if
 * it fails to load), otherwise the chosen animal icon on its background.
 */
export const UserAvatar = ({
  avatar,
  photoUrl,
  size = 28,
  label = "Your avatar",
}: UserAvatarProps) => {
  const [photoFailed, setPhotoFailed] = useState(false);
  useEffect(() => setPhotoFailed(false), [photoUrl]);
  const showPhoto = avatar.source === "google" && !!photoUrl && !photoFailed;

  if (showPhoto) {
    return (
      <img
        src={photoUrl}
        alt={label}
        referrerPolicy="no-referrer"
        onError={() => setPhotoFailed(true)}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  const Icon = ANIMAL_ICON_COMPONENTS[isAnimalIcon(avatar.icon) ? avatar.icon : "Cat"];
  return (
    <span
      role="img"
      aria-label={label}
      className="inline-flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size, background: avatar.background }}
    >
      <Icon
        aria-hidden
        style={{ width: size * 0.58, height: size * 0.58, color: avatar.color }}
        strokeWidth={2}
      />
    </span>
  );
};
