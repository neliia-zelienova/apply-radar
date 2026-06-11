// Minimal globals to make cross-browser extension code typecheck.
// - `chrome` comes from @types/chrome (already included via tsconfig types)
// - `browser` is the WebExtensions namespace (Firefox et al)

declare const browser: {
  storage?: {
    local?: {
      get: (
        keys: string[] | string,
        callback: (items: Record<string, any>) => void,
      ) => void;
      set: (items: Record<string, any>, callback?: () => void) => void;
      remove: (keys: string[] | string, callback?: () => void) => void;
    };
  };
};
