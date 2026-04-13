"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { 
  User as UserIcon, 
  Lock, 
  Trash2, 
  LogOut, 
  Mail, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import {
  profileSchema,
  passwordSchema,
  deleteSchema,
} from "../../lib/validation/settings.schema";

import { useUpdateProfile } from "../../components/hooks/useUpdateProfile";
import { useChangePassword } from "../../components/hooks/useChangePassword";
import { useDeleteAccount } from "../../components/hooks/useDeleteAccount";
import { userService } from "../../lib/services/user.service";
import { auth } from "../../lib/firebase";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";

export default function SettingsPage() {
  const { user, profile, role, refreshProfile } = useAuth();
  const router = useRouter();

  // Form states and dialog controls
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const { updateProfile, loading: profileLoading } = useUpdateProfile(async () => {
    await refreshProfile();
    setProfileOpen(false);
    showFeedback("success", "تم تحديث الاسم بنجاح");
  });

  const { changePassword, loading: passLoading } = useChangePassword(user);
  const { deleteAccount, loading: deleteLoading } = useDeleteAccount(user);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name || "" },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const deleteForm = useForm({
    resolver: zodResolver(deleteSchema),
  });

  // Update form default values when profile loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name });
    }
  }, [profile, profileForm]);

  const showFeedback = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.replace("/");
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="space-y-1 text-right">
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة معلومات حسابك وتفضيلات الأمان.</p>
      </div>

      {/* Global Feedback Message */}
      {message && (
        <div className={`flex items-center gap-2 p-4 rounded-lg border ${
          message.type === "success" 
            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        } animate-in slide-in-from-top-2`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <Card className="md:col-span-2 shadow-sm border-foreground/10 h-fit">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-primary" />
              الملف الشخصي
            </CardTitle>
            <CardDescription>معلوماتك الأساسية وكيف تظهر للآخرين.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-muted bg-muted flex items-center justify-center relative">
                {profile?.photoURL ? (
                  <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 space-y-1 text-center sm:text-right">
                <h3 className="text-lg font-semibold">{profile?.name || "مستخدم"}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {profile?.email}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="capitalize">{role === "teacher" ? "معلم" : "طالب"}</span>
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={() => setProfileOpen(true)}>
                تعديل الاسم
              </Button>
            </div>
            
          </CardContent>
        </Card>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          
          {/* Security Card */}
          <Card className="shadow-sm border-foreground/10">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="w-4 h-4" />
                الأمان
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <Button 
                variant="secondary" 
                className="w-full justify-start gap-2"
                onClick={() => setPasswordOpen(true)}
              >
                تغيير كلمة المرور
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="shadow-sm border-destructive/10 bg-destructive/5">
            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-base flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                إجراءات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 space-y-2 pb-4">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </Button>
              <Button 
                variant="destructive" 
                className="w-full justify-start gap-2"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="w-4 h-4" />
                حذف الحساب
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* --- DIALOGS --- */}

      {/* Edit Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent>
          <DialogHeader className="text-right">
            <DialogTitle>تعديل الاسم</DialogTitle>
            <DialogDescription>سيتم تحديث اسمك المعروض في جميع أنحاء التطبيق.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={profileForm.handleSubmit(async (data) => {
              if (!user) return;
              await updateProfile(user.uid, data.name);
            })}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2 text-right">
              <label className="text-sm font-medium">الاسم الكامل</label>
              <Input {...profileForm.register("name")} placeholder="أدخل اسمك الجديد" dir="rtl" />
              {profileForm.formState.errors.name && (
                <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 flex-row-reverse sm:justify-start">
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setProfileOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader className="text-right">
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
            <DialogDescription>يرجى إدخال كلمة المرور الحالية ثم الجديدة.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={passwordForm.handleSubmit(async (data) => {
              if (!user) return;
              try {
                await changePassword(data.currentPassword, data.newPassword);
                setPasswordOpen(false);
                passwordForm.reset();
                showFeedback("success", "تم تغيير كلمة المرور بنجاح");
              } catch (err: any) {
                console.error(err);
                showFeedback("error", "كلمة المرور الحالية غير صحيحة أو حدث خطأ.");
              }
            })}
            className="space-y-4 pt-4"
          >
            <div className="space-y-3">
              <Input type="password" {...passwordForm.register("currentPassword")} placeholder="كلمة المرور الحالية" dir="rtl" />
              <Input type="password" {...passwordForm.register("newPassword")} placeholder="كلمة المرور الجديدة" dir="rtl" />
              <Input type="password" {...passwordForm.register("confirmPassword")} placeholder="تأكيد كلمة المرور الجديدة" dir="rtl" />
              
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive text-right">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <DialogFooter className="gap-2 flex-row-reverse sm:justify-start">
              <Button type="submit" disabled={passLoading}>
                {passLoading ? "جاري التحديث..." : "تحديث كلمة المرور"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPasswordOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-destructive/20">
          <DialogHeader className="text-right">
            <DialogTitle className="text-destructive">حذف الحساب نهائياً</DialogTitle>
            <DialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك واختباراتك.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={deleteForm.handleSubmit(async (data) => {
              if (!user) return;
              try {
                await deleteAccount(data.password);
                router.replace("/");
              } catch (err) {
                showFeedback("error", "كلمة المرور غير صحيحة.");
              }
            })}
            className="space-y-4 pt-4"
          >
            <Input type="password" {...deleteForm.register("password")} placeholder="أدخل كلمة المرور للتأكيد" dir="rtl" />
            <DialogFooter className="gap-2 flex-row-reverse sm:justify-start">
              <Button type="submit" variant="destructive" disabled={deleteLoading}>
                {deleteLoading ? "جاري الحذف..." : "تأكيد حذف الحساب"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)}>إلغاء</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}