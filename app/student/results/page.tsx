"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Check,
  Clock3,
  LayoutGrid,
  X,
  Award,
  ArrowLeft,
  Search,
  ArrowRight
} from "lucide-react";
import { SectionHeader } from "../../../components/SectionHeader";
import { StatusBadge } from "../../../components/StatusBadge";
import { StatCard } from "../../../components/StatCard";
import { useAuth } from "../../../context/AuthContext";
import { Input } from "../../../components/ui/input";

// New Services
import { examService, ResultDTO } from "../../../lib/services/exam.service";

export default function ResultsPage() {
  const router = useRouter();
  const { user, role, loading: authLoading } = useAuth();
  const [results, setResults] = useState<ResultDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  useEffect(() => {
    if (!authLoading && role !== "student") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    if (user?.uid && role === "student") {
      const fetchResults = async () => {
        try {
          const data = await examService.getResults(user.uid, 20); 
          setResults(data);
        } catch (error) {
          console.error("Error fetching results:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [user, role]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="size-16 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
        <p className="text-xl font-bold text-on-surface-variant">جاري تحميل نتائجك...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-center space-y-6">
        <div className="size-24 bg-surface-container-high rounded-full flex items-center justify-center">
            <X className="size-12 text-on-surface-variant" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-bold text-on-surface">لا توجد نتائج للعرض</h2>
            <p className="text-on-surface-variant max-w-md">لم تقم بأداء أي اختبارات مؤخراً. أدي اختبارك الأول لترى نتائجك هنا.</p>
        </div>
        <Button onClick={() => router.push("/student")} className="h-12 rounded-xl px-10 border-2">العودة للرئيسية</Button>
      </div>
    );
  }

  const latestResult = results[0];
  const scorePercentage = Math.round((latestResult.score / latestResult.totalQuestions) * 100);
  const isPassed = scorePercentage >= 50;

  const filteredResults = results.filter(r => 
    r.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.examName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Detail View (Mode: latest)
  if (mode === "latest") {
    return (
      <div className="space-y-10">
        <SectionHeader 
          title="نتيجة الاختبار الأخير" 
          description={`مراجعة شاملة لأدائك في اختبار ${latestResult.subjectName} - ${latestResult.examName}`}
        >
          <Button 
            variant="outline" 
            className="rounded-xl h-11 border-2"
            onClick={() => router.push("/student/results")}
          >
            <ArrowRight className="ml-2 size-4" />
            عرض كافة النتائج
          </Button>
        </SectionHeader>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <StatCard title="الدرجة النهائية" value={`${latestResult.score} / ${latestResult.totalQuestions}`} icon={Check} color="secondary" />
          <StatCard title="النسبة المئوية" value={`${scorePercentage}%`} icon={Award} color="tertiary" />
          <StatCard title="الوقت المستغرق" value={latestResult.duration} icon={Clock3} color="primary" />
        </section>

        <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <Card className="lg:col-span-8 border-border/60 shadow-xl rounded-3xl overflow-hidden bg-surface-container-lowest">
            <CardContent className="grid grid-cols-1 md:grid-cols-3 items-center gap-10 py-10 px-8">
              <div className="md:col-span-2 space-y-6 text-right">
                <div className="flex items-center gap-3">
                    <StatusBadge variant={isPassed ? "success" : "destructive"} className="px-4 py-1.5 text-sm">
                      {isPassed ? "ناجح" : "لم يحالفك الحظ"}
                    </StatusBadge>
                    <StatusBadge variant="default" className="px-4 py-1.5 text-sm">
                      {scorePercentage >= 90 ? "أداء متميز" : scorePercentage >= 75 ? "أداء جيد جداً" : "أداء جيد"}
                    </StatusBadge>
                </div>
                <h3 className="text-5xl font-extrabold text-on-surface">
                  {isPassed ? "انتصار جديد!" : "حاول مرة أخرى"}
                </h3>
                <p className="text-xl leading-relaxed text-on-surface-variant">
                  {isPassed 
                    ? "لقد أظهرت فهماً قوياً للمفاهيم الأساسية. مستواك الحالي يؤهلك للحصول على مراتب متقدمة."
                    : "لا تحزن، الفشل هو أول خطوات النجاح. راجع المواد الدراسية وحاول مرة أخرى قريباً."}
                </p>
                <Button 
                  className="h-14 rounded-2xl bg-primary px-8 text-lg font-bold shadow-lg shadow-primary/20" 
                  onClick={() => router.push("/student")}
                >
                  <LayoutGrid className="ml-2 size-5" />
                  لوحة التحكم العامة
                </Button>
              </div>

              <div className="flex flex-col items-center justify-center p-6 bg-surface-container-low rounded-3xl border-2 border-primary/10">
                  <div className="relative size-44 flex items-center justify-center">
                      <svg className="size-full transform -rotate-90">
                          <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-surface-container-high" />
                          <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={2 * Math.PI * 80} strokeDashoffset={2 * Math.PI * 80 * (1 - scorePercentage/100)} className={isPassed ? "text-primary" : "text-destructive"} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-6xl font-black ${isPassed ? "text-primary" : "text-destructive"}`}>{scorePercentage}</span>
                          <span className="text-sm font-bold text-on-surface-variant">من 100</span>
                      </div>
                  </div>
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-4 space-y-6">
              <Card className="border-border/60 bg-surface-container-lowest shadow-md rounded-2xl">
                  <CardContent className="py-6 px-6">
                      <h4 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                          <Award className="size-5 text-tertiary" />
                          الأوسمة المكتسبة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                          {isPassed && <StatusBadge variant="success">ناجح مثابر</StatusBadge>}
                          {scorePercentage >= 90 && <StatusBadge variant="warning">عبقري المادة</StatusBadge>}
                          <StatusBadge variant="default">مشارك نشط</StatusBadge>
                      </div>
                  </CardContent>
              </Card>
          </div>
        </section>
      </div>
    );
  }

  // List View (Default)
  return (
    <div className="space-y-10">
      <SectionHeader 
        title="سجل النتائج" 
        description="استعرض تاريخ أداءك في جميع الاختبارات السابقة."
      >
        <Button 
          variant="outline" 
          className="rounded-xl h-11 border-2"
          onClick={() => router.push("/student")}
        >
          <ArrowRight className="ml-2 size-4" />
          لوحة التحكم
        </Button>
      </SectionHeader>

      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 size-5 text-on-surface-variant" />
        <Input 
          type="text" 
          placeholder="بحث في النتائج (المادة أو الاختبار)..." 
          className="h-14 pr-12 text-lg rounded-2xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-right"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-border/60 bg-surface-container-lowest shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-border/40">
                  <th className="px-6 py-4 font-bold text-on-surface-variant">الاختبار / المادة</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">الدرجة</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">النسبة</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">التاريخ</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant">الحالة</th>
                  <th className="px-6 py-4 font-bold text-on-surface-variant text-left">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-arabic font-medium">
                {filteredResults.map((result) => {
                  const perc = Math.round((result.score / result.totalQuestions) * 100);
                  return (
                    <tr key={result.id} className="hover:bg-surface-container-low/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-on-surface text-lg">{result.examName}</div>
                        <div className="text-sm text-on-surface-variant mt-1">{result.subjectName}</div>
                      </td>
                      <td className="px-6 py-5 font-bold text-secondary text-lg">
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <span className={`font-bold ${perc >= 50 ? 'text-primary' : 'text-destructive'}`}>{perc}%</span>
                           <div className="w-20 h-1.5 bg-surface-container-high rounded-full overflow-hidden hidden sm:block">
                              <div 
                                className={`h-full ${perc >= 50 ? 'bg-primary' : 'bg-destructive'}`} 
                                style={{ width: `${perc}%` }}
                              />
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-on-surface-variant">
                        {result.date.toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-5">
                        <StatusBadge variant={perc >= 50 ? "success" : "destructive"}>
                          {perc >= 50 ? "ناجح" : "راسب"}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-5 text-left">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary font-bold hover:bg-primary/5 rounded-lg"
                          onClick={() => router.push(`/student/results?mode=latest`)}
                        >
                          التفاصيل
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
