"use client";

import { useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  BookOpen, 
  ArrowRight, 
  Clock3, 
  FileText, 
  User as TeacherIcon,
  HelpCircle,
  Calendar,
  AlertCircle
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Skeleton } from "../../../../components/ui/skeleton";
import { SectionHeader } from "../../../../components/SectionHeader";
import { EmptyState } from "../../../../components/EmptyState";
import { StatusBadge } from "../../../../components/StatusBadge";

import { examService } from "../../../../lib/services/exam.service";
import { useAuth } from "../../../../context/AuthContext";
import { useFetch } from "../../../../lib/hooks/useFetch";

export default function SubjectDetailPage() {
  const router = useRouter();
  const { subjectId } = useParams() as { subjectId: string };
  const { role, loading: authLoading } = useAuth();

  // Declarative Data Fetching
  const fetchSubjectData = useCallback(async () => {
    if (!subjectId) return null;
    const [subject, exams] = await Promise.all([
      examService.getSubjectById(subjectId),
      examService.getExamsBySubject(subjectId)
    ]);
    return { subject, exams };
  }, [subjectId]);

  const { data, isLoading: dataLoading, error } = useFetch(fetchSubjectData, [subjectId]);

  if (authLoading || (role && role !== "student")) return null;

  if (dataLoading) {
    return (
      <div className="space-y-10 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="space-y-4 w-1/2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-6 w-2/3" />
            </div>
            <Skeleton className="h-24 w-40 rounded-3xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-8 space-y-6">
                <Skeleton className="h-64 rounded-[2rem]" />
                <Skeleton className="h-32 rounded-3xl" />
            </div>
            <div className="md:col-span-4">
                <Skeleton className="h-96 rounded-[2rem]" />
            </div>
        </div>
      </div>
    );
  }

  if (error || !data?.subject) {
    return (
      <div className="py-20">
        <EmptyState 
          title={error ? "خطأ في النظام" : "المادة غير موجودة"} 
          description={error ? "نعتذر، حدث خطأ أثناء جلب البيانات." : "عذراً، لم نتمكن من العثور على بيانات هذه المادة."} 
          icon={error ? AlertCircle : BookOpen}
          action={{
            label: "العودة للمواد",
            onClick: () => router.push("/student/subjects")
          }}
        />
      </div>
    );
  }

  const { subject, exams } = data;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 py-4">
        <div className="space-y-3">
            <Button 
                variant="ghost" 
                size="sm" 
                className="text-on-surface-variant hover:text-primary gap-3 p-0 h-auto font-black mb-2 transition-all hover:-translate-x-1"
                onClick={() => router.push("/student/subjects")}
            >
                <ArrowRight className="size-4" />
                العودة لقائمة المواد
            </Button>
            <h1 className="text-5xl font-black text-on-surface tracking-tighter">{subject.title}</h1>
            <p className="text-on-surface-variant max-w-2xl text-lg font-medium leading-relaxed">{subject.description}</p>
        </div>
        <div className="flex items-center gap-5 bg-surface-container-lowest p-6 rounded-[2.5rem] border border-border/40 shadow-xl ring-1 ring-primary/5">
            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen className="size-8" />
            </div>
            <div>
                <span className="block text-3xl font-black text-on-surface leading-none mb-1">{exams.length}</span>
                <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">إجمالي الاختبارات</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Exams List */}
        <div className="lg:col-span-8 space-y-8">
            <SectionHeader 
                title="المسار التقييمي" 
                description="استعرض كافة الاختبارات المجدولة لهذه المادة للتحضير المسبق."
            />

            {exams.length === 0 ? (
                <Card className="border-none shadow-premium rounded-[3rem] bg-surface-container-lowest overflow-hidden">
                    <CardContent className="py-24 text-center">
                        <div className="size-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto mb-8">
                            <FileText className="size-12 text-on-surface-variant/20" />
                        </div>
                        <h3 className="text-2xl font-black text-on-surface mb-3 tracking-tight">لا توجد اختبارات حالياً</h3>
                        <p className="text-on-surface-variant max-w-xs mx-auto font-bold opacity-70">لم يتم إدراج أي اختبارات لهذه المادة بعد. المنهج قيد التحديث المستمر.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {exams.map(ex => (
                        <Card key={ex.id} className="border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-surface-container-lowest group relative">
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="flex items-center gap-8 flex-1">
                                    <div className="size-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                                        <FileText className="size-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors tracking-tight">{ex.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black text-on-surface-variant uppercase tracking-tighter">
                                            <span className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-xl border border-border/20">
                                                <TeacherIcon className="size-3.5" />
                                                {ex.teacherName || "المعلم"}
                                            </span>
                                            <span className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-xl border border-border/20">
                                                <Clock3 className="size-3.5" />
                                                {ex.duration} دقيقة
                                            </span>
                                            <span className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-xl border border-border/20">
                                                <HelpCircle className="size-3.5" />
                                                {ex.questionIds.length} سؤال
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0">
                                    <div className="text-[11px] font-black text-primary uppercase tracking-widest flex items-center gap-2 border-b border-primary/20 pb-1 w-full md:w-auto justify-end">
                                        <Calendar className="size-3.5" />
                                        {ex.startTime.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}
                                    </div>
                                    <StatusBadge variant="default" className="px-8 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">للاطلاع فقط</StatusBadge>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>

        {/* Info Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-on-surface text-surface overflow-hidden group">
                <CardHeader className="bg-surface/5 border-b border-surface/10 py-10 px-10">
                    <CardTitle className="text-xl font-black flex items-center gap-3 text-primary uppercase tracking-widest">
                        <AlertCircle className="size-6" />
                        بروتوكول النظام
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <p className="text-md font-bold leading-relaxed opacity-80">
                        مرحباً بك في مركز استعراض المادة. تم تصميم هذه الواجهة لمساعدتك في التخطيط الأكاديمي.
                    </p>
                    <div className="space-y-6">
                        <div className="flex gap-5 p-6 rounded-3xl bg-surface/5 border border-surface/10 hover:bg-surface/10 transition-colors">
                            <Clock3 className="size-6 shrink-0 mt-1 text-primary" />
                            <div className="text-sm space-y-2">
                                <p className="font-black text-surface tracking-wide">التقديم الفعلي</p>
                                <p className="leading-relaxed opacity-60 text-xs font-medium">الوصول لبيئة الاختبار متاح حصرياً في الموعد المحدد عبر **لوحة التحكم الرئيسية**.</p>
                            </div>
                        </div>
                        <div className="flex gap-5 p-6 rounded-3xl bg-surface/5 border border-surface/10 hover:bg-surface/10 transition-colors">
                            <Calendar className="size-6 shrink-0 mt-1 text-secondary" />
                            <div className="text-sm space-y-2">
                                <p className="font-black text-surface tracking-wide">سياسة المحاولات</p>
                                <p className="leading-relaxed opacity-60 text-xs font-medium">لكل اختبار محاولة رسمية واحدة فقط. تأكد من استقرار تجهيزاتك قبل البدء.</p>
                            </div>
                        </div>
                    </div>
                    <Button 
                        className="w-full h-16 rounded-[2rem] bg-primary text-on-primary hover:bg-primary/90 font-black text-xl shadow-xl transition-all hover:scale-[1.02]"
                        onClick={() => router.push("/student")}
                    >
                        العودة للوحة القيادة
                    </Button>
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
