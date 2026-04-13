// app/student/hooks/useTimer.ts
import { useState, useEffect, useCallback } from "react";

export function useTimer(initialSeconds: number, onEnd: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  const startTimer = useCallback(() => setIsActive(true), []);
  const stopTimer = useCallback(() => setIsActive(false), []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, onEnd]);

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return { timeLeft, isActive, startTimer, stopTimer, formatTime };
}
