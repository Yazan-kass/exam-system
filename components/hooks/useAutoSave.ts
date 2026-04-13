import { useEffect, useRef } from "react";

/**
 * Automatically saves data with debounce and change detection.
 * Prevents redundant API calls if data is identical to last save.
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<any>,
  debounceMs: number = 500
) {
  const lastSavedData = useRef<string>(JSON.stringify(data));
  const saveFnRef = useRef(saveFn);

  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);

  useEffect(() => {
    const stringified = JSON.stringify(data);
    
    // Skip if data hasn't changed since last save
    if (stringified === lastSavedData.current) return;

    const timeout = setTimeout(async () => {
      try {
        await saveFnRef.current(data);
        lastSavedData.current = stringified;
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, debounceMs);

    return () => clearTimeout(timeout);
  }, [data, debounceMs]);
}