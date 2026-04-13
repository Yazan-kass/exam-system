import { useMemo, useCallback } from "react";
import { useFetch } from "@/lib/hooks/useFetch";
import { useTimer } from "@/components/hooks/useTimer";
import { examService } from "@/lib/services/exam.service";

/**
 * Production-grade hook to manage an exam's state, status, and countdown.
 * Strictly adheres to database records for submissions and server-defined times.
 */
export function useExam(examId: string, userId: string) {
  // 1. Fetch Exam Definition
  const { 
    data: exam, 
    isLoading: examLoading, 
    error: examError, 
    refetch: refetchExam 
  } = useFetch(() => examService.getExamById(examId), [examId]);

  // 2. Fetch Submission Status (Direct DB Record check)
  const { 
    data: attempt, 
    isLoading: attemptLoading, 
    error: attemptError, 
    refetch: refetchAttempt 
  } = useFetch(
    () => userId ? examService.checkExistingAttempt(userId, examId) : Promise.resolve(null),
    [examId, userId]
  );

  // Combine loading and error states for consumer simplicity
  const isLoading = examLoading || attemptLoading;
  const error = examError || attemptError;

  // 3. Live Countdown Timer
  // Uses Date.now() for precision vs endTime from the database
  const endTime = exam?.endTime ? new Date(exam.endTime).getTime() : 0;
  
  const timeLeft = useTimer(endTime, () => {
    // Timer handles stopping at 0 autonomously
  });

  // 4. Derived Status Logic (Reactive to both Time and Database records)
  const status = useMemo(() => {
    if (isLoading) return "loading";
    if (!exam) return "error";

    // A. Submission record in DB is the absolute source of truth
    if (attempt) return "submitted";

    const now = Date.now();
    const startTime = new Date(exam.startTime).getTime();
    const endTimeVal = new Date(exam.endTime).getTime();

    // B. Time-based logic
    if (now < startTime) return "not_started";
    
    // Status ends if current time > endTime OR if the reactive timer hits 0
    if (now > endTimeVal || (endTimeVal > 0 && timeLeft === 0)) return "ended";

    return "active";
  }, [isLoading, exam, attempt, timeLeft]);

  // Unified refetch capability
  const refetch = useCallback(() => {
    refetchExam();
    refetchAttempt();
  }, [refetchExam, refetchAttempt]);

  return {
    exam,
    isLoading,
    error,
    status,
    timeLeft,
    refetch,
  };
}