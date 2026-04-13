"use client";

import { useAuth } from "../context/AuthContext";
import { LoginForm } from "../components/LoginForm";
import { RegisterForm } from "../components/RegisterForm";
import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const { role, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && role) {
      router.push(`/${role}`);
    }
  }, [role, loading, router]);

  if (loading || (role && !loading)) return <div className="flex-1 flex items-center justify-center min-h-screen text-primary font-bold text-2xl">جاري التحميل...</div>;

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-screen">
      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
         <div className="w-full max-w-md flex flex-col items-center">
             <div className="mb-8 w-full">
                 <div className="flex gap-2 p-1 bg-surface-container-high rounded-lg mb-8">
                     <Button 
                        variant={isLogin ? "default" : "ghost"} 
                        onClick={() => setIsLogin(true)}
                        className={`flex-1 rounded-md ${isLogin ? 'bg-primary text-white hover:bg-primary/90 shadow' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        تسجيل الدخول
                     </Button>
                     <Button 
                        variant={!isLogin ? "default" : "ghost"} 
                        onClick={() => setIsLogin(false)}
                        className={`flex-1 rounded-md ${!isLogin ? 'bg-primary text-white hover:bg-primary/90 shadow' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    >
                        حساب جديد
                     </Button>
                 </div>
                 {isLogin ? <LoginForm /> : <RegisterForm />}
             </div>
         </div>
      </div>
      
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-center items-center p-12 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
          <div className="max-w-xl text-center flex flex-col items-center">
              <h1 className="text-5xl font-bold mb-6 leading-tight">مسار واضح<br/>للتميز الأكاديمي</h1>
              <p className="text-xl text-slate-300 leading-relaxed mb-12">
                  منصة اختبارات إلكترونية تضع تركيز الطالب واحترافية المعلم في المقام الأول.
              </p>
          </div>
      </div>
    </div>
  );
}
