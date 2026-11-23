import type { AvatarStore } from "@apply-radar/ui";
import type { AvatarSettings } from "@apply-radar/shared";
import { api } from "../services/app-radar-api";
import { getFromStorage, setInStorage } from "./storage";

/** Signed in with Google: the avatar is saved in the account (same as the web app). */
export const accountAvatarStore: AvatarStore = {
  load: () => api.users.getAvatar(),
  save: (avatar) => api.users.setAvatar(avatar),
};

/** "Device only": the avatar stays in chrome.storage. */
export const localAvatarStore: AvatarStore = {
  load: () => getFromStorage<AvatarSettings>("avatar"),
  save: async (avatar) => {
    await setInStorage("avatar", avatar);
    return avatar;
  },
};
