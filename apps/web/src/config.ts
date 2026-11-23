const read = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const apiUrl = read(import.meta.env.VITE_API_URL);
const googleClientId = read(import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID);

/** Env variables (from apps/web/.env) that are missing; shown on the config error page. */
export const missingConfig: string[] = [
  ...(apiUrl ? [] : ["VITE_API_URL"]),
  ...(googleClientId ? [] : ["VITE_GOOGLE_OAUTH_CLIENT_ID"]),
];

export const config = {
  apiUrl: apiUrl ?? "",
  googleClientId: googleClientId ?? "",
};
