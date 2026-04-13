"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 text-center">
      <div className="p-6 bg-destructive/10 rounded-full">
        <ShieldAlert className="size-16 text-destructive" />
      </div>
      <h1 className="text-4xl font-extrabold text-on-surface">غير مصرح لك بالدخول</h1>
      <p className="text-on-surface-variant max-w-md">
        عذراً، ليس لديك الصلاحيات الكافية للوصول إلى هذه الصفحة. يرجى التأكد من تسجيل الدخول بالحساب الصحيح.
      </p>
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.push("/")}
          className="rounded-xl h-12 px-8"
        >
          العودة للرئيسية
        </Button>
        <Button 
          onClick={() => router.push("/")}
          className="rounded-xl h-12 px-8"
        >
          تسجيل الدخول
        </Button>
      </div>
    </div>
  );
}
