"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock3,
  Award,
  ArrowRight,
  BookOpen,
  PieChart,
  User as TeacherIcon,
  HelpCircle,
} from "lucide-react";
import { SectionHeader } from "../../../../components/SectionHeader";
import { StatusBadge } from "../../../../components/StatusBadge";
import { EmptyState } from "../../../../components/EmptyState";

import { useAuth } from "../../../../context/AuthContext";
import { examService, QuestionDTO as Question, ResultDTO as Result, ExamDTO as Exam } from "../../../../lib/services/exam.service";
import { handleError } from "../../../../lib/utils/error-handler";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

export default function ResultReviewPage() {
  const router = useRouter();
  const { resultId } = useParams() as { resultId: string };
  const { user, role, loading: authLoading } = useAuth();

  const [result, setResult] = useState<Result | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResultData = useCallback(async () => {
    if (!resultId) return;
    setLoading(true);
    try {
      const resultData = await examService.getResultById(resultId);
      if (resultData) {
        setResult(resultData);

        // Fetch Exam & Questions for review
        const examData = await examService.getExamById(resultData.examId);
        if (examData) {
          setExam(examData);
          const allQuestions = await examService.getQuestions(examData.subjectId);
          const mappedQuestions = allQuestions.filter(q => examData.questionIds.includes(q.id));
          setQuestions(mappedQuestions);
        }
      }
    } catch (error) {
      const appErr = handleError(error);
      alert(appErr.message);
    } finally {
      setLoading(false);
    }
  }, [resultId]);

  useEffect(() => {
    if (user && role === "student") {
      fetchResultData();
    }
  }, [user, role, fetchResultData]);

  if (authLoading || (role && role !== "student")) return null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-16 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold text-on-surface-variant animate-pulse">جاري تحميل مراجعة الاختبار...</p>
      </div>
    );
  }

  if (!result || !exam) {
    return (
      <div className="py-20 text-center space-y-6">
        <EmptyState 
          title="لم يتم العثور على النتيجة" 
          description="عذراً، قد يكون الرابط غير صحيح أو تم مسح النتيجة." 
          icon={PieChart} 
        />
      </div>
    );
  }

  const percentage = Math.round((result.score / result.totalQuestions) * 100);
  const isPassed = percentage >= 50;

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
      
      {/* Result Header Card */}
      <section>
        <Card className={`border-none shadow-premium overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${isPassed ? 'from-emerald-50 to-green-100/50' : 'from-rose-50 to-red-100/50'}`}>
          <CardContent className="p-12">
            <div className="flex flex-col md:flex-row items-center gap-12">
               {/* Score Circle */}
               <div className="relative size-48 flex items-center justify-center">
                 <svg className="size-full -rotate-90">
                   <circle 
                     cx="96" cy="96" r="88" 
                     className="fill-none stroke-white/40 stroke-[12]" 
                   />
                   <circle 
                     cx="96" cy="96" r="88" 
                     className={`fill-none stroke-[12] transition-all duration-[2000ms] delay-500 ease-out`}
                     style={{
                        stroke: isPassed ? '#10b981' : '#f43f5e',
                        strokeDasharray: 553,
                        strokeDashoffset: 553 - (553 * percentage) / 100,
                        strokeLinecap: 'round'
                     }}
                   />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-black text-on-surface tracking-tighter">{percentage}%</span>
                    <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">{isPassed ? 'ناجح' : 'راسب'}</span>
                 </div>
               </div>

               {/* Summary Info */}
               <div className="flex-1 space-y-6 text-center md:text-right">
                  <div className="space-y-2">
                    <h1 className="text-4xl font-black text-on-surface">{result.examName}</h1>
                    <p className="text-lg text-on-surface-variant font-medium flex items-center justify-center md:justify-start gap-2">
                        <TeacherIcon className="size-5" />
                        بإشراف المعلم: {exam.teacherName || "غير محدد"}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                        <Award className="size-5 text-amber-500 mb-2 mx-auto md:mx-0" />
                        <span className="block text-xl font-bold text-on-surface">{result.score}/{result.totalQuestions}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase">الدرجة النهائية</span>
                     </div>
                     <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                        <Clock3 className="size-5 text-blue-500 mb-2 mx-auto md:mx-0" />
                        <span className="block text-xl font-bold text-on-surface">{result.duration}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase">وقت الحل</span>
                     </div>
                     <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                        <CheckCircle2 className="size-5 text-emerald-500 mb-2 mx-auto md:mx-0" />
                        <span className="block text-xl font-bold text-on-surface">{result.score}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase">صح</span>
                     </div>
                     <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white shadow-sm">
                        <XCircle className="size-5 text-rose-500 mb-2 mx-auto md:mx-0" />
                        <span className="block text-xl font-bold text-on-surface">{result.totalQuestions - result.score}</span>
                        <span className="text-[10px] text-on-surface-variant font-bold uppercase">خطأ</span>
                     </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                     <Button 
                        onClick={() => router.push("/student")}
                        variant="outline"
                        className="rounded-xl px-8 h-12 font-bold border-2"
                     >
                        <ArrowRight className="size-5 mr-2" />
                        العودة للوحة التحكم
                     </Button>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Review Questions Section */}
      <section className="space-y-8">
         <SectionHeader 
            title="مراجعة الإجابات" 
            description="اللون الأخضر يشير للإجابة الصحيحة، واللون الأحمر يشير لإجابتك الخاطئة."
         />

         <div className="space-y-6">
            {questions.map((q, idx) => {
               const studentAns = result.selectedAnswers?.[q.id];
               const isCorrect = studentAns === q.correctAnswer;
               
               return (
                  <Card key={q.id} className="border-none shadow-md rounded-3xl bg-surface-container-lowest overflow-hidden group hover:shadow-xl transition-all duration-500">
                     <CardHeader className="bg-surface-container-low/30 border-b border-border/30 px-8 py-6">
                        <div className="flex items-center justify-between pb-2">
                           <StatusBadge variant="outline" className="font-black px-4">سؤال {idx + 1}</StatusBadge>
                           {isCorrect ? (
                             <span className="flex items-center gap-2 text-emerald-600 font-black text-sm bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                <CheckCircle2 className="size-4" />
                                إجابة صحيحة
                             </span>
                           ) : studentAns === undefined ? (
                             <span className="flex items-center gap-2 text-amber-600 font-black text-sm bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                                <HelpCircle className="size-4" />
                                لم يتم الحل
                             </span>
                           ) : (
                             <span className="flex items-center gap-2 text-rose-600 font-black text-sm bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100">
                                <XCircle className="size-4" />
                                إجابة خاطئة
                             </span>
                           )}
                        </div>
                        <h3 className="text-2xl font-bold text-on-surface leading-normal text-right">{q.text}</h3>
                     </CardHeader>
                     <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {q.options.map((opt, optIdx) => {
                              const letters = ["أ", "ب", "ج", "د"];
                              const isStudentPick = studentAns === optIdx;
                              const isActualCorrect = q.correctAnswer === optIdx;

                              let stateClass = "border-border/40 bg-surface-container-low text-on-surface-variant cursor-not-allowed";
                              if (isActualCorrect) stateClass = "border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20";
                              if (isStudentPick && !isCorrect) stateClass = "border-rose-500 bg-rose-50 text-on-error ring-2 ring-rose-500/20";

                              return (
                                 <div 
                                    key={optIdx}
                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${stateClass}`}
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className={`size-8 rounded-full flex items-center justify-center border-2 text-sm font-black ${
                                            isActualCorrect ? 'bg-emerald-500 text-white border-emerald-500' :
                                            isStudentPick ? 'bg-rose-500 text-white border-rose-500' : 'border-outline-variant'
                                          }`}>
                                          {isActualCorrect ? <CheckCircle2 className="size-5" /> : 
                                           isStudentPick ? <XCircle className="size-5" /> : letters[optIdx]}
                                       </div>
                                       <span className="text-lg font-bold">{opt}</span>
                                    </div>
                                    
                                    {isStudentPick && (
                                        <span className="text-[10px] font-black uppercase px-2 py-1 bg-white/50 rounded-lg">إجابتك</span>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     </CardContent>
                  </Card>
               );
            })}
         </div>
      </section>

    </div>
  );
}
