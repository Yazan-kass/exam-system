import { z } from "zod";
import { Timestamp } from "firebase/firestore";

// Helper for Firestore Timestamp validation
const TimestampSchema = z.instanceof(Timestamp).or(
  z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  })
).transform((val) => {
  if (val instanceof Timestamp) return val.toDate();
  return new Timestamp(val.seconds, val.nanoseconds).toDate();
});

export const SubjectSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "العنوان قصير جداً"),
  description: z.string(),
  examsCount: z.number().default(0),
});

export const QuestionSchema = z.object({
  id: z.string(),
  subjectId: z.string(),
  text: z.string().min(5, "نص السؤال قصير جداً"),
  options: z.array(z.string()).min(2, "يجب وجود خيارين على الأقل"),
  correctAnswer: z.number().min(0),
});

export const ExamSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "عنوان الاختبار قصير جداً"),
  subjectId: z.string(),
  teacherId: z.string(),
  teacherName: z.string().optional(),
  duration: z.number().min(1, "المدة يجب أن تكون دقيقة واحدة على الأقل"),
  questionIds: z.array(z.string()),
  startTime: TimestampSchema,
  endTime: TimestampSchema,
  createdAt: TimestampSchema.optional(),
});

export const ResultSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  studentName: z.string(),
  teacherId: z.string().optional(), // Added for teacher stats
  examId: z.string(),
  subjectId: z.string(),
  subjectName: z.string(),
  examName: z.string(),
  score: z.number(),
  totalQuestions: z.number(),
  selectedAnswers: z.record(z.string(), z.number()),
  date: TimestampSchema,
  duration: z.string(),
  status: z.enum(["مكتمل", "قيد التجربة"]),
});

export type SubjectDTO = z.infer<typeof SubjectSchema>;
export type QuestionDTO = z.infer<typeof QuestionSchema>;
export type ExamDTO = z.infer<typeof ExamSchema>;
export type ResultDTO = z.infer<typeof ResultSchema>;
