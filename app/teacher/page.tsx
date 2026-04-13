"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  BarChart3,
  BookOpen,
  FileText,
  Users,
  Plus,
  CalendarClock,
  History,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  LayoutDashboard,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { LoadingButton } from "../../components/LoadingButton";
import { StatCard } from "../../components/StatCard";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SubjectCard } from "../../components/SubjectCard";
import { EmptyState } from "../../components/EmptyState";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";

import { examService, SubjectDTO, ExamDTO, QuestionDTO } from "../../lib/services/exam.service";
import { useFetch } from "../../lib/hooks/useFetch";
import { handleError } from "../../lib/utils/error-handler";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function TeacherDashboard() {
  const { role, loading: authLoading, user, profile } = useAuth();
  const router = useRouter();

  // Subject Modal State
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDTO | null>(null);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [subjectCategory, setSubjectCategory] = useState("");
  const [isSavingSubject, setIsSavingSubject] = useState(false);

  // Declarative Data Fetching
  const { data: subjects, isLoading: subjectsLoading, refetch: refetchSubjects } = useFetch(
    () => examService.getSubjects()
  );

  const { data: exams, isLoading: examsLoading, refetch: refetchExams } = useFetch(
    () => user?.uid ? examService.getExams(user.uid) : Promise.resolve([]),
    [user?.uid]
  );

  const { data: questions, isLoading: questionsLoading } = useFetch(
    () => examService.getQuestions()
  );

  // Dynamic Statistics Calculation
  const fetchStats = useCallback(async () => {
    if (!user?.uid) return null;
    try {
      const resultsRef = collection(db, "results");
      const q = query(resultsRef, where("teacherId", "==", user.uid));
      const snap = await getDocs(q);
      
      const results = snap.docs.map(d => d.data());
      const uniqueStudents = new Set(results.map(r => r.studentId)).size;
      
      let totalPercent = 0;
      results.forEach(r => {
        if (r.totalQuestions > 0) totalPercent += (r.score / r.totalQuestions) * 100;
      });
      
      const avgScore = results.length > 0 ? Math.round(totalPercent / results.length) : 0;
      
      return { uniqueStudents, avgScore };
    } catch (err) {
      console.error("Dashboard stats error:", err);
      return { uniqueStudents: 0, avgScore: 0 };
    }
  }, [user?.uid]);

  const { data: teacherStats, isLoading: statsLoading } = useFetch(fetchStats, [user?.uid]);

  useEffect(() => {
    if (!authLoading && role !== "teacher") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  const handleSaveSubject = async () => {
    if (!subjectTitle.trim()) return;
    setIsSavingSubject(true);
    try {
      if (editingSubject) {
        await examService.updateSubject(editingSubject.id, { 
          title: subjectTitle, 
          description: subjectCategory 
        });
      } else {
        await examService.createSubject({ 
          title: subjectTitle, 
          description: subjectCategory
        });
      }
      refetchSubjects();
      setIsSubjectModalOpen(false);
      resetSubjectForm();
    } catch (error) {
      const appErr = handleError(error);
      alert(appErr.message);
    } finally {
      setIsSavingSubject(false);
    }
  };

  const handleDeleteSubject = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف مادة "${title}"؟`)) return;
    try {
      await examService.deleteSubject(id);
      refetchSubjects();
    } catch (error) {
      handleError(error);
    }
  };

  const resetSubjectForm = () => {
    setEditingSubject(null);
    setSubjectTitle("");
    setSubjectCategory("");
  };

  const openEditSubject = (subject: SubjectDTO) => {
    setEditingSubject(subject);
    setSubjectTitle(subject.title);
    setSubjectCategory(subject.description || "");
    setIsSubjectModalOpen(true);
  };

  if (authLoading || (role && role !== "teacher")) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <Card className="border-none shadow-premium bg-on-surface rounded-[2.5rem] overflow-hidden group">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-12 py-14 px-12">
            <div className="space-y-6 flex-1">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
                    <LayoutDashboard className="size-4" />
                    مركز القيادة التربوي
                </div>
                <h1 className="text-5xl font-black text-surface tracking-tighter">
                    أهلاً بك، <span className="text-primary">أستاذ {profile?.name?.split(' ')[0] || "المبدع"}</span> 👋
                </h1>
                <p className="text-lg font-medium text-surface/60 max-w-xl leading-relaxed">
                    إليك ملخص للأداء الأكاديمي الحالي لطلابك. يمكنك إدارة المواد، الأسئلة، ومراقبة النتائج لحظياً.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                    <Button 
                        size="lg"
                        onClick={() => router.push("/teacher/create-exam")}
                        className="h-16 rounded-2xl px-10 bg-primary text-on-primary font-black text-lg shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] hover:shadow-primary/30"
                    >
                        <Plus className="ml-3 size-6" />
                        إنشاء اختبار استراتيجي
                    </Button>
                    <Button 
                         variant="ghost"
                         size="lg"
                         onClick={() => router.push("/teacher/manage-questions")}
                         className="h-16 rounded-2xl px-10 border-2 border-surface/10 text-surface font-black text-lg hover:bg-surface/5"
                    >
                        <BookOpen className="ml-3 size-6" />
                        بنك الأسئلة
                    </Button>
                </div>
            </div>
            <div className="size-64 rounded-[3rem] bg-surface/5 border border-surface/10 flex items-center justify-center p-8 backdrop-blur-3xl group-hover:rotate-6 transition-transform duration-700">
                <div className="size-full rounded-[2rem] bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="size-24 text-primary opacity-80" />
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Stats Section */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading || subjectsLoading || examsLoading ? (
             Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
            <>
                <StatCard title="المواد التعليمية" value={subjects?.length || 0} icon={BookOpen} color="primary" />
                <StatCard title="إجمالي الطلاب" value={teacherStats?.uniqueStudents || 0} icon={Users} color="secondary" />
                <StatCard title="الاختبارات النشطة" value={exams?.length || 0} icon={FileText} color="tertiary" />
                <StatCard title="متوسط الأداء" value={`${teacherStats?.avgScore || 0}%`} icon={BarChart3} color="primary" />
            </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-10 xl:grid-cols-12">
        
        {/* Sidebar Actions */}
        <aside className="xl:col-span-4 space-y-10">
           <Card className="border-none shadow-premium rounded-[2.5rem] bg-surface-container-lowest overflow-hidden">
             <CardHeader className="bg-surface-container-low/30 border-b border-border/40 py-8 px-8">
               <CardTitle className="text-xl font-black flex items-center gap-3">
                   <CalendarClock className="size-6 text-primary" />
                   العمليات السريعة
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-6 p-8">
               <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-surface-container-low border border-border/40 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => router.push("/teacher/create-exam")}>
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Plus className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-on-surface">جدولة اختبار</h4>
                                <p className="text-[10px] text-on-surface-variant font-medium">تحديد الموعد والأسئلة</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface-container-low border border-border/40 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => router.push("/teacher/view-results")}>
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <History className="size-5" />
                            </div>
                            <div>
                                <h4 className="font-black text-sm text-on-surface">أرشيف النتائج</h4>
                                <p className="text-[10px] text-on-surface-variant font-medium">مراقبة تقدم الطلاب</p>
                            </div>
                        </div>
                    </div>
               </div>
               <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 flex items-start gap-4">
                    <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs font-bold leading-relaxed text-primary opacity-80">
                        لضمان نزاهة الاختبارات، يرجى مراجعة بنك الأسئلة والتأكد من تنوع النماذج التعليمية لكل مادة.
                    </p>
               </div>
             </CardContent>
           </Card>
        </aside>

        <main className="xl:col-span-8 space-y-10">
          {/* Subjects Management */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] bg-surface-container-lowest overflow-hidden">
            <CardHeader className="bg-surface-container-low/30 border-b border-border/40 py-8 px-10">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-4 text-2xl font-black text-on-surface">
                  <BookOpen className="size-8 text-primary" />
                  منظومة المواد التعليمية
                </span>
                <Dialog open={isSubjectModalOpen} onOpenChange={(open) => {
                  setIsSubjectModalOpen(open);
                  if (!open) resetSubjectForm();
                }}>
                  <DialogTrigger className="inline-flex items-center justify-center h-12 rounded-2xl px-6 bg-on-surface text-surface hover:bg-on-surface/90 font-black gap-3 shadow-xl transition-all">
                      <Plus className="size-5" />
                      إضافة مادة
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] border-none shadow-2xl p-10 max-w-lg" dir="rtl">
                    <DialogHeader className="mb-6">
                      <DialogTitle className="text-3xl font-black tracking-tight text-on-surface">
                        {editingSubject ? "تحديث المادة" : "توسيع المكتبة التعليمية"}
                      </DialogTitle>
                      <p className="text-sm font-medium text-on-surface-variant opacity-60">أدخل تفاصيل المادة الجديدة لتبدأ بربط الاختبارات والأسئلة بها.</p>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="font-black text-sm text-on-surface ml-2">اسم المادة الأكاديمية</Label>
                        <Input 
                          placeholder="مثال: فيزياء الكم، الأدب الجاهلي" 
                          value={subjectTitle}
                          onChange={(e) => setSubjectTitle(e.target.value)}
                          className="rounded-2xl h-14 bg-surface-container-low border-border/40 font-bold focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label className="font-black text-sm text-on-surface ml-2">التصنيف أو الوصف الموجز</Label>
                        <Input 
                          placeholder="مثال: العلوم الطبيعية - المستوى المتقدم" 
                          value={subjectCategory}
                          onChange={(e) => setSubjectCategory(e.target.value)}
                          className="rounded-2xl h-14 bg-surface-container-low border-border/40 font-bold focus:ring-4 focus:ring-primary/10"
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-10 gap-4 flex-row-reverse sm:flex-row-reverse">
                      <Button variant="ghost" onClick={() => setIsSubjectModalOpen(false)} className="rounded-2xl h-14 px-10 font-black text-on-surface-variant">إلغاء</Button>
                      <LoadingButton onClick={handleSaveSubject} loading={isSavingSubject} className="rounded-2xl h-14 px-10 font-black bg-primary text-on-primary shadow-xl shadow-primary/20">
                        {editingSubject ? "تحديث البيانات" : "تأكيد الإضافة"}
                      </LoadingButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-10 px-10 pb-10">
              {subjectsLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}
                </div>
              ) : !subjects || subjects.length === 0 ? (
                <EmptyState 
                  title="لا توجد مواد حالياً"
                  description="ابدأ بإضافة موادك الدراسية لتربط بها الأسئلة والاختبارات."
                  icon={BookOpen}
                />
              ) : (
                <div className="grid grid-cols-1 gap-5">
                    {subjects.map((subject) => {
                      const subjectQuestionsCount = questions?.filter(q => q.subjectId === subject.id).length || 0;
                      const subjectExamsCount = exams?.filter(e => e.subjectId === subject.id).length || 0;
                      
                      return (
                        <SubjectCard 
                          key={subject.id}
                          title={subject.title}
                          description={subject.description || ""}
                          icon={BookOpen}
                          examCount={subjectExamsCount}
                          questionCount={subjectQuestionsCount}
                          isTeacher={true}
                          onEdit={() => openEditSubject(subject)}
                          onDelete={() => handleDeleteSubject(subject.id, subject.title)}
                        />
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
