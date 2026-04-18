"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { QuestionForm } from "../../../components/QuestionForm";
import {
  FileQuestion,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Edit2,
  ArrowLeft,
  ChevronDown,
  BookOpen,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { StatCard } from "../../../components/StatCard";
import { StatusBadge } from "../../../components/StatusBadge";
import { EmptyState } from "../../../components/EmptyState";
import { ConfirmDialog } from "../../../components/ConfirmDialog";
import { LoadingButton } from "../../../components/LoadingButton";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { useAuth } from "../../../context/AuthContext";

// New Services
import { examService, QuestionDTO } from "../../../lib/services/exam.service";
import { useFetch } from "../../../lib/hooks/useFetch";
import { handleError } from "../../../lib/utils/error-handler";

export default function ManageQuestionsPage() {
  const router = useRouter();
  const { role, loading: authLoading } = useAuth();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionDTO | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("all");

  // Declarative Data Fetching
  const { data: subjects, isLoading: subjectsLoading } = useFetch(
    () => examService.getSubjects()
  );

  const { data: questions, isLoading: questionsLoading, refetch: refetchQuestions, error: questionsError } = useFetch(
    () => examService.getQuestions()
  );

  // Auth Protection
  useEffect(() => {
    if (!authLoading && role !== "teacher") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  const handleSave = async (data: Omit<QuestionDTO, "id">) => {
    try {
      if (editingQuestion?.id) {
        await examService.updateQuestion(editingQuestion.id, data);
      } else {
        await examService.createQuestion(data);
      }
      setIsAdding(false);
      setEditingQuestion(null);
      refetchQuestions();
    } catch (err) {
      handleError(err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await examService.deleteQuestion(deleteId);
      setDeleteId(null);
      refetchQuestions();
    } catch (err) {
      handleError(err);
    }
  };

  const handleEdit = (q: QuestionDTO) => {
    setEditingQuestion(q);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getSubjectTitle = useCallback((id: string) => {
    return subjects?.find(s => s.id === id)?.title || "غير مصنف";
  }, [subjects]);

  // Optimized Filtered Logic
  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    return questions.filter(q => {
      const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubjectId === "all" || q.subjectId === selectedSubjectId;
      return matchesSearch && matchesSubject;
    });
  }, [questions, searchQuery, selectedSubjectId]);

  if (authLoading || (role && role !== "teacher")) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Refined Header */}
      <SectionHeader 
        title="بنك الأصول الفكرية" 
        description="إدارة، تنقيح، وتنظيم الأسئلة الأكاديمية لبناء نماذج امتحانية متميزة."
      >
        <div className="flex gap-4">
          <Button 
            variant="ghost" 
            className="rounded-2xl h-14 px-8 border-2 border-border/40 font-black hover:bg-surface-container-high transition-all"
            onClick={() => router.push("/teacher")}
          >
            <ArrowLeft className="ml-3 size-5" />
            مركز القيادة
          </Button>
          <LoadingButton
            className="rounded-2xl h-14 px-8 bg-on-surface text-surface hover:bg-primary hover:text-on-primary transition-all shadow-xl shadow-primary/20 font-black"
            onClick={() => {
              setEditingQuestion(null);
              setIsAdding(true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <PlusCircle className="ml-3 size-6" />
            إضافة سؤال استراتيجي
          </LoadingButton>
        </div>
      </SectionHeader>

      {/* Modern Stats Display */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3 px-2">
          {questionsLoading || subjectsLoading ? (
              Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
          ) : (
              <>
                  <StatCard title="إجمالي الأصول" value={questions?.length || 0} icon={FileQuestion} color="primary" />
                  <StatCard title="التخصصات النشطة" value={subjects?.length || 0} icon={BookOpen} color="secondary" />
                  <StatCard title="حالة التزامن" value="آمن" description="اتصال مشفر مع السحابة" icon={LayoutGrid} color="tertiary" />
              </>
          )}
      </section>

      {/* Main Content Area */}
      <Card className="border-none shadow-premium rounded-[3rem] bg-surface-container-lowest overflow-hidden ring-1 ring-border/20">
        <CardHeader className="bg-surface-container-low/30 px-10 py-10 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative flex-1 max-w-2xl group">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 size-6 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <Input 
                      placeholder="ابحث في نص السؤال أو المفهوم التعليمي..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-surface-container-lowest border-none h-16 pr-14 rounded-[1.5rem] shadow-sm font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40" 
                    />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex items-center">
                      <Filter className="absolute right-6 size-5 text-primary pointer-events-none" />
                      <select 
                        value={selectedSubjectId}
                        onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="appearance-none bg-surface-container-lowest border-2 border-border/20 h-16 pl-14 pr-14 rounded-[1.5rem] font-black text-sm cursor-pointer min-w-[240px] focus:border-primary shadow-sm outline-none transition-all"
                      >
                        <option value="all">كل التخصصات الأكاديمية</option>
                        {subjects?.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute left-6 size-5 text-on-surface-variant pointer-events-none" />
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-10">
            {isAdding && (
                <div className="mb-14 p-10 rounded-[3rem] border-4 border-dashed border-primary/20 bg-primary/5 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="size-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-black shadow-lg">
                            {editingQuestion ? "!" : "+"}
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-on-surface">{editingQuestion ? "تحديث السؤال الحالي" : "صياغة سؤال جديد"}</h3>
                    </div>
                    <QuestionForm
                        onSave={handleSave}
                        onCancel={() => {
                            setIsAdding(false);
                            setEditingQuestion(null);
                        }}
                        initialData={editingQuestion || undefined}
                        subjects={subjects || []}
                    />
                </div>
            )}

            {questionsLoading ? (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                   {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[2.5rem]" />)}
                </div>
            ) : questionsError ? (
                <EmptyState title="فشل الاتصال" description={questionsError.message} icon={AlertCircle} />
            ) : filteredQuestions.length === 0 ? (
                <EmptyState 
                    title={searchQuery || selectedSubjectId !== "all" ? "لا توجد نتائج مطابقة" : "المستودع فارغ"} 
                    description="لم نتمكن من العثور على أي أسئلة تطابق المعايير المختارة حالياً."
                    icon={FileQuestion}
                    action={!searchQuery && selectedSubjectId === "all" ? {
                        label: "إضافة أول مسودة",
                        onClick: () => setIsAdding(true)
                    } : undefined}
                />
            ) : (
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {filteredQuestions.map((q) => (
                        <Card key={q.id} className="border-none shadow-lg rounded-[2.5rem] hover:shadow-2xl hover:scale-[1.01] transition-all duration-500 group bg-surface-container-low/30 relative overflow-hidden ring-1 ring-border/10">
                            <CardContent className="p-10 space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <StatusBadge variant="default" className="text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full bg-primary/10 text-primary border-none">
                                            {getSubjectTitle(q.subjectId)}
                                        </StatusBadge>
                                        <StatusBadge variant="secondary" className="text-[9px] font-black tracking-widest px-4 py-1.5 rounded-full bg-surface-container-high border-none">
                                            اختيار من متعدد
                                        </StatusBadge>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-surface-container-lowest text-primary hover:bg-primary/10 shadow-sm border border-border/20" onClick={() => handleEdit(q)}>
                                            <Edit2 className="size-5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-12 w-12 rounded-2xl bg-surface-container-lowest text-destructive hover:bg-destructive/10 shadow-sm border border-border/20" onClick={() => q.id && setDeleteId(q.id)}>
                                            <Trash2 className="size-5" />
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-black leading-snug tracking-tight text-on-surface line-clamp-4">
                                    {q.text}
                                </h3>
                                <div className="pt-8 border-t border-border/40 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-4 space-x-reverse">
                                            {q.options.slice(0, 3).map((_, i) => (
                                                <div key={i} className="size-8 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[10px] font-black">
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mr-2">
                                          {q.options.length} خيارات متاحة
                                        </span>
                                    </div>
                                    <div className="bg-secondary/10 text-secondary text-[10px] font-black px-4 py-2 rounded-xl border border-secondary/20">
                                      الإجابة: {q.options[q.correctAnswer]}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>

      <ConfirmDialog 
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={confirmDelete}
        title="إلغاء أصل فكري"
        description="هل أنت واثق من رغبتك في حذف هذا السؤال نهائياً؟ سيتم فقده من جميع الاختبارات التي لم تبدأ بعد."
        variant="destructive"
        confirmLabel="تأكيد الحذف النهائي"
      />
    </div>
  );
}
