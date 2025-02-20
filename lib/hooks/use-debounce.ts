//For Filtering operations on board.tsx file, we need to use debounce to avoid multiple calls to the API.
//We can create a custom hook to debounce the search term and filters.

import {useState,useEffect} from 'react';

// Debounce hook - Delays value updates
// useEffect - Manages timeout cleanup
// search/filter - Primary use cases

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}