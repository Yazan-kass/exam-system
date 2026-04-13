import { useState, useEffect, useCallback, useRef } from "react";
import { AppError, handleError } from "../utils/error-handler";

interface FetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: AppError | null;
}

/**
 * A professional custom hook for data fetching with standardized states.
 * Prevents race conditions and infinite loops while maintaining a stable refetch API.
 */
export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const lastFetchId = useRef(0);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn stable without triggering effects
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const fetchData = useCallback(async () => {
    const currentFetchId = ++lastFetchId.current;

    setState((prev) => ({ 
      ...prev, 
      isLoading: true, 
      error: null 
    }));

    try {
      const result = await fetchFnRef.current();
      
      // Only update state if this is still the most recent fetch
      if (currentFetchId === lastFetchId.current) {
        setState({ data: result, isLoading: false, error: null });
      }
    } catch (err) {
      if (currentFetchId === lastFetchId.current) {
        setState((prev) => ({ 
          data: prev.data, // Keep old data on error
          isLoading: false, 
          error: handleError(err) 
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // Trigger fetch on mount and whenever dependencies change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}