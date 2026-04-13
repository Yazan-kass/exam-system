
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6, "كلمة المرور ضعيفة"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "غير متطابقة",
  path: ["confirmPassword"],
});

export const deleteSchema = z.object({
  password: z.string().min(6),
});