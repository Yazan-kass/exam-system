"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../lib/services/auth.service";
import { FormCard } from "./FormCard";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { AuthSocial } from "./AuthSocial";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // Use authService for unified login and profile fetching
      const { profile } = await authService.login(email, password);

      if (profile?.role) {
        router.push(`/${profile.role}`);
      } else {
        setError("بيانات المستخدم غير موجودة في قاعدة البيانات.");
      }
    } catch (err: any) {
      console.error(err);
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="الأكاديمية - تسجيل الدخول" description="أدخل بياناتك للمتابعة">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <FormInput
            id="email"
            label="البريد الإلكتروني"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            dir="ltr"
          />
          <FormInput
            id="password"
            label="كلمة المرور"
            type="password"
            placeholder="****"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            dir="ltr"
          />
          {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>}
        </div>

        <div className="space-y-4 pt-2">
          <LoadingButton type="submit" loading={loading} className="w-full h-12 rounded-xl text-lg font-bold">
            تسجيل الدخول (البريد الإلكتروني)
          </LoadingButton>

          <AuthSocial mode="login" role="student" />
        </div>
      </form>
    </FormCard>
  );
}