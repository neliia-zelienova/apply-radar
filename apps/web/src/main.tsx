import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";
import { handleOAuthCallback } from "./google-popup";

// In the Google sign-in popup: pass the result to the app window and close.
if (!handleOAuthCallback()) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
