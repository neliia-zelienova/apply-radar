import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // @apply-radar/ui has React as a peer dependency; bundle a single copy.
    dedupe: ["react", "react-dom"],
  },
  server: {
    // Must match an "Authorized JavaScript origin" of the Google OAuth client
    // and the API's CORS allowlist, so don't let Vite pick another port.
    port: 5173,
    strictPort: true,
  },
});
