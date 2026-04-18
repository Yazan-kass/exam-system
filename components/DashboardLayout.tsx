"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  Bell, 
  Search,
  ChevronLeft
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";


interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDENT_NAV: NavItem[] = [
  { label: "لوحة التحكم", href: "/student", icon: LayoutDashboard },
  { label: "المواد الدراسية", href: "/student/subjects", icon: BookOpen },
  { label: "النتائج", href: "/student/results", icon: BarChart3 },
];

const TEACHER_NAV: NavItem[] = [
  { label: "لوحة التحكم", href: "/teacher", icon: LayoutDashboard },
  { label: "إدارة الاختبارات", href: "/teacher/create-exam", icon: FileText },
  { label: "بنك الأسئلة", href: "/teacher/manage-questions", icon: BookOpen },
  { label: "نتائج الطلاب", href: "/teacher/view-results", icon: Users },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { role, user, profile } = useAuth();
  const router = useRouter();

  const navItems = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;
  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-surface" dir="rtl">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 md:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-72 bg-surface-container-lowest border-l border-border/50 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
        isSidebarOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full p-6">
          <Link 
            href={`/${role}`} 
            className="flex items-center gap-3 mb-10 px-2 group hover:opacity-80 transition-all opacity-100"
          >
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform duration-300">
              {profile?.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xl font-bold tracking-tight text-on-surface">الأكاديمية</span>
          </Link>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group font-medium",
                    isActive 
                      ? "bg-primary text-white shadow-md shadow-primary/10" 
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={cn("size-5", isActive ? "text-white" : "text-on-surface-variant group-hover:text-primary")} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronLeft className="size-4" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-border/40 space-y-1.5">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all font-medium"
            >
              <Settings className="size-5" />
              <span>الإعدادات</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-destructive hover:bg-destructive/10 transition-all w-full font-medium"
            >
              <LogOut className="size-5" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 h-20 bg-surface/80 backdrop-blur-md border-b border-border/40 px-4 md:px-8">
          <div className="flex items-center justify-between h-full max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="size-6" />
              </Button>
              <div className="hidden sm:flex items-center relative group">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="بحث عن أي شيء..." 
                  className="h-11 w-64 lg:w-96 bg-surface-container-low border-none rounded-xl pr-10 pl-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <Button variant="ghost" size="icon" className="relative group rounded-xl bg-surface-container-low hover:bg-surface-container-high transition-all">
                <Bell className="size-5 text-on-surface-variant group-hover:text-primary" />
                <span className="absolute top-2.5 right-2.5 size-2 bg-primary rounded-full border-2 border-surface" />
              </Button>
              
              <div className="h-10 w-[1px] bg-border/40 mx-2 hidden md:block" />
              
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-on-surface line-clamp-1">{profile?.name || "مستخدم"}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                    {role === "teacher" ? "أستاذ" : "طالب"}
                  </p>
                </div>
                <div className="size-11 rounded-xl overflow-hidden border-2 border-primary/10 shadow-sm ring-2 ring-primary/5 relative">
                  <Image 
                    src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"} 
                    alt="Profile" 
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pt-8 pb-16">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            {children}
          </div>
        </main>

        {/* Footer (Static at bottom of scrollable area or fixed) */}
        <footer className="border-t border-border/40 py-6 text-center text-sm text-on-surface-variant bg-surface-container-lowest/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
             <p>© 2024 الأكاديمية - نظام الاختبارات الذكي</p>
             <div className="flex items-center gap-6">
                 <Link href="#" className="hover:text-primary transition-colors">عن المنصة</Link>
                 <Link href="#" className="hover:text-primary transition-colors">الدعم الفني</Link>
                 <Link href="#" className="hover:text-primary transition-colors">الشروط والأحكام</Link>
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
