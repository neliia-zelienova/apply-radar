import { useState } from "react";
import { LogOut, Moon, Palette, Radar, Sun, Trash2 } from "lucide-react";
import type { AvatarSettings } from "@apply-radar/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AvatarPicker,
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  UserAvatar,
  useRadarEffects,
  useThemeContext,
} from "@apply-radar/ui";
import type { Profile } from "../hooks/use-session";

const itemClass =
  "flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-800 outline-none hover:bg-black/5 dark:text-slate-200 dark:hover:bg-white/5";

export const AccountMenu = ({
  profile,
  avatar,
  onSaveAvatar,
  onSignOut,
  onDeleteAccount,
}: {
  profile: Profile;
  avatar: AvatarSettings;
  onSaveAvatar: (avatar: AvatarSettings) => Promise<void>;
  onSignOut: () => void;
  onDeleteAccount: () => Promise<void>;
}) => {
  const { theme, toggleTheme } = useThemeContext();
  const radarEffects = useRadarEffects();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const displayName = profile.name || profile.email;

  return (
    <>
      <DropdownMenuRoot>
        <DropdownMenuTrigger asChild>
          <button
            // Room after the name only when the name is shown (sm and up).
            className={`flex cursor-pointer items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 transition-colors hover:bg-teal-500/15 ${displayName ? "sm:pr-3" : ""}`}
            aria-label="Account menu"
          >
            <UserAvatar
              avatar={avatar}
              photoUrl={profile.picture}
              label={profile.name || "Your avatar"}
            />
            {displayName && (
              <span className="hidden max-w-40 truncate text-sm text-slate-200 sm:inline">
                {displayName}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={6}
          collisionPadding={8}
          className="min-w-52 rounded-lg border border-gray-200 bg-white p-1 shadow-lg dark:border-white/10 dark:bg-[#0f1829]"
        >
          {profile.email && (
            <div className="px-3 py-2 text-xs text-gray-400 dark:text-slate-500">
              {profile.email}
            </div>
          )}
          <DropdownMenuItem className={itemClass} onSelect={() => setPickerOpen(true)}>
            <Palette className="h-4 w-4" />
            Change avatar
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} onSelect={() => void toggleTheme()}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light theme" : "Dark theme"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className={itemClass}
            onSelect={() => radarEffects.setEnabled(!radarEffects.enabled)}
          >
            <Radar className="h-4 w-4" />
            Radar effects: {radarEffects.enabled ? "on" : "off"}
          </DropdownMenuItem>
          <DropdownMenuItem className={itemClass} onSelect={onSignOut}>
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
          <DropdownMenuItem
            className={`${itemClass} !text-red-500`}
            onSelect={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete my data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuRoot>

      <AvatarPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        value={avatar}
        photoUrl={profile.picture}
        onSave={onSaveAvatar}
      />

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader icon={<Trash2 size={18} />} tone="danger">
            <AlertDialogTitle>Delete your account data?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes all applications and interviews stored in your
              account. Data saved "device only" in the extension is not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-red-500">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="danger"
                size="sm"
                onClick={async (event) => {
                  event.preventDefault();
                  try {
                    await onDeleteAccount();
                  } catch (error) {
                    setDeleteError(error instanceof Error ? error.message : String(error));
                  }
                }}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
