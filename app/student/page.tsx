"use client";

import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useMemo, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FlaskConical,
  GraduationCap,
  History,
  Medal,
  TrendingUp,
  Bell,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { StatCard } from "../../components/StatCard";
import { SectionHeader } from "../../components/SectionHeader";
import { StatusBadge } from "../../components/StatusBadge";
import { SubjectCard } from "../../components/SubjectCard";
import { EmptyState } from "@/components/EmptyState";

import { examService } from "../../lib/services/exam.service";
import { studentService } from "../../lib/services/student.service";
import { notificationService, AppNotification } from "../../lib/services/notification.service";
import { useFetch } from "../../lib/hooks/useFetch";

function StudentDashboardContent() {
  const { role, loading: authLoading, user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [visibleSubjectsCount, setVisibleSubjectsCount] = useState(4);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Professional Data Fetching Hooks
  const { data: subjects, isLoading: subjectsLoading } = useFetch(
    () => examService.getSubjects()
  );

  const fetchCategorized = useCallback(() => {
    if (!user?.uid) return Promise.resolve({ upcoming: [], completed: [] });
    return studentService.getCategorizedExams(user.uid);
  }, [user]); // Align with React Compiler inference

  const { data: examsData, isLoading: examsLoading } = useFetch(
    fetchCategorized,
    [user?.uid]
  );

  const { data: stats, isLoading: statsLoading } = useFetch(
    () => user?.uid ? studentService.getStudentStats(user.uid) : Promise.resolve(null),
    [user?.uid]
  );

  // Routing and Auth protection
  useEffect(() => {
    if (!authLoading && role !== "student") {
      router.push("/unauthorized");
    }
  }, [role, authLoading, router]);

  // Real-time Notifications Subscription
  useEffect(() => {
    if (user?.uid && role === "student") {
      const unsubscribe = notificationService.subscribeToNotifications(user.uid, (list) => {
        setNotifications(list);
      });
      return () => unsubscribe();
    }
  }, [user?.uid, role]);

  // Filtering Logic
  const filteredExams = useMemo(() => {
    if (!examsData) return { upcoming: [], completed: [] };
    const subjectFilter = searchParams.get("subjectId");

    if (!subjectFilter) return examsData;

    return {
      upcoming: examsData.upcoming.filter(e => e.subjectId === subjectFilter),
      completed: examsData.completed.filter(e => e.subjectId === subjectFilter),
    };
  }, [examsData, searchParams]);

  // UI Handlers
  const handleLoadMore = () => setVisibleSubjectsCount(prev => prev + 4);
  const handleResetFilter = () => {
    window.history.pushState({}, '', '/student');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (authLoading || (role && role !== "student")) return null;

  const getSubjectIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("رياضيات") || t.includes("math")) return GraduationCap;
    if (t.includes("فيزياء") || t.includes("physics")) return FlaskConical;
    return BookOpen;
  };

  const isGlobalLoading = subjectsLoading || examsLoading || statsLoading;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Hero Welcome Section */}
      <section>
        <Card className="border-none shadow-premium bg-surface-container-lowest overflow-hidden rounded-[2.5rem]">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-12 py-14 px-12">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest">
                <Medal className="size-4" />
                نظام إدارة النجاح
              </div>
              <h1 className="text-6xl font-black leading-tight text-on-surface tracking-tighter">
                أهلاً بك، <span className="text-primary">{profile?.name?.split(' ')[0] || "أيها المبدع"}</span> 👋
              </h1>
              <div className="max-w-2xl text-xl leading-relaxed text-on-surface-variant font-medium">
                {isGlobalLoading ? (
                    <Skeleton className="h-6 w-3/4" />
                ) : (
                    <>أنت تبلي بلاءً حسناً! لديك <span className="text-primary font-bold">{filteredExams.upcoming.length}</span> اختبارات قادمة بانتظارك اليوم.</>
                )}
              </div>
            </div>

            <div className="w-full md:w-2/5 relative">
              <div className="aspect-[4/3] overflow-hidden rounded-[3rem] shadow-2xl ring-1 ring-border/50 -rotate-3 hover:rotate-0 transition-all duration-700 group relative">
                <Image
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
                  alt="Student success environment"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)
        ) : (
            <>
                <StatCard title="المعدل التراكمي" value={stats?.averageScore.toString() || "0.0"} icon={TrendingUp} color="secondary" />
                <StatCard title="اختبارات مكتملة" value={stats?.totalCompleted.toString() || "0"} icon={CheckCircle2} color="primary" />
                <StatCard title="الأداء الإجمالي" value={`${stats?.performancePercentage || 0}%`} icon={Medal} color="tertiary" />
                <StatCard title="التنبيهات" value={notifications.length.toString()} icon={Bell} color="primary" />
            </>
        )}
      </section>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        
        {/* Main Content Areas */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Upcoming Tests Section */}
          <section className="space-y-6">
             <SectionHeader title="المسار القادم" description="جدول الاختبارات المجدولة بانتظارك.">
                <div className="flex items-center gap-3">
                   {searchParams.has("subjectId") && (
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-full bg-primary/5 text-primary font-black px-4 hover:bg-primary/10 transition-all"
                        onClick={handleResetFilter}
                     >
                       عرض كل المواد
                     </Button>
                   )}
                   <StatusBadge variant="default" className="px-5 py-1.5 rounded-full font-black">
                     {examsLoading ? "..." : filteredExams.upcoming.length} اختبار
                   </StatusBadge>
                 </div>
             </SectionHeader>
             
             {examsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-48 rounded-3xl" />
                    <Skeleton className="h-48 rounded-3xl" />
                </div>
             ) : filteredExams.upcoming.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-border/20 rounded-[2.5rem] bg-surface-container-low/20">
                   <Clock3 className="size-14 mx-auto mb-6 text-on-surface-variant/20" />
                   <p className="text-on-surface-variant font-bold text-lg">لا توجد اختبارات مجدولة حالياً.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredExams.upcoming.map(ex => (
                    <Card key={ex.id} className="border-none hover:shadow-xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-surface-container-lowest group cursor-default">
                      <CardContent className="p-8 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="size-7" />
                          </div>
                          <StatusBadge variant="secondary" className="px-4 py-1.5 rounded-xl font-black text-[10px] uppercase">{ex.duration} دقيقة</StatusBadge>
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-black text-2xl text-on-surface group-hover:text-primary transition-colors line-clamp-1">{ex.title}</h3>
                          <div className="space-y-2 pt-1 border-t border-border/40 mt-4">
                            <p className="text-xs text-primary font-black flex items-center gap-2">
                              <Clock3 className="size-4" />
                              يفتح في: {ex.startTime.toLocaleString('ar-SA', { weekday: 'long', hour: 'numeric', minute: 'numeric' })}
                            </p>
                            <p className="text-xs text-on-surface-variant font-bold flex items-center gap-2">
                              <GraduationCap className="size-4" />
                              بواسطة: {ex.teacherName || "المعلم"}
                            </p>
                          </div>
                        </div>
                        <Button 
                          className="w-full h-14 rounded-2xl font-black bg-on-surface text-surface hover:bg-on-surface/90 text-lg group-hover:bg-primary group-hover:text-on-primary transition-all shadow-lg"
                          onClick={() => router.push(`/student/exams/${ex.id}`)}
                        >
                          دخول بيئة الاختبار
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
             )}
          </section>

          {/* Subjects List */}
          <section className="space-y-6">
            <SectionHeader title="المكتبة التعليمية" description="تصفح المواد الدراسية الخاصة بك بعمق.">
              {subjects && visibleSubjectsCount < subjects.length ? (
                <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 px-6 rounded-full" onClick={() => setVisibleSubjectsCount(subjects.length)}>عرض الكل</Button>
              ) : subjects && subjects.length > 4 ? (
                <Button variant="ghost" className="text-primary font-black hover:bg-primary/5 px-6 rounded-full" onClick={() => setVisibleSubjectsCount(4)}>عرض أقل</Button>
              ) : null}
            </SectionHeader>

            {subjectsLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
            ) : !subjects || subjects.length === 0 ? (
              <EmptyState title="لا توجد مواد" description="لم يتم إضافة أي مواد دراسية حالياً." icon={BookOpen} />
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {subjects.slice(0, visibleSubjectsCount).map((s) => (
                    <SubjectCard 
                      key={s.id}
                      title={s.title}
                      description={s.description}
                      icon={getSubjectIcon(s.title)}
                      primaryAction="عرض تفاصيل المادة"
                      onActionClick={() => router.push(`/student/subjects/${s.id}`)}
                      examCount={s.examsCount}
                    />
                  ))}
                </div>
                
                {visibleSubjectsCount < subjects.length && (
                  <div className="flex justify-center pt-8">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="h-16 rounded-[2rem] px-16 border-2 border-border/60 hover:bg-primary hover:text-on-primary hover:border-primary transition-all font-black text-lg"
                      onClick={handleLoadMore}
                    >
                      تحميل المزيد من المواد
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Section */}
        <aside className="lg:col-span-4 space-y-10">
          
          {/* Completed Tests List */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/30 border-b border-border/40 py-8 px-8">
              <CardTitle className="text-xl font-black flex items-center gap-3">
                <History className="size-6 text-secondary" />
                سجل المنجزات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {examsLoading ? (
                    Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
                ) : filteredExams.completed.length === 0 ? (
                  <div className="p-10 text-center space-y-4">
                      <Medal className="size-10 mx-auto text-on-surface-variant/20" />
                      <p className="text-on-surface-variant text-sm font-bold opacity-60">بانتظار إنجازك الأول!</p>
                  </div>
                ) : (
                  filteredExams.completed.map(res => (
                    <div 
                      key={res.id} 
                      className="p-5 rounded-2xl bg-surface-container-low/40 border border-border/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group flex items-center justify-between gap-4"
                      onClick={() => router.push(`/student/results/${res.id}`)}
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <h4 className="font-black text-on-surface text-sm group-hover:text-primary transition-colors truncate">{res.examName}</h4>
                             <ChevronRight className="size-3 text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-on-surface-variant font-black uppercase tracking-tighter">
                          <span className="bg-surface-container-high px-2 py-0.5 rounded-md">{res.subjectName}</span>
                          <span>{res.date.toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                      <div className="size-12 rounded-xl bg-surface-container-high flex flex-col items-center justify-center border border-border/40 group-hover:border-primary/20">
                          <span className="text-[10px] font-black text-on-surface-variant leading-none mb-0.5">SCORE</span>
                          <span className="text-sm font-black text-primary leading-none">{Math.round((res.score / res.totalQuestions) * 100)}%</span>
                      </div>
                    </div>
                  ))
                )}
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-surface-container-lowest">
            <CardHeader className="bg-surface-container-low/30 border-b border-border/40 py-8 px-8">
              <CardTitle className="text-xl font-black flex items-center gap-3 text-on-surface">
                <Bell className="size-6 text-primary" />
                مركز التنبيهات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {notifications.length === 0 ? (
                <div className="p-10 text-center space-y-4">
                    <Bell className="size-10 mx-auto text-on-surface-variant/20" />
                    <p className="text-on-surface-variant text-sm font-bold opacity-60">كل شيء هادئ هنا..</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-5 rounded-2xl border transition-all ${n.read ? 'bg-surface-container-low/40 border-border/10 opacity-60' : 'bg-primary/5 border-primary/20 shadow-sm relative'}`}>
                    {!n.read && <div className="absolute top-4 left-4 size-2 rounded-full bg-primary animate-pulse" />}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-primary text-[10px] uppercase tracking-widest">{n.title}</span>
                      <span className="text-[9px] text-on-surface-variant font-black">{n.createdAt?.toDate().toLocaleDateString('ar-SA')}</span>
                    </div>
                    <p className="text-xs text-on-surface font-bold leading-relaxed">{n.message}</p>
                    {!n.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] h-6 p-0 text-primary mt-3 hover:bg-transparent font-black hover:text-primary/70" 
                        onClick={() => notificationService.markAsRead(n.id)}
                      >
                        تحديد كمقروء
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

        </aside>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-12 py-10">
        <Skeleton className="h-64 rounded-[2.5rem]" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}
