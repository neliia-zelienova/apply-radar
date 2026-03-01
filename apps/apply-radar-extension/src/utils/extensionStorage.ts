// src/utils/extensionStorage.ts
// Cross-browser extension storage utility.
//
// chrome.storage.local is callback-based.
// browser.storage.local (WebExtensions) is Promise-based.

type MaybePromise<T> = T | Promise<T>;

type StorageArea = {
  get: (
    keys: string[] | string,
    callback?: (items: Record<string, any>) => void,
  ) => MaybePromise<Record<string, any>>;
  set: (
    items: Record<string, any>,
    callback?: () => void,
  ) => MaybePromise<void>;
  remove: (
    keys: string[] | string,
    callback?: () => void,
  ) => MaybePromise<void>;
};

function isPromise<T = unknown>(value: any): value is Promise<T> {
  return (
    !!value && typeof value === "object" && typeof value.then === "function"
  );
}

function getChromeLastError(): unknown {
  return (globalThis as any)?.chrome?.runtime?.lastError;
}

function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  try {
    return new Error(JSON.stringify(err));
  } catch {
    return new Error(String(err));
  }
}

const extensionStorage: StorageArea | null = (() => {
  const anyGlobal = globalThis as any;
  const browserStorage = anyGlobal?.browser?.storage?.local as
    | StorageArea
    | undefined;
  if (browserStorage) return browserStorage;

  const chromeStorage = anyGlobal?.chrome?.storage?.local as
    | StorageArea
    | undefined;
  if (chromeStorage) return chromeStorage;

  return null;
})();

export function setExtensionStorage(key: string, value: any): Promise<void> {
  if (!extensionStorage) {
    return Promise.reject(new Error("No extension storage available"));
  }

  const data: Record<string, any> = { [key]: value };

  try {
    const maybe = extensionStorage.set(data, () => {
      // Callback path (chrome.storage)
    });

    if (isPromise<void>(maybe)) {
      // Promise path (browser.storage)
      return maybe;
    }

    // Callback path (chrome.storage)
    return new Promise<void>((resolve, reject) => {
      extensionStorage.set(data, () => {
        const lastError = getChromeLastError();
        if (lastError) reject(lastError);
        else resolve();
      });
    });
  } catch (e) {
    return Promise.reject(toError(e));
  }
}

export function getExtensionStorage<T = any>(key: string): Promise<T | null> {
  if (!extensionStorage) {
    return Promise.reject(new Error("No extension storage available"));
  }

  try {
    const maybe = extensionStorage.get([key]);
    if (isPromise<Record<string, T>>(maybe)) {
      return maybe.then((result) => result?.[key] ?? null);
    }

    return new Promise<T | null>((resolve, reject) => {
      extensionStorage.get([key], (result: Record<string, T>) => {
        const lastError = getChromeLastError();
        if (lastError) reject(lastError);
        else resolve(result?.[key] ?? null);
      });
    });
  } catch (e) {
    return Promise.reject(toError(e));
  }
}

export function removeExtensionStorage(key: string): Promise<void> {
  if (!extensionStorage) {
    return Promise.reject(new Error("No extension storage available"));
  }

  try {
    const maybe = extensionStorage.remove(key);
    if (isPromise<void>(maybe)) {
      return maybe;
    }

    return new Promise<void>((resolve, reject) => {
      extensionStorage.remove(key, () => {
        const lastError = getChromeLastError();
        if (lastError) reject(lastError);
        else resolve();
      });
    });
  } catch (e) {
    return Promise.reject(toError(e));
  }
}
