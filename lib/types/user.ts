import { Timestamp } from "firebase/firestore";
import { User } from "firebase/auth";

export type Role = "student" | "teacher";

export interface AppUserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface AuthState {
  user: User | null;
  profile: AppUserProfile | null;
  loading: boolean;
  error: string | null;
}