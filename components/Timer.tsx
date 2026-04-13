import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
  onTimeUp: () => void;
}

export function Timer({ initialMinutes, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft < 300; // Less than 5 minutes warning

  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-md font-bold text-xl tabular-nums shadow-lg ${isWarning ? 'bg-destructive text-white' : 'bg-surface/80 text-primary border-2 border-primary/20'}`}>
      <Clock className="w-6 h-6" />
      <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
    </div>
  );
}
