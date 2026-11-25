import { Dashboard } from "../components/dashboard";
import { SignInPage } from "../components/sign-in-page";
import { SiteHeader } from "../components/site-header";
import { useDocumentTitle } from "../hooks/use-document-title";
import { useSessionContext } from "../session-context";

/** /dashboard: the applications when signed in, the sign-in card otherwise. */
export const DashboardPage = () => {
  const { session, signingIn, signInWithGoogle, cancelSignIn, signOut, deleteAccount } =
    useSessionContext();
  useDocumentTitle(session.status === "signed-out" ? "Sign in" : "Dashboard");

  switch (session.status) {
    case "loading":
      return (
        <div className="flex min-h-screen items-center justify-center text-sm text-gray-400 dark:text-slate-500">
          Loading…
        </div>
      );
    case "signed-out":
      return (
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <SignInPage
            error={session.error}
            busy={signingIn}
            onSignIn={() => void signInWithGoogle()}
            onCancel={cancelSignIn}
          />
        </div>
      );
    case "signed-in":
      return (
        <Dashboard
          // Remount (reload data) when the account changes.
          key={session.profile.userId}
          profile={session.profile}
          onSignOut={() => void signOut()}
          onDeleteAccount={deleteAccount}
        />
      );
  }
};
