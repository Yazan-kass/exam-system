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
  ChevronLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  const router = useRouter();

  const { role, user, profile, loading } = useAuth();

  const navItems = role === "teacher" ? TEACHER_NAV : STUDENT_NAV;

  const handleLogout = async () => {
    try {
      const { signOut } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase");
      
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // 🔥 Prevent rendering before auth is ready
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        تحميل...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-surface" dir="rtl">
      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-72 bg-surface-container-lowest border-l border-border/50 transform transition-transform duration-300 md:translate-x-0 md:static",
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          <Link
            href={`/${role || ""}`}
            className="flex items-center gap-3 mb-10 px-2"
          >
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <span className="text-xl font-bold">الأكاديمية</span>
          </Link>

          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium",
                    isActive
                      ? "bg-primary text-white"
                      : "text-on-surface-variant hover:bg-surface-container-high"
                  )}
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>

                  {isActive && <ChevronLeft className="size-4 mr-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t space-y-2">
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-container-high"
            >
              <Settings className="size-5" />
              الإعدادات
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 w-full"
            >
              <LogOut className="size-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu />
          </Button>

          <div className="hidden sm:flex items-center relative">
            <Search className="absolute right-3 size-4" />
            <input
              className="h-10 w-64 pr-10 rounded-lg border"
              placeholder="بحث..."
            />
          </div>

          <div className="flex items-center gap-4">
            <Bell className="size-5" />

            <div className="flex items-center gap-2">
              <div className="text-sm text-right hidden md:block">
                <div className="font-bold">{profile?.name || "مستخدم"}</div>
                <div className="text-xs text-gray-500">
                  {role === "teacher" ? "أستاذ" : "طالب"}
                </div>
              </div>

              <Image
                src={
                  user?.photoURL ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                }
                alt="profile"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}