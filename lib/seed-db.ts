import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "firebase/firestore";
import { MOCK_SUBJECTS, MOCK_QUESTIONS, getMockResults } from "./mock-data";

export const seedDatabase = async (user?: { uid: string, name: string }) => {
  console.log("Seeding database...");

  // 1. Clear existing subjects and questions (optional, but good for fresh start)
  // Note: Only clear if you want a complete reset.
  
  // 2. Add Subjects
  const subjectsRef = collection(db, "subjects");
  const subjectsSnapshot = await getDocs(subjectsRef);
  
  if (subjectsSnapshot.empty) {
    for (const subject of MOCK_SUBJECTS) {
      await addDoc(subjectsRef, subject);
    }
    console.log("Added subjects.");
  }

  // 3. Add Questions
  const questionsRef = collection(db, "questions");
  const questionsSnapshot = await getDocs(questionsRef);
  
  if (questionsSnapshot.empty) {
    for (const question of MOCK_QUESTIONS) {
      await addDoc(questionsRef, question);
    }
    console.log("Added questions.");
  }

  // 4. Add Results if user is provided
  if (user) {
    const resultsRef = collection(db, "results");
    const resultsSnapshot = await getDocs(resultsRef);
    if (resultsSnapshot.empty) {
      const mockResults = getMockResults(user.uid, user.name || "أحمد");
      for (const result of mockResults) {
        await addDoc(resultsRef, result);
      }
      console.log("Added results for student.");
    }
  }

  console.log("Seeding complete!");
};
