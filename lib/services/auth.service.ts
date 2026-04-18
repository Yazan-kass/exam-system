// lib/services/auth.service.ts
import { auth } from "../firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User
} from "firebase/auth";
import { userService } from "./user.service";
import type { Role, AppUserProfile } from "../types/user";
import { Timestamp } from "firebase/firestore";

export const authService = {
  /**
   * Google Sign-In with profile creation
   */
  async signInWithGoogle(defaultRole: Role = "student"): Promise<{ user: User; profile: AppUserProfile }> {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    let profile = await userService.getProfile(user.uid);
    if (!profile) {
      profile = {
        uid: user.uid,
        name: user.displayName || "Unknown User",
        email: user.email || "",
        role: defaultRole,
        createdAt: Timestamp.now()
      };
      await userService.createProfile(profile);
    }
    return { user, profile };
  },

  /**
   * Register with email/password and profile creation
   */
  async register(email: string, pass: string, name: string, role: Role): Promise<{ user: User; profile: AppUserProfile }> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const profile: AppUserProfile = {
      uid: user.uid,
      name,
      email,
      role,
      createdAt: Timestamp.now()
    };
    await userService.createProfile(profile);
    return { user, profile };
  },

  /**
   * Login with email/password
   */
  async login(email: string, pass: string): Promise<{ user: User; profile: AppUserProfile }> {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;

    const profile = await userService.getProfile(user.uid);
    if (!profile) {
      throw new Error("User profile not found in Firestore.");
    }
    return { user, profile };
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await signOut(auth);
  }
};
