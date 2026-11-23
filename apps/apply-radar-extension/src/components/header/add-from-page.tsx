import { Loader2, ScanText } from "lucide-react";
import {
  ApplicationForm,
  BannerAction,
  StatusBanner,
  useApplicationContext,
} from "@apply-radar/ui";
import { useAuthContext } from "../../context/auth-context";
import { usePageImport } from "../../hooks/use-page-import";
import { PillButton } from "./pill-button";

/**
 * "From this page" button: reads the job posting in the current tab and opens
 * the "Add application" form pre-filled. The context menu item ("Add this job
 * to Apply Radar") ends up here too.
 */
export const AddFromPageButton = () => {
  const { authType } = useAuthContext();
  const { createApplication } = useApplicationContext();
  const { state, importFromActiveTab, reset } = usePageImport({ authType });
  const busy = state.status === "reading";

  return (
    <>
      <PillButton
        onClick={() => void importFromActiveTab()}
        disabled={busy}
        aria-label="Add application from this page"
        title="Read the job posting in the current tab"
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <ScanText className="h-3.5 w-3.5" />
        )}
        {busy ? "Reading page…" : "From this page"}
      </PillButton>

      {state.status === "error" && (
        <StatusBanner
          tone="error"
          // The header is dark in both themes: light-on-dark colors here.
          className="basis-full !border-red-400/40 !bg-red-500/15 !text-red-100"
          actions={<BannerAction onClick={reset}>Dismiss</BannerAction>}
        >
          {state.message}
        </StatusBanner>
      )}

      {state.status === "ready" && (
        <ApplicationForm
          // A new form per import, so it starts from this page's values.
          key={state.id}
          externalOpen
          draft={state.draft}
          notice={state.notice}
          onSave={async (application) => {
            const saved = await createApplication(application);
            if (saved) reset();
            return saved;
          }}
          onCancel={reset}
        />
      )}
    </>
  );
};
