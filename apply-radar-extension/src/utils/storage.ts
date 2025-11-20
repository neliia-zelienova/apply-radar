/**
 * Secure storage utility for Chrome Extension
 * Uses chrome.storage.local API which is:
 * - More secure than localStorage
 * - Not accessible from web pages
 * - Not easily manipulated by users through DevTools
 * - Has larger storage limits (10MB vs 5MB)
 */

/**
 * Check if chrome.storage API is available
 */
const isChromeStorageAvailable = (): boolean => {
  return typeof chrome !== 'undefined' && 
         chrome.storage !== undefined && 
         chrome.storage.local !== undefined;
};

/**
 * Get data from storage
 * @param key - The key to retrieve
 * @returns Promise resolving to the stored value or null if not found
 */
export const getFromStorage = async <T>(key: string): Promise<T | null> => {
  if (isChromeStorageAvailable()) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key] !== undefined ? (result[key] as T) : null;
    } catch (error) {
      console.error(`Error getting ${key} from chrome.storage:`, error);
      return null;
    }
  } else {
    // Fallback to localStorage for development
    console.warn('Chrome storage API not available, falling back to localStorage');
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (error) {
        console.error(`Error parsing localStorage item for key "${key}":`, error);
        return null;
      }
    } else {
      return null;
    }
};

/**
 * Set data in storage
 * @param key - The key to store under
 * @param value - The value to store
 * @returns Promise resolving when storage is complete
 */
export const setInStorage = async <T>(key: string, value: T): Promise<void> => {
  if (isChromeStorageAvailable()) {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      console.error(`Error setting ${key} in chrome.storage:`, error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    console.warn('Chrome storage API not available, falling back to localStorage');
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/**
 * Remove data from storage
 * @param key - The key to remove
 * @returns Promise resolving when removal is complete
 */
export const removeFromStorage = async (key: string): Promise<void> => {
  if (isChromeStorageAvailable()) {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      console.error(`Error removing ${key} from chrome.storage:`, error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    console.warn('Chrome storage API not available, falling back to localStorage');
    localStorage.removeItem(key);
  }
};

/**
 * Clear all data from storage
 * @returns Promise resolving when clear is complete
 */
export const clearStorage = async (): Promise<void> => {
  if (isChromeStorageAvailable()) {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      console.error('Error clearing chrome.storage:', error);
      throw error;
    }
  } else {
    // Fallback to localStorage for development
    console.warn('Chrome storage API not available, falling back to localStorage');
    localStorage.clear();
  }
};

/**
 * Listen for storage changes
 * @param callback - Function to call when storage changes
 * @returns Cleanup function to remove the listener
 */
export const onStorageChange = (
  callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
): (() => void) => {
  if (isChromeStorageAvailable()) {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local') {
        callback(changes);
      }
    };
    
    chrome.storage.onChanged.addListener(listener);
    
    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  } else {
    // For development, we can't listen to localStorage changes from the same window
    console.warn('Chrome storage API not available, storage change listener not active');
    return () => {};
  }
};
