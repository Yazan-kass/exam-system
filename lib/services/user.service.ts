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
import type { AppUserProfile } from "../types/user";

export const userService = {
  /**
   * Get user profile by UID
   * @param uid Firebase User ID
   * @returns AppUserProfile or null
   */
  async getProfile(uid: string): Promise<AppUserProfile | null> {
    if (!uid) return null;
    
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      
      if (!snap.exists()) return null;
      
      const data = snap.data();
      return {
        uid: snap.id,
        ...data
      } as AppUserProfile;
    } catch (error: any) {
      console.error(`Error in getProfile for ${uid}:`, error);
      throw new Error(`تعذر جلب بيانات الحساب: ${error.message}`);
    }
  },

  /**
   * Create or merge a new user profile
   */
  async createProfile(profile: AppUserProfile): Promise<void> {
    try {
      const docRef = doc(db, "users", profile.uid);
      await setDoc(docRef, {
        ...profile,
        createdAt: profile.createdAt || Timestamp.now(),
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error: any) {
      console.error("Error creating profile:", error);
      throw new Error("فشل في إنشاء حساب المستخدم في قاعدة البيانات");
    }
  },

  /**
   * Update an existing user profile
   */
  async updateProfile(uid: string, data: Partial<AppUserProfile>): Promise<void> {
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      throw new Error("فشل في تحديث بيانات الحساب");
    }
  },

  /**
   * Delete user profile
   */
  async deleteProfile(uid: string): Promise<void> {
    try {
      const docRef = doc(db, "users", uid);
      await deleteDoc(docRef);
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      throw new Error("فشل في حذف الحساب");
    }
  },

  /**
   * Upload profile picture to Firebase Storage
   */
  async uploadProfilePicture(uid: string, file: File): Promise<string> {
    try {
      const { storage } = await import("../firebase");
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
      
      const storageRef = ref(storage, `profile_pictures/${uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      await this.updateProfile(uid, { photoURL: downloadURL });
      return downloadURL;
    } catch (error: any) {
      console.error("Error uploading profile picture:", error);
      throw new Error("فشل في رفع الصورة الشخصية");
    }
  }
};
