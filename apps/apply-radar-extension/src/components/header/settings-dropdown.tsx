import { Settings, LogIn, LogOut, Trash2, Sun, Moon } from "lucide-react";
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { useAuthContext } from "../../context/auth-context";
import { useThemeContext } from "../../context/theme-context";
import { ApplyRadarApi } from "../../services/app-radar-api";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";

export const SettingsDropdown = () => {
  const { authType, signInWithGoogle, signOut } = useAuthContext();
  const { theme, toggleTheme } = useThemeContext();
  const isGoogleAuth = authType === "google";

  const handleDeleteMyData = async () => {
    try {
      await ApplyRadarApi.deleteAccount();
    } catch (error) {
      console.error("Failed to delete account data:", error);
      return;
    }
    await signOut();
  };

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Settings"
          className="cursor-pointer flex items-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            padding: "7px",
            color: "rgba(148,163,184,0.8)",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(20,184,166,0.15)";
            el.style.color = "#5eead4";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255,255,255,0.06)";
            el.style.color = "rgba(148,163,184,0.8)";
          }}
        >
          <Settings className="h-[18px] w-[18px]" style={{ strokeWidth: 1.8 }} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="min-w-[180px] z-50 bg-[#0f1829] border border-white/10 rounded-[10px] p-1"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.35)" }}
      >
        {!isGoogleAuth && (
          <DropdownMenuItem
            className="flex items-center gap-2 hover:bg-teal-500/20 outline-none p-2 rounded-md cursor-pointer text-stone-50"
            onSelect={signInWithGoogle}
          >
            <LogIn className="h-4 w-4 text-teal-400" />
            <span className="text-sm">Log in with Google</span>
          </DropdownMenuItem>
        )}

        {isGoogleAuth && (
          <DropdownMenuItem
            className="flex items-center gap-2 hover:bg-teal-500/20 outline-none p-2 rounded-md cursor-pointer text-stone-50"
            onSelect={signOut}
          >
            <LogOut className="h-4 w-4 text-teal-400" />
            <span className="text-sm">Log out</span>
          </DropdownMenuItem>
        )}

        {isGoogleAuth && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                className="flex items-center gap-2 hover:bg-red-900/40 outline-none p-2 rounded-md cursor-pointer"
                onSelect={(e) => e.preventDefault()}
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                <span className="text-sm text-red-400">Delete my data</span>
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
          className="flex items-center gap-2 hover:bg-teal-500/20 outline-none p-2 rounded-md cursor-pointer text-stone-50"
          onSelect={toggleTheme}
        >
          {theme === "dark"
            ? <Sun className="h-4 w-4 text-teal-400" />
            : <Moon className="h-4 w-4 text-teal-400" />
          }
          <span className="text-sm">
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
};
