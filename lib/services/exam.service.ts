// lib/services/exam.service.ts
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp, 
  orderBy,
  onSnapshot,
  limit
} from "firebase/firestore";
import { 
  SubjectSchema, 
  QuestionSchema, 
  ExamSchema, 
  ResultSchema,
} from "../schemas/exam.schema";
import type {
  SubjectDTO,
  QuestionDTO,
  ExamDTO,
  ResultDTO
} from "../schemas/exam.schema";

// Standard Service Response wrapper
export interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
}

export const examService = {
  // --- SUBJECTS ---
  async getSubjects(): Promise<SubjectDTO[]> {
    try {
      // For a professional system, we calculate real-time counts from the exams collection
      const subjectsSnap = await getDocs(collection(db, "subjects"));
      const examsSnap = await getDocs(collection(db, "exams"));
      
      const counts: Record<string, number> = {};
      examsSnap.docs.forEach(doc => {
        const sid = doc.data().subjectId;
        if (sid) counts[sid] = (counts[sid] || 0) + 1;
      });

      return subjectsSnap.docs.reduce<SubjectDTO[]>((acc, doc) => {
        const validated = SubjectSchema.safeParse({ 
          id: doc.id, 
          ...doc.data(),
          examsCount: counts[doc.id] || 0 // Use dynamic count for UI consistency
        });
        if (validated.success) acc.push(validated.data);
        else console.warn(`Invalid subject data for ${doc.id}:`, validated.error);
        return acc;
      }, []);
    } catch (err) {
      console.error("Failed to fetch subjects:", err);
      return [];
    }
  },

  async createSubject(subject: Omit<SubjectDTO, "id" | "examsCount">): Promise<string> {
    const docRef = await addDoc(collection(db, "subjects"), {
      ...subject,
      examsCount: 0
    });
    return docRef.id;
  },

  async updateSubject(id: string, data: Partial<SubjectDTO>): Promise<void> {
    const docRef = doc(db, "subjects", id);
    await updateDoc(docRef, data);
  },

  async getSubjectById(id: string): Promise<SubjectDTO | null> {
    try {
      const docRef = doc(db, "subjects", id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;

      // Also get the real count for this specific subject
      const examsSnap = await getDocs(query(collection(db, "exams"), where("subjectId", "==", id)));
      
      const validated = SubjectSchema.safeParse({ 
        id: snap.id, 
        ...snap.data(),
        examsCount: examsSnap.size 
      });
      return validated.success ? validated.data : null;
    } catch (err) {
      console.error("Failed to fetch subject detail:", err);
      return null;
    }
  },

  async deleteSubject(id: string): Promise<void> {
    const docRef = doc(db, "subjects", id);
    await deleteDoc(docRef);
  },

  // --- QUESTIONS ---
  async getQuestions(subjectId?: string): Promise<QuestionDTO[]> {
    const collRef = collection(db, "questions");
    const q = subjectId 
      ? query(collRef, where("subjectId", "==", subjectId))
      : query(collRef);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce<QuestionDTO[]>((acc, doc) => {
      const validated = QuestionSchema.safeParse({ id: doc.id, ...doc.data() });
      if (validated.success) acc.push(validated.data);
      return acc;
    }, []);
  },

  async createQuestion(question: Omit<QuestionDTO, "id">): Promise<string> {
    const docRef = await addDoc(collection(db, "questions"), question);
    return docRef.id;
  },

  async updateQuestion(id: string, data: Partial<QuestionDTO>): Promise<void> {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, data);
  },

  async deleteQuestion(id: string): Promise<void> {
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
  },

  // --- EXAMS ---
  async getExams(teacherId?: string): Promise<ExamDTO[]> {
    const collRef = collection(db, "exams");
    const q = teacherId 
      ? query(collRef, where("teacherId", "==", teacherId), orderBy("createdAt", "desc"))
      : query(collRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce<ExamDTO[]>((acc, doc) => {
      const validated = ExamSchema.safeParse({ id: doc.id, ...doc.data() });
      if (validated.success) acc.push(validated.data);
      return acc;
    }, []);
  },

  async createExam(exam: Omit<ExamDTO, "id" | "createdAt" | "teacherName">): Promise<string> {
    // Professional: Add with auto-increment examsCount on subject
    const docRef = await addDoc(collection(db, "exams"), {
      ...exam,
      createdAt: Timestamp.now()
    });

    // Update subject count (Increment)
    try {
      const subjectRef = doc(db, "subjects", exam.subjectId);
      const subjectSnap = await getDoc(subjectRef);
      if (subjectSnap.exists()) {
        const currentCount = subjectSnap.data().examsCount || 0;
        await updateDoc(subjectRef, { examsCount: currentCount + 1 });
      }
    } catch (err) {
      console.error("Failed to increment subject exams count:", err);
    }

    return docRef.id;
  },

  async updateExam(id: string, data: Partial<ExamDTO>): Promise<void> {
    const docRef = doc(db, "exams", id);
    await updateDoc(docRef, data);
  },

  async deleteExam(id: string): Promise<void> {
    try {
      const examRef = doc(db, "exams", id);
      const examSnap = await getDoc(examRef);
      
      if (examSnap.exists()) {
        const subjectId = examSnap.data().subjectId;
        await deleteDoc(examRef);

        // Update subject count (Decrement)
        const subjectRef = doc(db, "subjects", subjectId);
        const subjectSnap = await getDoc(subjectRef);
        if (subjectSnap.exists()) {
          const currentCount = Math.max(0, (subjectSnap.data().examsCount || 0) - 1);
          await updateDoc(subjectRef, { examsCount: currentCount });
        }
      }
    } catch (err) {
      console.error("Failed to delete exam and decrement count:", err);
      throw err;
    }
  },

  async getExamsBySubject(subjectId: string): Promise<ExamDTO[]> {
    const collRef = collection(db, "exams");
    const q = query(collRef, where("subjectId", "==", subjectId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce<ExamDTO[]>((acc, doc) => {
      const validated = ExamSchema.safeParse({ id: doc.id, ...doc.data() });
      if (validated.success) acc.push(validated.data);
      return acc;
    }, []);
  },

  async getExamById(id: string): Promise<ExamDTO | null> {
    const docRef = doc(db, "exams", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const validated = ExamSchema.safeParse({ id: snap.id, ...snap.data() });
    return validated.success ? validated.data : null;
  },

  async checkExistingAttempt(studentId: string, examId: string): Promise<ResultDTO | null> {
    const collRef = collection(db, "results");
    const q = query(
      collRef, 
      where("studentId", "==", studentId), 
      where("examId", "==", examId),
      limit(1)
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    const validated = ResultSchema.safeParse({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
    return validated.success ? validated.data : null;
  },

  // --- RESULTS ---
  async getResults(studentId?: string, limitCount: number = 20): Promise<ResultDTO[]> {
    const collRef = collection(db, "results");
    let q = query(collRef, orderBy("date", "desc"), limit(limitCount));
    
    if (studentId) {
      q = query(collRef, where("studentId", "==", studentId), orderBy("date", "desc"), limit(limitCount));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce<ResultDTO[]>((acc, doc) => {
      const validated = ResultSchema.safeParse({ id: doc.id, ...doc.data() });
      if (validated.success) acc.push(validated.data);
      return acc;
    }, []);
  },

  async saveResult(result: Omit<ResultDTO, "id" | "date">): Promise<string> {
    const docRef = await addDoc(collection(db, "results"), {
      ...result,
      date: Timestamp.now()
    });
    return docRef.id;
  },

  async getResultsByTeacher(teacherId: string): Promise<ResultDTO[]> {
    const collRef = collection(db, "results");
    const q = query(collRef, where("teacherId", "==", teacherId), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.reduce<ResultDTO[]>((acc, doc) => {
      const validated = ResultSchema.safeParse({ id: doc.id, ...doc.data() });
      if (validated.success) acc.push(validated.data);
      return acc;
    }, []);
  },

  async getResultById(id: string): Promise<ResultDTO | null> {
    const docRef = doc(db, "results", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const validated = ResultSchema.safeParse({ id: snap.id, ...snap.data() });
    return validated.success ? validated.data : null;
  },

  // Subscriptions - Still useful but we emphasize declarative fetching now
  subscribeToExams(callback: (exams: ExamDTO[]) => void, teacherId?: string) {
    const collRef = collection(db, "exams");
    const q = teacherId 
      ? query(collRef, where("teacherId", "==", teacherId), orderBy("createdAt", "desc"))
      : query(collRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const exams = snapshot.docs.reduce<ExamDTO[]>((acc, doc) => {
        const v = ExamSchema.safeParse({ id: doc.id, ...doc.data() });
        if (v.success) acc.push(v.data);
        return acc;
      }, []);
      callback(exams);
    });
  }
};

// Re-export Schemas for UI/Validation usage
export { SubjectSchema, QuestionSchema, ExamSchema, ResultSchema };
export type { SubjectDTO, QuestionDTO, ExamDTO, ResultDTO };
