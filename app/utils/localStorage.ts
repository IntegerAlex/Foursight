// Local storage utility functions

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save data to local storage
 * @param key The key to store the data under
 * @param data The data to store
 * @param expiryMinutes Optional expiry time in minutes
 */
export const saveToLocalStorage = (key: string, data: any, expiryMinutes?: number): void => {
  if (!isBrowser) return;
  
  try {
    const item = {
      data,
      timestamp: Date.now(),
      expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null,
    };
    
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

/**
 * Load data from local storage
 * @param key The key to retrieve data from
 * @param maxAgeMinutes Optional maximum age of data in minutes
 * @returns The stored data or null if not found or expired
 */
export const loadFromLocalStorage = (key: string, maxAgeMinutes?: number): any => {
  if (!isBrowser) return null;
  
  try {
    const itemStr = localStorage.getItem(key);
    
    // Return null if no item found
    if (!itemStr) return null;
    
    const item = JSON.parse(itemStr);
    
    // Check if item has expired based on explicit expiry
    if (item.expiry && Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    // Check if item is older than maxAgeMinutes
    if (maxAgeMinutes && Date.now() > item.timestamp + maxAgeMinutes * 60 * 1000) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`);
    return null;
  }
};

/**
 * Remove data from local storage
 * @param key The key to remove
 */
export const removeFromLocalStorage = (key: string): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

/**
 * Clear all data from local storage
 */
export const clearLocalStorage = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
}; 