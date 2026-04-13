// lib/services/student.service.ts
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";
import { ExamDTO, ResultDTO, ExamSchema, ResultSchema } from "./exam.service";

export interface StudentStats {
  totalCompleted: number;
  upcomingExams: number;
  averageScore: number;
  performancePercentage: number;
}

export const studentService = {
  /**
   * Fetch stats for a student
   */
  async getStudentStats(studentId: string): Promise<StudentStats> {
    const resultsRef = collection(db, "results");
    const qResults = query(resultsRef, where("studentId", "==", studentId));
    const resultsSnap = await getDocs(qResults);
    
    const results = resultsSnap.docs.reduce<ResultDTO[]>((acc, doc) => {
      const v = ResultSchema.safeParse({ id: doc.id, ...doc.data() });
      if (v.success) acc.push(v.data);
      return acc;
    }, []);

    const totalCompleted = results.length;
    
    let totalScorePercent = 0;
    results.forEach(r => {
      if (r.totalQuestions > 0) {
        totalScorePercent += (r.score / r.totalQuestions) * 100;
      }
    });

    const averageScore = totalCompleted > 0 ? (totalScorePercent / totalCompleted) / 20 : 0; 
    const performancePercentage = totalCompleted > 0 ? (totalScorePercent / totalCompleted) : 0;

    const examsRef = collection(db, "exams");
    const now = Timestamp.now();
    const qExams = query(examsRef, where("startTime", ">", now));
    const examsSnap = await getDocs(qExams);
    const upcomingExams = examsSnap.size;

    return {
      totalCompleted,
      upcomingExams,
      averageScore: Number(averageScore.toFixed(2)),
      performancePercentage: Math.round(performancePercentage)
    };
  },

  /**
   * Get categorized exams for a student
   */
  async getCategorizedExams(studentId: string): Promise<{ upcoming: ExamDTO[], completed: ResultDTO[] }> {
    const resultsRef = collection(db, "results");
    const qResults = query(resultsRef, where("studentId", "==", studentId));
    const resultsSnap = await getDocs(qResults);
    
    const completed = resultsSnap.docs.reduce<ResultDTO[]>((acc, doc) => {
      const v = ResultSchema.safeParse({ id: doc.id, ...doc.data() });
      if (v.success) acc.push(v.data);
      return acc;
    }, []);

    const examsRef = collection(db, "exams");
    const examsSnap = await getDocs(examsRef);
    
    const allExams = examsSnap.docs.reduce<ExamDTO[]>((acc, doc) => {
      const v = ExamSchema.safeParse({ id: doc.id, ...doc.data() });
      if (v.success) acc.push(v.data);
      return acc;
    }, []);

    const now = Timestamp.now().toMillis();
    const completedExamIds = new Set(completed.map(r => r.examId));

    const upcoming = allExams.filter(e => 
      !completedExamIds.has(e.id) && e.endTime.getTime() > now
    );

    return { upcoming, completed };
  },

  /**
   * Get teacher name by ID
   */
  async getTeacherName(teacherId: string): Promise<string> {
    if (!teacherId) return "معلم مجهول";
    const docRef = doc(db, "users", teacherId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return "معلم مجهول";
    return snap.data().name || "معلم مجهول";
  }
};
