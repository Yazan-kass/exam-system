"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { userService } from "../lib/services/user.service";
import type { AppUserProfile, Role } from "../lib/types/user";

interface AuthContextType {
  user: User | null;
  profile: AppUserProfile | null;
  role: Role | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  role: null,
  loading: true,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Derived role for easier access, but it's fundamentally tied to the profile
  const role: Role | null = profile?.role || null;

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    try {
      const updatedProfile = await userService.getProfile(user.uid);
      setProfile(updatedProfile);
    } catch (err) {
      console.error("Error refreshing profile:", err);
    }
  };

  useEffect(() => {
    // onAuthStateChanged is the standard way to listen for auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Fetch profile whenever the user signs in or the session is restored
          const userProfile = await userService.getProfile(firebaseUser.uid);
          setProfile(userProfile);
        } catch (err) {
          console.error("Error fetching profile on auth change:", err);
          setProfile(null);
        }
      } else {
        // User is signed out
        setProfile(null);
      }
      
      // Finished initial loading only after both auth and (if applicable) profile are handled
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, role, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);