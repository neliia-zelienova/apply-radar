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
    return new Promise<void>((resolve, reject) => {
      let completedSync = false;

      const onDone = () => {
        const lastError = getChromeLastError();
        if (lastError) reject(toError(lastError));
        else resolve();
      };

      const maybe = extensionStorage.set(data, () => {
        // Callback-based implementations (chrome.storage) will invoke this.
        // Promise-based implementations (browser.storage) generally ignore it.
        completedSync = true;
        onDone();
      });

      // Promise path (browser.storage)
      if (isPromise<void>(maybe)) {
        maybe.then(resolve, (err) => reject(toError(err)));
        return;
      }

      // Callback path (chrome.storage): if the callback was not invoked
      // synchronously, it will resolve/reject later.
      if (completedSync) return;
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
        if (lastError) reject(toError(lastError));
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
        if (lastError) reject(toError(lastError));
        else resolve();
      });
    });
  } catch (e) {
    return Promise.reject(toError(e));
  }
}
