"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../lib/services/auth.service";
import { Role } from "../lib/types/user";
import { FormCard } from "./FormCard";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { AuthSocial } from "./AuthSocial";

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const router = useRouter();

  // تسجيل بالإيميل/كلمة المرور
  const handleRegister = async (role: Role) => {
    if (loading) return;
    if (!name || !email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { profile } = await authService.register(email, password, name, role);
      router.push(`/${profile.role}`);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء التسجيل";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // تسجيل عبر Google
  const handleGoogleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const { profile } = await authService.signInWithGoogle(selectedRole);
      router.push(`/${profile.role}`);
    } catch (err: any) {
      const message = err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول عبر Google";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="إنشاء حساب جديد" description="انضم إلينا الآن للبدء">
      <div className="space-y-6">
        <div className="space-y-4">
          <FormInput
            id="name"
            label="الاسم الكامل"
            placeholder="أدخل اسمك"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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

        <div className="pt-2 flex flex-col gap-3">
          {/* أزرار التسجيل حسب الدور */}
          <LoadingButton
            onClick={async () => {
              setSelectedRole("student");
              await handleRegister("student");
            }}
            loading={loading && selectedRole === "student"}
            disabled={loading}
            className="w-full h-12 rounded-xl text-lg font-bold"
          >
            إنشاء حساب كطالب
          </LoadingButton>

          <LoadingButton
            onClick={async () => {
              setSelectedRole("teacher");
              await handleRegister("teacher");
            }}
            loading={loading && selectedRole === "teacher"}
            disabled={loading}
            variant="secondary"
            className="w-full h-12 rounded-xl text-lg font-bold"
          >
            إنشاء حساب كأستاذ
          </LoadingButton>

          {/* تسجيل الدخول عبر Google */}
          <AuthSocial 
            onClick={handleGoogleSignIn} 
            role={selectedRole} 
            mode="register" 
            loading={loading}
          />
        </div>
      </div>
    </FormCard>
  );
}