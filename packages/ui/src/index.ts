// Generic React components shared by the extension and any future web app.
// Styling: consumers must import "@apply-radar/ui/styles.css" into their Tailwind
// entry CSS and add this package's `src` as an `@source` (see README).
export * from "./alert-dialog";
export * from "./app-header";
export * from "./radar-logo";
export * from "./radar-background";
export * from "./application-status-icon";
export * from "./button";
export * from "./checkbox";
export * from "./dialog";
export * from "./dropdown-menu";
export * from "./field";
export * from "./input-number";
export * from "./popover";
export * from "./select";
export * from "./status-banner";
export * from "./switch";
export * from "./tooltip";

export * from "./auth/google-icon";

// Application screens (list, forms, interviews) + the contexts that feed them.
export * from "./applications/applications-panel";
export * from "./applications/application-item";
export * from "./applications/application-form";
export * from "./applications/interview-form";
export * from "./applications/interview-card";
export * from "./applications/list-header";
export * from "./context/theme-context";
export * from "./context/applications-context";
export * from "./context/radar-effects-context";

// State hook shared by the apps (local or API-backed repository).
export * from "./hooks/use-applications-store";
export * from "./hooks/use-session-sync";

// Avatar (Google photo or animal icon) + picker.
export * from "./avatar/user-avatar";
export * from "./avatar/avatar-picker";
export * from "./hooks/use-avatar-settings";
