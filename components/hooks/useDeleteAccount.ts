import { useState } from "react";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { userService } from "../../lib/services/user.service";

export function useDeleteAccount(user: any) {
  const [loading, setLoading] = useState(false);

  const deleteAccount = async (password: string) => {
    if (!user?.email) throw new Error("No user");

    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);

      await userService.deleteProfile(user.uid);
      await deleteUser(user);
    } finally {
      setLoading(false);
    }
  };

  return { deleteAccount, loading };
}