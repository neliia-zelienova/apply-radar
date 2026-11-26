import { useState } from "react";
import { Settings, LogIn, LogOut, Trash2, Sun, Moon, Palette, Radar } from "lucide-react";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AvatarPicker,
  Button,
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

  // Outside the menu (like the web app), so the menu can close while it's open.
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteMyData = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.deleteAccount();
    } catch (error) {
      console.error("Failed to delete account data:", error);
      setDeleteError("Couldn't delete your data. Check your connection and try again.");
      setDeleting(false);
      return;
    }
    setDeleting(false);
    setConfirmDelete(false);
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
      <AlertDialog open={confirmDelete} onOpenChange={(open) => !deleting && setConfirmDelete(open)}>
        <AlertDialogContent>
          <AlertDialogHeader icon={<Trash2 size={18} />} tone="danger">
            <AlertDialogTitle>Delete your account data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all applications and interviews stored in your
              account, and logs you out. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-red-600 dark:text-red-400">
              {deleteError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm" disabled={deleting}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                size="sm"
                disabled={deleting}
                onClick={(event) => {
                  // Stay open until it's done (and on an error).
                  event.preventDefault();
                  void handleDeleteMyData();
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
            <DropdownMenuItem
              className="flex items-center gap-2 hover:bg-red-500/10 outline-none p-2 rounded-lg cursor-pointer dark:hover:bg-red-900/40"
              onSelect={() => {
                setDeleteError(null);
                setConfirmDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-sm text-red-600 dark:text-red-400">Delete my data</span>
            </DropdownMenuItem>
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
