"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import {
  CalendarClock,
  Download,
  Filter,
  Search,
  Users,
  ArrowLeft,
  GraduationCap,
  TrendingUp,
  AlertCircle,
  FileStack,
  Clock,
} from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { StatCard } from "../../../components/StatCard";
import { StatusBadge } from "../../../components/StatusBadge";
import { Button } from "../../../components/ui/button";
import { Skeleton } from "../../../components/ui/skeleton";
import { EmptyState } from "../../../components/EmptyState";
import { useAuth } from "../../../context/AuthContext";

// New Services
import { examService } from "../../../lib/services/exam.service";
import { useFetch } from "../../../lib/hooks/useFetch";
import { handleError } from "../../../lib/utils/error-handler";

export default function ViewResultsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  // Declarative Data Fetching (Filtered by Teacher)
  const { data: results, isLoading: loading, error } = useFetch(
    () => user?.uid ? examService.getResultsByTeacher(user.uid) : Promise.resolve([]),
    [user?.uid]
  );

  useEffect(() => {
    if (!authLoading && role !== "teacher") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  // Derived Analytics
  const stats = useMemo(() => {
    if (!results || results.length === 0) return { uniqueStudents: 0, avgScore: 0, total: 0 };
    
    const uniqueStudents = new Set(results.map(r => r.studentId)).size;
    const totalPercent = results.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions * 100), 0);
    const avgScore = Math.round(totalPercent / results.length);
    
    return { uniqueStudents, avgScore, total: results.length };
  }, [results]);

  // Search Logic
  const filteredResults = useMemo(() => {
    if (!results) return [];
    const q = searchQuery.toLowerCase();
    return results.filter(r => 
        r.studentName.toLowerCase().includes(q) || 
        r.subjectName.toLowerCase().includes(q) || 
        r.examName.toLowerCase().includes(q)
    );
  }, [results, searchQuery]);

  if (authLoading || (role && role !== "teacher")) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Premium Header */}
      <SectionHeader 
        title="مرصد النتائج الأكاديمية" 
        description="تحليل متقدم لمخرجات التعليم، وتتبع دقيق للمنحنى البياني لأداء طلابك."
      >
        <div className="flex flex-wrap gap-4">
          <Button 
            variant="ghost" 
            className="rounded-2xl h-14 px-8 border-2 border-border/40 font-black hover:bg-surface-container-high transition-all"
            onClick={() => router.push("/teacher")}
          >
            <ArrowLeft className="ml-3 size-5" />
            مركز القيادة
          </Button>
          <Button variant="ghost" className="rounded-2xl h-14 px-8 border-2 border-border/40 font-black hover:bg-primary/5 hover:text-primary transition-all">
            <Download className="ml-3 size-5" />
            تصدير التحليلات
          </Button>
          <Button className="rounded-2xl h-14 px-10 bg-on-surface text-surface hover:bg-on-surface/90 font-black shadow-xl transition-all">
            <CalendarClock className="ml-3 size-5" />
            مراسلة المتفوقين
          </Button>
        </div>
      </SectionHeader>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {loading ? (
             Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
            <>
                <StatCard title="إجمالي الطلاب المفحوصين" value={stats.uniqueStudents.toString()} icon={Users} color="primary" />
                <StatCard title="المؤشر العام للأداء" value={`${stats.avgScore}%`} icon={TrendingUp} color="secondary" />
                <StatCard title="سجلات الاختبار المكتملة" value={stats.total.toString()} icon={FileStack} color="tertiary" />
            </>
        )}
      </section>

      {/* Results Table View */}
      <Card className="border-none shadow-premium rounded-[3rem] bg-surface-container-lowest overflow-hidden ring-1 ring-border/20">
        <CardHeader className="bg-surface-container-low/30 px-10 py-10 border-b border-border/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative flex-1 max-w-3xl group">
                    <Search className="absolute right-6 top-1/2 -translate-y-1/2 size-6 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                    <Input 
                        placeholder="ابحث عن طالب، مادة، أو نموذج امتحاني محدد..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-surface-container-lowest border-none h-16 pr-14 rounded-[1.5rem] shadow-sm font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/40" 
                    />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-2xl h-14 px-6 border-2 border-border/20 font-black text-on-surface-variant hover:bg-surface-container-high transition-all">
                        <Filter className="ml-3 size-5" />
                        تصفية متقدمة
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-container-low/20 text-on-surface-variant text-xs font-black uppercase tracking-widest border-b border-border/30">
                  <th className="px-10 py-8">الهوية الأكاديمية</th>
                  <th className="px-8 py-8 font-black">المقرر الدراسي</th>
                  <th className="px-8 py-8 font-black">النموذج</th>
                  <th className="px-8 py-8 font-black">النتيجة الكمية</th>
                  <th className="px-8 py-8 font-black">تاريخ التنفيذ</th>
                  <th className="px-8 py-8 font-black">الحالة الإجرائية</th>
                  <th className="px-10 py-8 text-left font-black">الأدوات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20 font-medium">
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <tr key={i}>
                            <td colSpan={7} className="px-10 py-6">
                                <Skeleton className="h-12 w-full rounded-2xl" />
                            </td>
                        </tr>
                    ))
                ) : error ? (
                    <tr>
                        <td colSpan={7} className="py-20">
                            <EmptyState title="حدث خطأ في النظام" description={error.message} icon={AlertCircle} />
                        </td>
                    </tr>
                ) : filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20">
                         <EmptyState 
                            title={searchQuery ? "لا توجد نتائج بحث" : "المخطط شاغر حالياً"} 
                            description="لم نتمكن من العثور على أي نتائج مسجلة تطابق هذه المعايير."
                            icon={GraduationCap} 
                        />
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((row) => {
                    const percentage = (row.score / row.totalQuestions) * 100;
                    return (
                      <tr key={row.id} className="hover:bg-primary/5 transition-all duration-300 group">
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                                <div className="size-12 rounded-2xl bg-surface-container-high flex items-center justify-center font-black text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    {row.studentName.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-black text-lg text-on-surface group-hover:text-primary transition-colors tracking-tight">{row.studentName}</div>
                                    <div className="text-[10px] text-on-surface-variant font-black uppercase opacity-60">ID: {row.studentId.slice(0, 8)}</div>
                                </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                            <div className="bg-surface-container-high px-4 py-1.5 rounded-full inline-block text-[10px] font-black uppercase tracking-wide border border-border/20">
                                {row.subjectName}
                            </div>
                        </td>
                        <td className="px-8 py-8 font-black text-on-surface tracking-tight">{row.examName}</td>
                        <td className="px-8 py-8">
                          <div className="space-y-1">
                            <span className={`text-2xl font-black ${percentage >= 90 ? 'text-secondary' : percentage >= 50 ? 'text-primary' : 'text-destructive'} tracking-tighter`}>
                                {row.score} <span className="text-xs text-on-surface-variant font-medium">/ {row.totalQuestions}</span>
                            </span>
                            <div className="h-1 w-20 bg-surface-container-high rounded-full overflow-hidden">
                                <div className={`h-full ${percentage >= 90 ? 'bg-secondary' : percentage >= 50 ? 'bg-primary' : 'bg-destructive'} transition-all`} style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="font-black text-xs text-on-surface">{row.date.toLocaleDateString('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          <div className="text-[9px] text-on-surface-variant font-black uppercase mt-1 opacity-60 flex items-center gap-1">
                             <Clock className="size-3" /> {row.duration}
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <StatusBadge variant={row.status === "مكتمل" ? "success" : "default"} className="px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-none">
                            {row.status}
                          </StatusBadge>
                        </td>
                        <td className="px-10 py-8 text-left">
                          <Button variant="ghost" className="h-10 px-6 bg-surface-container-high hover:bg-primary/10 hover:text-primary rounded-xl font-black text-xs transition-all">تحليل الأداء</Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
