export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = "UNKNOWN_ERROR",
    public statusCode: number = 500,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) return error;

  const err = error as { code?: string; message?: string };

  // Firebase Auth Errors
  if (err.code?.startsWith("auth/")) {
    switch (err.code) {
      case "auth/user-not-found":
        return new AppError("المستخدم غير موجود", "USER_NOT_FOUND", 404, error);
      case "auth/wrong-password":
        return new AppError("كلمة المرور غير صحيحة", "WRONG_PASSWORD", 401, error);
      case "auth/email-already-in-use":
        return new AppError("البريد الإلكتروني مستخدم بالفعل", "EMAIL_EXISTS", 400, error);
      default:
        return new AppError("خطأ في المصادقة", "AUTH_ERROR", 401, error);
    }
  }

  // Firestore Errors
  if (err.code?.startsWith("permission-denied")) {
    return new AppError("ليس لديك صلاحية للقيام بهذا الإجراء", "PERMISSION_DENIED", 403, error);
  }

  console.error("[System Error]:", error);
  return new AppError("حدث خطأ غير متوقع في النظام", "INTERNAL_SERVER_ERROR", 500, error);
};
