"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { userService, Role, AppUserProfile } from "../lib/services/user.service";

interface AuthContextType {
  user: User | null;
  profile: AppUserProfile | null;
  role: Role | null;
  loading: boolean;
  setRole: (role: Role | null) => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  setRole: () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (auth.currentUser) {
      try {
        const updatedProfile = await userService.getProfile(auth.currentUser.uid);
        setProfile(updatedProfile);
        setRole(updatedProfile?.role || null);
      } catch (err) {
        console.error("Error refreshing profile:", err);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser: User | null) => {
      setUser(authUser);
      if (authUser) {
        try {
          const userProfile = await userService.getProfile(authUser.uid);
          setProfile(userProfile);
          setRole(userProfile?.role || null);
        } catch (err) {
          console.error("Error fetching profile on auth change:", err);
          setRole(null);
        }
      } else {
        setProfile(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, setRole, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
