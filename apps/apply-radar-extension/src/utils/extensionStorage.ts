// src/utils/extensionStorage.ts
// Cross-browser extension storage utility (chrome.storage.local or browser.storage.local)

type StorageArea = {
  get: (
    keys: string[] | string,
    callback: (items: Record<string, any>) => void,
  ) => void;
  set: (items: Record<string, any>, callback?: () => void) => void;
  remove: (keys: string[] | string, callback?: () => void) => void;
};

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
  return new Promise((resolve, reject) => {
    if (!extensionStorage) return reject("No extension storage available");
    const data: Record<string, any> = {};
    data[key] = value;
    extensionStorage.set(data, () => {
      const lastError = (globalThis as any)?.chrome?.runtime?.lastError;
      if (lastError) {
        reject(lastError);
      } else {
        resolve();
      }
    });
  });
}

export function getExtensionStorage<T = any>(key: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    if (!extensionStorage) return reject("No extension storage available");
    extensionStorage.get([key], (result: Record<string, T>) => {
      const lastError = (globalThis as any)?.chrome?.runtime?.lastError;
      if (lastError) {
        reject(lastError);
      } else {
        resolve(result[key] ?? null);
      }
    });
  });
}

export function removeExtensionStorage(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!extensionStorage) return reject("No extension storage available");
    extensionStorage.remove(key, () => {
      const lastError = (globalThis as any)?.chrome?.runtime?.lastError;
      if (lastError) {
        reject(lastError);
      } else {
        resolve();
      }
    });
  });
}
