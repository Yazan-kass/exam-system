// lib/services/user.service.ts
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from "firebase/firestore";

export type Role = "student" | "teacher";

export interface AppUserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export const userService = {
  /**
   * Get user profile by UID
   */
  async getProfile(uid: string): Promise<AppUserProfile | null> {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as AppUserProfile;
  },

  /**
   * Create a new user profile
   */
  async createProfile(profile: AppUserProfile): Promise<void> {
    const docRef = doc(db, "users", profile.uid);
    await setDoc(docRef, {
      ...profile,
      createdAt: profile.createdAt || Timestamp.now()
    });
  },

  /**
   * Update an existing user profile
   */
  async updateProfile(uid: string, data: Partial<AppUserProfile>): Promise<void> {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  },

  /**
   * Delete user profile
   */
  async deleteProfile(uid: string): Promise<void> {
    const docRef = doc(db, "users", uid);
    await deleteDoc(docRef);
  },

  /**
   * Upload profile picture to Firebase Storage
   */
  async uploadProfilePicture(uid: string, file: File): Promise<string> {
    const { storage } = await import("../firebase");
    const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
    
    const storageRef = ref(storage, `profile_pictures/${uid}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Update the profile in Firestore as well
    await this.updateProfile(uid, { photoURL: downloadURL });
    
    return downloadURL;
  }
};
