import { Timestamp } from "firebase/firestore";

export const MOCK_SUBJECTS = [
  {
    id: "math-01",
    title: "الرياضيات والتحليل العددي",
    description: "دراسة شاملة للتفاضل والتكامل والمصفوفات مع تطبيقات عملية في البرمجة والتحليل الإحصائي.",
    examsCount: 8,
  },
  {
    id: "physics-01",
    title: "الفيزياء الحديثة",
    description: "مقدمة في ميكانيكا الكم والنسبية، والتعرف على القوى الأساسية في الكون وتطبيقاتها التكنولوجية.",
    examsCount: 5,
  },
  {
    id: "arabic-01",
    title: "الأدب العربي والبلاغة",
    description: "استكشاف روائع الأدب العربي من المعلقات إلى العصر الحديث، مع التركيز على علوم البلاغة والنقد.",
    examsCount: 12,
  }
];

export const MOCK_QUESTIONS = [
  // الرياضيات
  {
    subjectId: "math-01",
    text: "ما هو ناتج مشتقة الدالة f(x) = x^2؟",
    options: ["x", "2x", "x^2", "2"],
    correctAnswer: 1
  },
  {
    subjectId: "math-01",
    text: "أي من التالي يمثل مصفوفة الوحدة (Identity Matrix)؟",
    options: ["جميع عناصرها 1", "جميع عناصرها 0", "القطر الرئيسي 1 والباقي 0", "القطر الرئيسي 0 والباقي 1"],
    correctAnswer: 2
  },
  {
    subjectId: "math-01",
    text: "ما هي قيمة π (باي) التقريبية؟",
    options: ["3.14", "2.71", "1.61", "1.41"],
    correctAnswer: 0
  },
  // الفيزياء
  {
    subjectId: "physics-01",
    text: "من هو واضع نظرية النسبية؟",
    options: ["إسحاق نيوتن", "ألبرت أينشتاين", "ماكس بلانك", "نيلز بور"],
    correctAnswer: 1
  },
  {
    subjectId: "physics-01",
    text: "ما هي وحدة قياس القوة في النظام الدولي؟",
    options: ["جول", "واط", "نيوتن", "باسكال"],
    correctAnswer: 2
  },
  // العربي
  {
    subjectId: "arabic-01",
    text: "من هو شاعر الرسول صلى الله عليه وسلم؟",
    options: ["المتنبي", "حسان بن ثابت", "أحمد شوقي", "عنترة بن شداد"],
    correctAnswer: 1
  },
  {
    subjectId: "arabic-01",
    text: "ما هو إعراب كلمة 'الطالب' في جملة 'جاء الطالبُ'؟",
    options: ["مفعول به", "مبتدأ", "فاعل مرفوع", "خبر"],
    correctAnswer: 2
  }
];

export const getMockResults = (studentId: string, studentName: string) => [
  {
    studentId,
    studentName,
    subjectId: "math-01",
    subjectName: "الرياضيات",
    examName: "اختبار التفاضل الأساسي",
    score: 85,
    totalQuestions: 10,
    status: "مكتمل" as const,
    duration: "15:00",
    date: Timestamp.now()
  },
  {
    studentId,
    studentName,
    subjectId: "physics-01",
    subjectName: "الفيزياء",
    examName: "مقدمة في الميكانيكا",
    score: 92,
    totalQuestions: 10,
    status: "مكتمل" as const,
    duration: "12:30",
    date: Timestamp.now()
  }
];
