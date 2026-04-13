"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Progress } from "../../../../components/ui/progress";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Flag,
  AlertCircle,
  Lock,
  User as TeacherIcon,
  CheckCircle2,
  FileQuestion,
} from "lucide-react";
import { SectionHeader } from "../../../../components/SectionHeader";
import { StatusBadge } from "../../../../components/StatusBadge";
import { LoadingButton } from "../../../../components/LoadingButton";
import { EmptyState } from "../../../../components/EmptyState";

import { useAuth } from "../../../../context/AuthContext";
import { examService, ExamDTO, QuestionDTO } from "../../../../lib/services/exam.service";
import { studentService } from "../../../../lib/services/student.service";
import { useExamSession } from "../../hooks/useExamSession";
import { useTimer } from "../../hooks/useTimer";
import { notificationService } from "../../../../lib/services/notification.service";
import { useFetch } from "../../../../lib/hooks/useFetch";
import { handleError } from "../../../../lib/utils/error-handler";

export default function DynamicExamPage() {
  const router = useRouter();
  const { examId } = useParams() as { examId: string };
  const { user, profile, role, loading: authLoading } = useAuth();

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Professional Data Fetching
  const fetchExamFullData = useCallback(async () => {
    if (!user?.uid || !examId) return null;

    const [exam, existingResult] = await Promise.all([
      examService.getExamById(examId),
      examService.checkExistingAttempt(user.uid, examId)
    ]);

    if (!exam) return { exam: null, questions: [], existingResult: null };

    const [questionsData, teacherName] = await Promise.all([
      examService.getQuestions(exam.subjectId),
      studentService.getTeacherName(exam.teacherId)
    ]);

    // System Logic: Filter questions belonging to this specific exam
    const sortedQuestions = questionsData.filter(q => exam.questionIds.includes(q.id));
    
    return { 
      exam: { ...exam, teacherName }, 
      questions: sortedQuestions, 
      existingResult 
    };
  }, [examId, user?.uid]);

  const { data, isLoading: dataLoading, error: fetchError } = useFetch(fetchExamFullData, [examId, user?.uid]);

  // Session & Timer hooks (Client side logic)
  const { answers, updateAnswer, sessionLoading } = useExamSession(user?.uid || "", examId);

  // Update current time for waiting room
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAutoSubmit = useCallback(() => {
    if (!isSubmitting) handleSubmit();
  }, [isSubmitting]);

  const exam = data?.exam;
  const questions = data?.questions || [];
  const existingResult = data?.existingResult;

  const { timeLeft, formatTime, startTimer, stopTimer, isActive: timerActive } = useTimer(
    (exam?.duration || 20) * 60,
    handleAutoSubmit
  );

  const isStarted = exam ? currentTime >= exam.startTime : false;
  const isEnded = exam ? currentTime > exam.endTime : false;

  // Professional Timer triggering
  useEffect(() => {
    if (isStarted && !isEnded && !existingResult && !dataLoading && !timerActive && !fetchError) {
      startTimer();
    }
  }, [isStarted, isEnded, existingResult, dataLoading, timerActive, startTimer, fetchError]);

  const handleSubmit = async () => {
    if (isSubmitting || questions.length === 0 || !user || !profile || !exam) return;
    setIsSubmitting(true);
    
    // Offline Backup Guard
    try {
      localStorage.setItem(`offline_backup_${exam.id}`, JSON.stringify(answers));
    } catch(e) { console.error("Backup failed", e) }

    try {
      // Auto-grading logic (Domain Logic)
      let score = 0;
      questions.forEach((q) => {
        if (answers[q.id] === q.correctAnswer) score += 1;
      });

      const resultId = await examService.saveResult({
        studentId: user.uid,
        studentName: profile.name || "طالب مجهول",
        examId: exam.id,
        subjectId: exam.subjectId,
        subjectName: exam.title,
        examName: exam.title,
        score,
        totalQuestions: questions.length,
        selectedAnswers: answers,
        duration: formatTime(),
        status: "مكتمل"
      });
      
      // Notify System
      await notificationService.sendExamSuccessNotification(user!.uid, exam.title, score, questions.length);

      // Clean backup
      try { localStorage.removeItem(`offline_backup_${exam.id}`); } catch(e) {}

      stopTimer();
      router.push(`/student/results/${resultId}`);
    } catch (error) {
      const appErr = handleError(error);
      alert(appErr.message); // Standard feedback
      setIsSubmitting(false);
    }
  };

  if (authLoading || (role && role !== "student")) return null;
  if (!isMounted) return null;

  // --- LOADING STATES ---
  if (dataLoading || sessionLoading) {
    return (
      <div className="space-y-12 py-10 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="space-y-4 w-1/2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-16 w-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
                <Skeleton className="h-96 rounded-[2.5rem]" />
                <div className="flex gap-4">
                    <Skeleton className="h-14 flex-1 rounded-2xl" />
                    <Skeleton className="h-14 flex-1 rounded-2xl" />
                </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
                <Skeleton className="h-64 rounded-3xl" />
                <Skeleton className="h-32 rounded-3xl" />
            </div>
        </div>
      </div>
    );
  }

  // --- SYSTEM LOGIC SHIELDS ---

  if (fetchError) {
      return (
          <div className="py-20">
              <EmptyState title="خطأ في النظام" description={fetchError.message} icon={AlertCircle} action={{ label: "العودة للرئيسية", onClick: () => router.push("/student") }} />
          </div>
      );
  }

  if (existingResult) {
    return (
      <div className="py-20 text-center space-y-6">
        <EmptyState 
          title="محاولة مكررة" 
          description="لقد أتممت هذا الاختبار مسبقاً. النظام يسمح بمحاولة واحدة فقط لضمان النزاهة."
          icon={CheckCircle2}
          action={{
            label: "مراجعة نتيجتك",
            onClick: () => router.push(`/student/results/${existingResult.id}`)
          }}
        />
      </div>
    );
  }

  if (!isStarted && exam) {
    const diff = exam.startTime.getTime() - currentTime.getTime();
    const waitMinutes = Math.floor(diff / 60000);
    const waitSeconds = Math.floor((diff % 60000) / 1000);

    return (
      <div className="max-w-2xl mx-auto py-20">
        <Card className="border-none shadow-premium bg-surface-container-lowest rounded-[3rem] overflow-hidden">
          <CardContent className="p-14 text-center space-y-10">
            <div className="size-28 bg-primary/10 rounded-full flex items-center justify-center mx-auto animate-bounce border-8 border-primary/5">
              <Clock3 className="size-14 text-primary" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-on-surface tracking-tighter">بانتظار ساعة الصفر</h2>
              <p className="text-on-surface-variant font-bold text-lg opacity-70">سيتم تفعيل بيئة الاختبار فوراً عند حلول الموعد.</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-surface-container-low rounded-[2rem] border border-border/40 shadow-inner">
                <span className="block text-5xl font-black text-primary tabular-nums tracking-tighter">{waitMinutes}</span>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-2 block">دقيقة</span>
              </div>
              <div className="p-8 bg-surface-container-low rounded-[2rem] border border-border/40 shadow-inner">
                <span className="block text-5xl font-black text-primary tabular-nums tracking-tighter">{waitSeconds}</span>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-2 block">ثانية</span>
              </div>
            </div>
            <div className="pt-8 border-t border-border/40 text-xs font-black text-on-surface-variant flex items-center justify-center gap-3 uppercase tracking-wider">
              <AlertCircle className="size-4 text-primary" />
              الجدولة: {exam.startTime.toLocaleString('ar-SA')}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isEnded && !timerActive) {
    return (
      <div className="py-20 text-center space-y-6">
        <EmptyState 
          title="فوات الأوان" 
          description="لقد انتهى الوقت المسموح به لدخول هذا الاختبار. يرجى مراجعة المعلم."
          icon={Lock}
          action={{
            label: "العودة للوحة التحكم",
            onClick: () => router.push("/student")
          }}
        />
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="py-20">
        <EmptyState title="بيانات ناقصة" description="لم نتمكن من استرجاع أسئلة الاختبار. اتصل بالدعم الفني." icon={FileQuestion} />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIdx];
  const progress = Math.round(((currentQuestionIdx + 1) / questions.length) * 100);
  const isAnswered = answers[currentQuestion.id] !== undefined;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        title={exam.title} 
        description={
            <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full text-xs font-black">
                    <TeacherIcon className="size-4 text-primary" />
                    المعلم: {exam.teacherName}
                </span>
                <span className="flex items-center gap-2 bg-surface-container-low px-4 py-1.5 rounded-full text-xs font-black">
                    <FileQuestion className="size-4 text-primary" />
                    {questions.length} سؤال
                </span>
            </div>
        }
      >
        <div className="flex items-center gap-5 bg-on-surface p-6 rounded-[2rem] shadow-2xl ring-4 ring-primary/10">
          <Clock3 className="size-8 text-primary animate-pulse" />
          <div className="flex flex-col">
              <span className="text-[10px] font-black text-surface/40 uppercase tracking-widest leading-none mb-1">الزمن المتبقي</span>
              <span className="text-4xl font-black text-surface tabular-nums tracking-tighter leading-none">
                {formatTime()}
              </span>
          </div>
        </div>
      </SectionHeader>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8 space-y-8">
          <Card className="border-none shadow-premium rounded-[3rem] overflow-hidden bg-surface-container-lowest ring-1 ring-border/40">
            <CardContent className="space-y-12 py-16 px-12">
              <div className="flex items-center justify-between border-b border-border/40 pb-8">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-black">
                          {currentQuestionIdx + 1}
                      </div>
                      <span className="text-sm font-black text-on-surface uppercase tracking-widest">من أصل {questions.length}</span>
                  </div>
                  <Button variant="ghost" className="text-on-surface-variant gap-3 rounded-2xl hover:bg-surface-container-high font-black uppercase text-xs tracking-wider">
                    <Flag className="size-5" />
                    بانتظار المراجعة
                  </Button>
              </div>

              <h2 className="text-4xl font-black leading-snug text-on-surface text-right pr-8 relative">
                <div className="absolute top-0 right-0 w-2 h-full bg-primary rounded-full" />
                {currentQuestion.text}
              </h2>

              <div className="grid grid-cols-1 gap-5">
                {currentQuestion.options.map((option, idx) => {
                  const letters = ["أ", "ب", "ج", "د"];
                  const isSelected = answers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateAnswer(currentQuestion.id, idx)}
                      className={`flex w-full items-center justify-between rounded-[2.5rem] border-2 px-10 py-8 text-right transition-all group shadow-sm ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-8 ring-primary/5"
                          : "border-border/40 bg-surface-container-low hover:border-primary/20 hover:scale-[1.02]"
                      }`}
                    >
                      <div className="flex items-center gap-8">
                        <div className={`flex size-12 items-center justify-center rounded-2xl border-4 transition-all duration-500 ${
                            isSelected ? "border-primary bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "border-outline-variant/30 text-on-surface-variant group-hover:border-primary/30"
                          }`}>
                          {isSelected ? <Check className="size-7 stroke-[4]" /> : null}
                        </div>
                        <span className="text-2xl font-black text-on-surface tracking-tight">{option}</span>
                      </div>
                      <span className={`size-14 flex items-center justify-center rounded-[1.5rem] text-2xl font-black transition-all duration-500 ${
                          isSelected ? "bg-primary text-white shadow-2xl shadow-primary/30" : "bg-surface-container-high text-on-surface-variant group-hover:bg-primary/10"
                        }`}>
                        {letters[idx]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <footer className="flex items-center justify-between gap-8">
            <Button
              variant="outline"
              size="lg"
              className="h-20 rounded-[2rem] flex-1 border-4 font-black text-xl gap-4 hover:bg-surface-container-high transition-all"
              onClick={() => setCurrentQuestionIdx((prev) => Math.max(prev - 1, 0))}
              disabled={currentQuestionIdx === 0}
            >
              السؤال السابق
              <ArrowRight className="size-7" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className={`h-20 rounded-[2rem] flex-1 border-4 font-black text-xl gap-4 transition-all ${!isAnswered ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-primary hover:text-primary shadow-2xl shadow-primary/10 hover:scale-[1.02]'}`}
              onClick={() => setCurrentQuestionIdx((prev) => Math.min(prev + 1, questions.length - 1))}
              disabled={currentQuestionIdx === questions.length - 1 || !isAnswered}
            >
              السؤال التالي
              <ArrowLeft className="size-7" />
            </Button>
          </footer>
        </section>

        <aside className="lg:col-span-4 space-y-10">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-surface-container-lowest ring-1 ring-border/40">
            <CardContent className="py-10 px-10 space-y-8">
              <h3 className="text-2xl font-black text-on-surface flex items-center gap-3">
                <FileQuestion className="size-7 text-primary" />
                رادار الاختبار
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                        if (idx <= currentQuestionIdx || answers[q.id] !== undefined) {
                            setCurrentQuestionIdx(idx);
                        }
                    }}
                    disabled={idx > currentQuestionIdx && answers[questions[idx-1]?.id] === undefined}
                    className={`h-16 rounded-2xl border-2 text-xl font-black transition-all relative ${
                      idx === currentQuestionIdx
                        ? "border-primary bg-primary text-white shadow-2xl shadow-primary/30 scale-110 z-10"
                        : answers[q.id] !== undefined
                          ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/20"
                          : "border-border/20 bg-surface-container-low text-on-surface-variant opacity-30 cursor-not-allowed"
                    }`}
                  >
                    {idx + 1}
                    {answers[q.id] !== undefined && idx !== currentQuestionIdx && (
                        <div className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                            <Check className="size-3 stroke-[3]" />
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl rounded-[3rem] bg-surface-container-lowest overflow-hidden ring-1 ring-border/40">
            <div className="h-4 bg-primary/10 w-full overflow-hidden">
                 <div className="h-full bg-primary transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <CardContent className="space-y-8 py-10 px-10 text-center">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">اكتمال الحل</span>
                <span className="font-black text-primary text-5xl tracking-tighter tabular-nums">{progress}%</span>
              </div>
              <p className="text-sm text-on-surface-variant font-bold leading-relaxed px-4">
                تم تثبيت إجابة <span className="text-primary font-black underline underline-offset-4">{Object.keys(answers).length}</span> سؤال بنجاح في النظام.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-4">
              <LoadingButton
                className="w-full h-24 rounded-[2.5rem] text-3xl font-black shadow-premium bg-gradient-to-br from-on-surface to-surface-variant text-surface hover:from-primary hover:to-primary transition-all active:scale-95 shadow-2xl shadow-primary/20"
                onClick={handleSubmit}
                loading={isSubmitting}
                variant="default"
                disabled={Object.keys(answers).length < questions.length}
              >
                تسليم الإجابات
              </LoadingButton>
              
              {Object.keys(answers).length < questions.length && (
                  <div className="flex items-center justify-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-pulse">
                    <AlertCircle className="size-4 text-amber-600" />
                    <p className="text-[10px] text-amber-900 font-black uppercase tracking-wider">
                        بانتظار إكمال جميع الأسئلة للمزامنة النهائية
                    </p>
                  </div>
              )}
          </div>
        </aside>
      </div>
    </div>
  );
}
