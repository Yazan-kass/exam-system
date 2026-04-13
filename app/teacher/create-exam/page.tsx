"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { 
  ArrowLeft, 
  CheckCircle, 
  FileQuestion, 
  Check,
  Calendar,
  Clock,
  Loader2,
  Settings,
  ListChecks,
  AlertCircle
} from "lucide-react";
import { ExamForm } from "../../../components/ExamForm";
import { SectionHeader } from "../../../components/SectionHeader";
import { useAuth } from "../../../context/AuthContext";
import { Timestamp } from "firebase/firestore";
import { StatusBadge } from "../../../components/StatusBadge";
import { Card, CardContent } from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import { EmptyState } from "../../../components/EmptyState";
import { LoadingButton } from "../../../components/LoadingButton";

import { examService, QuestionDTO } from "../../../lib/services/exam.service";
import { notificationService } from "../../../lib/services/notification.service";
import { useFetch } from "../../../lib/hooks/useFetch";
import { handleError } from "../../../lib/utils/error-handler";

type Step = "setup" | "questions";

interface ExamSettings {
  title: string;
  duration: number;
  subjectId: string;
  startTime: string;
  endTime: string;
}

export default function CreateExamPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  
  const [step, setStep] = useState<Step>("setup");
  const [settings, setSettings] = useState<ExamSettings | null>(null);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);

  // Declarative Question Fetching (Step 2)
  const fetchQuestions = useCallback(() => {
    if (step === "questions" && settings?.subjectId) {
      return examService.getQuestions(settings.subjectId);
    }
    return Promise.resolve([]);
  }, [step, settings?.subjectId]);

  const { data: availableQuestions, isLoading: loadingQuestions, error: fetchError } = useFetch(
    fetchQuestions,
    [step, settings?.subjectId]
  );

  // Auth Protection
  useEffect(() => {
    if (!authLoading && role !== "teacher") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  const handleSaveSettings = (data: ExamSettings) => {
    setSettings(data);
    setStep("questions");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleFinalize = async () => {
    if (!settings || !user) return;
    if (selectedQuestionIds.length === 0) {
      alert("يرجى اختيار سؤال واحد على الأقل للمشاركة في هذا الاختبار.");
      return;
    }

    setIsFinishing(true);
    try {
      // 1. Save via Repository Pattern (Handles subject examsCount internally)
      await examService.createExam({
        title: settings.title,
        subjectId: settings.subjectId,
        teacherId: user.uid,
        duration: settings.duration,
        questionIds: selectedQuestionIds,
        startTime: new Date(settings.startTime),
        endTime: new Date(settings.endTime),
      });

      // 2. Dispatch Global Notification
      await notificationService.notifyAllStudents(
        `🚀 اختبار جديد متاح: ${settings.title}`,
        `قام الأستاذ بجدولة اختبار جديد لمادة تخصصك. موعد البدء: ${new Date(settings.startTime).toLocaleString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}`
      );

      router.push("/teacher");
    } catch (error) {
      const appErr = handleError(error);
      alert(appErr.message);
    } finally {
      setIsFinishing(false);
    }
  };

  if (authLoading || (role && role !== "teacher")) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      
      {/* Wizard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${step === 'setup' ? 'bg-primary text-on-primary' : 'bg-primary/10 text-primary'}`}>
                    <Settings className="size-5" />
                </div>
                <div className="h-0.5 w-8 bg-border" />
                <div className={`p-2 rounded-lg ${step === 'questions' ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    <ListChecks className="size-5" />
                </div>
              </div>
              <h1 className="text-5xl font-black text-on-surface tracking-tighter">
                {step === "setup" ? "تهيئة بيئة الاختبار" : `بناء المحتوى: ${settings?.title}`}
              </h1>
              <p className="text-on-surface-variant max-w-xl font-medium opacity-60">
                {step === "setup" 
                    ? "حدد الإطارات الزمنية، المضمون الأكاديمي، والمعايير اللوجستية لهذا التقييم." 
                    : "اختر الأسئلة التي تعكس الأهداف التعليمية لهذا الاختبار من بنك الأسئلة الخاص بالمادة."}
              </p>
          </div>
          <div className="flex gap-4 items-center">
            <Button 
                variant="ghost" 
                onClick={() => step === "setup" ? router.push("/teacher") : setStep("setup")} 
                className="rounded-2xl h-14 px-8 border-2 border-border/40 font-black hover:bg-surface-container-high transition-all"
            >
                <ArrowLeft className="ml-3 size-5" />
                {step === "setup" ? "العودة للقيادة" : "تعديل المعايير"}
            </Button>
            {step === "questions" && (
                <LoadingButton 
                    onClick={handleFinalize} 
                    loading={isFinishing}
                    className="h-14 rounded-2xl px-10 font-black bg-on-surface text-surface hover:bg-primary hover:text-on-primary transition-all shadow-2xl shadow-primary/20 text-lg"
                >
                    <CheckCircle className="ml-3 size-6" />
                    اعتماد وجدولة
                </LoadingButton>
            )}
          </div>
      </div>
      
      {step === "setup" ? (
          <div className="max-w-4xl mx-auto">
            <Card className="border-none shadow-premium rounded-[3rem] bg-surface-container-lowest p-10 ring-1 ring-border/40">
                <ExamForm onSave={handleSaveSettings} initialData={settings || undefined} />
            </Card>
          </div>
      ) : (
          <div className="space-y-10">
             {/* Dynamic Summary Dashboard */}
             <Card className="border-none bg-on-surface text-surface rounded-[2.5rem] shadow-premium overflow-hidden">
                 <CardContent className="p-10 flex flex-wrap items-center justify-between gap-8">
                    <div className="flex flex-wrap items-center gap-8">
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-surface/40 uppercase tracking-widest">نوع التقييم</span>
                          <StatusBadge variant="default" className="text-xs px-4 py-1.5 rounded-full bg-surface/10 border-surface/20">اختبار نهائي</StatusBadge>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-surface/40 uppercase tracking-widest">المدة المقررة</span>
                          <div className="flex items-center gap-2 font-black text-xl text-primary">
                             <Clock className="size-5" />
                             {settings?.duration} دقيقة
                          </div>
                       </div>
                       <div className="space-y-1">
                          <span className="text-[10px] font-black text-surface/40 uppercase tracking-widest">الأسئلة المختارة</span>
                          <div className="flex items-center gap-2 font-black text-xl text-secondary">
                             <CheckCircle className="size-5" />
                             {selectedQuestionIds.length} من {availableQuestions?.length || 0}
                          </div>
                       </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end opacity-60">
                       <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
                          <Calendar className="size-4" /> 
                          بداية: {new Date(settings!.startTime).toLocaleString('ar-EG')}
                       </div>
                       <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
                          <Calendar className="size-4" /> 
                          نهاية: {new Date(settings!.endTime).toLocaleString('ar-EG')}
                       </div>
                    </div>
                 </CardContent>
             </Card>

             {/* Questions Explorer */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {loadingQuestions ? (
                   Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-56 rounded-[2.5rem]" />)
                ) : fetchError ? (
                    <div className="col-span-full">
                         <EmptyState title="خطأ في النظام" description={fetchError.message} icon={AlertCircle} />
                    </div>
                ) : !availableQuestions || availableQuestions.length === 0 ? (
                  <div className="col-span-full">
                    <EmptyState 
                      title="بنك الأسئلة خالٍ لهذه المادة"
                      description="يجب عليك تزويد المادة بالأسئلة اللازمة قبل البدء في تصميم الاختبارات."
                      icon={FileQuestion}
                      action={{
                        label: "الذهاب لبنك الأسئلة",
                        onClick: () => router.push("/teacher/manage-questions")
                      }}
                    />
                  </div>
                ) : (
                  availableQuestions.map((q) => (
                    <Card 
                      key={q.id} 
                      onClick={() => toggleQuestion(q.id)}
                      className={`cursor-pointer transition-all duration-500 border-none rounded-[2.5rem] overflow-hidden group relative ${
                        selectedQuestionIds.includes(q.id) 
                        ? "bg-secondary text-on-secondary shadow-2xl scale-[1.02]" 
                        : "bg-surface-container-lowest border-border/40 hover:bg-surface-container-low"
                      }`}
                    >
                      <CardContent className="p-10 space-y-6">
                        <div className="flex items-center justify-between">
                           <StatusBadge variant={selectedQuestionIds.includes(q.id) ? "default" : "secondary"} className="px-5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest">
                             {selectedQuestionIds.includes(q.id) ? "مدرج في الاختبار" : "متاح للإدراج"}
                           </StatusBadge>
                           <div className={`size-10 rounded-2xl border-4 flex items-center justify-center transition-all duration-500 ${
                              selectedQuestionIds.includes(q.id) ? "bg-surface border-surface text-secondary shadow-lg" : "border-border/40 group-hover:border-primary/40"
                           }`}>
                              {selectedQuestionIds.includes(q.id) && <Check className="size-6 stroke-[4]" />}
                           </div>
                        </div>
                        <p className="text-2xl font-black leading-snug tracking-tight line-clamp-3">
                          {q.text}
                        </p>
                        <div className="flex gap-3 flex-wrap">
                           {q.options.slice(0, 2).map((opt, i) => (
                             <div key={i} className={`text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-3 ${selectedQuestionIds.includes(q.id) ? 'bg-surface/10 border-surface/20' : 'bg-surface-container-high border-border/10 border'}`}>
                                <div className={`size-2 rounded-full ${i === q.correctAnswer ? (selectedQuestionIds.includes(q.id) ? "bg-surface" : "bg-primary") : "bg-on-surface-variant/20"}`} />
                                <span className="uppercase tracking-wide">{opt}</span>
                             </div>
                           ))}
                           {q.options.length > 2 && <div className="text-[9px] font-black opacity-40 px-2 py-1">+ {q.options.length - 2} عينات أخرى</div>}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
             </div>
          </div>
      )}
    </div>
  );
}
