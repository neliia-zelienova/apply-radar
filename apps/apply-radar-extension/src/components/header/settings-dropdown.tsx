import { useState } from "react";
import { Settings, LogIn, LogOut, Trash2, Sun, Moon, Palette, Radar } from "lucide-react";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AvatarPicker,
  UserAvatar,
  useAvatarSettings,
  useRadarEffects,
  useThemeContext,
} from "@apply-radar/ui";
import { useAuthContext } from "../../context/auth-context";
import { api } from "../../services/app-radar-api";
import { accountAvatarStore, localAvatarStore } from "../../utils/avatar-stores";

/** Menu rows: dark text on the light menu, light text on the dark one. */
const MENU_ITEM =
  "flex items-center gap-2 outline-none p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-teal-500/10 dark:text-stone-50 dark:hover:bg-teal-500/20";

export const SettingsDropdown = () => {
  const { authType, userId, name, picture, signInWithGoogle, signOut } =
    useAuthContext();
  const { theme, toggleTheme } = useThemeContext();
  const radarEffects = useRadarEffects();
  const isGoogleAuth = authType === "google";
  const [pickerOpen, setPickerOpen] = useState(false);
  const { avatar, saveAvatar } = useAvatarSettings({
    seed: userId || "device",
    store: isGoogleAuth ? accountAvatarStore : authType === "local" ? localAvatarStore : null,
  });

  const handleDeleteMyData = async () => {
    try {
      await api.deleteAccount();
    } catch (error) {
      console.error("Failed to delete account data:", error);
      return;
    }
    await signOut();
  };

  return (
    <>
      <AvatarPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={avatar}
        photoUrl={isGoogleAuth ? picture : undefined}
        onSave={saveAvatar}
      />
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button
            aria-label={authType ? "Account and settings" : "Settings"}
            // Light or dark with the theme (styles.css); round like the other header buttons.
            className="header-icon-button"
            style={{ padding: authType ? "2px" : "8px" }}
          >
            {authType ? (
              <UserAvatar
                avatar={avatar}
                photoUrl={isGoogleAuth ? picture : undefined}
                size={30}
                label={name || "Your avatar"}
              />
            ) : (
              <Settings className="h-[18px] w-[18px]" style={{ strokeWidth: 1.8 }} />
            )}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="min-w-[180px] z-50 rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#0f1829] dark:shadow-black/40"
        >
          {authType && (
            <DropdownMenuItem
              className={MENU_ITEM}
              onSelect={() => setPickerOpen(true)}
            >
              <Palette className="h-4 w-4" />
              Change avatar
            </DropdownMenuItem>
          )}
          {!isGoogleAuth && (
            <DropdownMenuItem
              className={MENU_ITEM}
              onSelect={signInWithGoogle}
            >
              <LogIn className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm">Log in with Google</span>
            </DropdownMenuItem>
          )}

          {isGoogleAuth && (
            <DropdownMenuItem
              className={MENU_ITEM}
              onSelect={signOut}
            >
              <LogOut className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm">Log out</span>
            </DropdownMenuItem>
          )}

          {isGoogleAuth && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="flex items-center gap-2 hover:bg-red-500/10 outline-none p-2 rounded-lg cursor-pointer dark:hover:bg-red-900/40"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">Delete my data</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account and all application data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteMyData}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <DropdownMenuItem
            className={MENU_ITEM}
            onSelect={toggleTheme}
          >
            {theme === "dark"
              ? <Sun className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              : <Moon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            }
            <span className="text-sm">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className={MENU_ITEM}
            onSelect={() => radarEffects.setEnabled(!radarEffects.enabled)}
          >
            <Radar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm">
              Radar effects: {radarEffects.enabled ? "on" : "off"}
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>
    </>
  );
};
