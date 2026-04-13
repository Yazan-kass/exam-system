import { useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export function useChangePassword(user: any) {
  const [loading, setLoading] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) throw new Error("No user");

    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading };
}