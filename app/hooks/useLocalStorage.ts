import { useState, useEffect } from 'react';
import { loadFromLocalStorage, saveToLocalStorage } from '../utils/localStorage';

/**
 * Custom hook for managing state with localStorage persistence
 * @param key The localStorage key to use
 * @param initialValue The initial value if nothing is in localStorage
 * @param maxAgeMinutes Maximum age of cached data in minutes
 * @returns [state, setState] tuple similar to useState
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  maxAgeMinutes?: number
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Initialize state with value from localStorage or initialValue
  const [state, setState] = useState<T>(() => {
    // Try to get value from localStorage
    const storedValue = loadFromLocalStorage(key, maxAgeMinutes);
    // Return stored value if it exists, otherwise return initialValue
    return storedValue !== null ? storedValue : initialValue;
  });

  // Update localStorage when state changes
  useEffect(() => {
    saveToLocalStorage(key, state, maxAgeMinutes ? maxAgeMinutes * 2 : undefined);
  }, [key, state, maxAgeMinutes]);

  return [state, setState];
}

/**
 * Custom hook for fetching and caching data
 * @param key The localStorage key to use
 * @param fetchFn The function to fetch data
 * @param maxAgeMinutes Maximum age of cached data in minutes
 * @param dependencies Dependencies array for useEffect
 * @returns [data, isLoading, error] tuple
 */
export function useCachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  maxAgeMinutes: number = 5,
  dependencies: any[] = []
): [T | null, boolean, Error | null] {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Try to get data from localStorage
      const cachedData = loadFromLocalStorage(key, maxAgeMinutes);
      
      // If we have cached data, use it
      if (cachedData) {
        setData(cachedData);
        setIsLoading(false);
        return;
      }
      
      // Otherwise fetch fresh data
      try {
        const freshData = await fetchFn();
        setData(freshData);
        saveToLocalStorage(key, freshData, maxAgeMinutes * 2);
        setError(null);
      } catch (err) {
        console.error(`Error fetching data for ${key}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Set up refresh interval
    const refreshInterval = setInterval(() => {
      fetchData();
    }, maxAgeMinutes * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [...dependencies]);

  return [data, isLoading, error];
} 