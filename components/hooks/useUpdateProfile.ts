
import { useState } from "react";
import { userService } from "../../lib/services/user.service";

export function useUpdateProfile(refreshProfile: () => Promise<void>) {
  const [loading, setLoading] = useState(false);

  const updateProfile = async (uid: string, name: string) => {
    setLoading(true);
    try {
      await userService.updateProfile(uid, { name });
      await refreshProfile();
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading };
}