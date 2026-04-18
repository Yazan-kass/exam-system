"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { SectionHeader } from "../../../components/SectionHeader";
import { SubjectCard } from "../../../components/SubjectCard";
import { Skeleton } from "../../../components/ui/skeleton";
import { 
  BookOpen, 
  GraduationCap, 
  FlaskConical, 
  Search,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { EmptyState } from "@/components/EmptyState";

// New Services
import { examService } from "../../../lib/services/exam.service";
import { useFetch } from "../../../lib/hooks/useFetch";

export default function StudentSubjectsPage() {
  const { role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Professional Data Fetching
  const { data: subjects, isLoading: loading, error } = useFetch(
    () => examService.getSubjects()
  );

  useEffect(() => {
    if (!authLoading && role !== "student") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("رياضيات") || t.includes("math")) return GraduationCap;
    if (t.includes("فيزياء") || t.includes("physics")) return FlaskConical;
    return BookOpen;
  };

  const filteredSubjects = useMemo(() => {
    if (!subjects) return [];
    return subjects.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subjects, searchQuery]);

  if (authLoading || (role && role !== "student")) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        title="المكتبة الأكاديمية" 
        description="استكشف جميع المواد المتاحة وابدأ رحلة التعلم والتقييم الذاتي."
      >
        <Button 
          variant="ghost" 
          className="rounded-2xl h-12 border-2 border-border/40 font-black hover:bg-primary hover:text-on-primary hover:border-primary transition-all"
          onClick={() => router.push("/student")}
        >
          <ArrowRight className="ml-3 size-5" />
          لوحة القيادة
        </Button>
      </SectionHeader>

      <div className="relative max-w-3xl mx-auto mb-14 group">
        <Search className="absolute right-6 top-1/2 -translate-y-1/2 size-6 text-on-surface-variant group-focus-within:text-primary transition-colors" />
        <Input 
          type="text" 
          placeholder="ابحث عن مادة دراسية... (مثلاً: رياضيات، علوم)" 
          className="h-16 pr-14 text-xl rounded-[1.5rem] bg-surface-container-low border-none shadow-premium focus:ring-4 focus:ring-primary/10 transition-all font-bold text-right placeholder:text-on-surface-variant/40"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                نتائج البحث: {filteredSubjects.length}
            </div>
        )}
      </div>

      <section>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
            {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-[2.5rem]" />
            ))}
          </div>
        ) : error ? (
            <div className="py-20">
                <EmptyState 
                    title="حدث خطأ في النظام" 
                    description={error.message} 
                    icon={AlertCircle} 
                    action={{ label: "إعادة التحميل", onClick: () => window.location.reload() }}
                />
            </div>
        ) : filteredSubjects.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-border/20 rounded-[3rem] bg-surface-container-low/20">
            <BookOpen className="size-16 mx-auto mb-6 text-on-surface-variant/20" />
            <h3 className="text-2xl font-black text-on-surface mb-2">لا توجد مواد تطابق هذا البحث</h3>
            <p className="text-on-surface-variant font-medium opacity-60">حاول استخدام كلمات مفتاحية أخرى أو تصفح القائمة الكاملة.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredSubjects.map((s) => (
              <SubjectCard 
                  key={s.id}
                  title={s.title}
                  description={s.description}
                  icon={getIcon(s.title)}
                  onActionClick={() => router.push(`/student/subjects/${s.id}`)}
                  examCount={s.examsCount}
                  questionCount={0}
                  primaryAction="عرض تفاصيل المادة"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
