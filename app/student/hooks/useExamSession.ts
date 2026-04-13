// app/student/hooks/useExamSession.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { db } from "../../../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

export function useExamSession(studentId: string, examId: string) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing session from Firestore
  useEffect(() => {
    async function loadSession() {
      if (!studentId || !examId) return;
      const sessionRef = doc(db, "examSessions", `${studentId}_${examId}`);
      const snap = await getDoc(sessionRef);
      if (snap.exists()) {
        setAnswers(snap.data().answers || {});
      }
      setLoading(false);
    }
    loadSession();
  }, [studentId, examId]);

  // Auto-save logic (Debounced)
  const saveSession = useCallback(async (newAnswers: Record<string, number>) => {
    if (!studentId || !examId || Object.keys(newAnswers).length === 0) return;
    const sessionRef = doc(db, "examSessions", `${studentId}_${examId}`);
    try {
      await setDoc(sessionRef, {
        studentId,
        examId,
        answers: newAnswers,
        updatedAt: new Date()
      }, { merge: true });
      setLastSaved(new Date());
    } catch (e) {
      console.error("Failed to auto-save session:", e);
    }
  }, [studentId, examId]);

  // Handle debounced saving in a separate effect
  useEffect(() => {
    if (Object.keys(answers).length === 0 || loading) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      saveSession(answers);
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [answers, saveSession, loading]);

  const updateAnswer = useCallback((questionId: string, optionIdx: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  }, []);

  return { answers, updateAnswer, sessionLoading: loading, lastSaved };
}
