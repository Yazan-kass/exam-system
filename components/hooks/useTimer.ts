import { useEffect, useState, useRef } from "react";

/**
 * A stable countdown timer that accurately calculates remaining time.
 * Prevents interval resets or callback drift using refs.
 */
export function useTimer(endTime: number, onFinish: () => void) {
  const onFinishRef = useRef(onFinish);
  const finishedTriggered = useRef(false);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, endTime - Date.now()));

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        if (!finishedTriggered.current) {
          finishedTriggered.current = true;
          onFinishRef.current();
        }
        setTimeLeft(0);
        return true; 
      }

      setTimeLeft(diff);
      return false; 
    };

    if (tick()) return;

    const interval = setInterval(() => {
      if (tick()) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return timeLeft;
}