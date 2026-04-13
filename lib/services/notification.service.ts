// lib/services/notification.service.ts
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  Timestamp,
  getDocs
} from "firebase/firestore";

export interface AppNotification {
  id: string;
  userId: string; // Target user
  title: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

export const MOTIVATIONAL_MESSAGES = [
  "أنت تبلي بلاءً حسناً! استمر في التقدم نحو النجاح 🚀",
  "تذكر أن كل جهد تبذله اليوم يقربك من هدفك غداً 🌟",
  "ذكاؤك ليس له حدود، استمر في المذاكرة والتميز 📖",
  "أنت فخر لنا! واصل التحدي وحقق أفضل النتائج 💪",
  "لا تتوقف عن التعلم، فالمستقبل ينتظر المبدعين مثلك ✨"
];

export const notificationService = {
  /**
   * Send a notification to a specific user
   */
  async sendNotification(data: Omit<AppNotification, "id" | "createdAt" | "read">): Promise<string> {
    const docRef = await addDoc(collection(db, "notifications"), {
      ...data,
      read: false,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  },

  /**
   * Send notifications to all students (e.g. on new exam)
   */
  async notifyAllStudents(title: string, message: string): Promise<void> {
    // Get all student UIDs from users collection
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const querySnapshot = await getDocs(q);
    
    const batchPromises = querySnapshot.docs.map(studentDoc => 
      this.sendNotification({
        userId: studentDoc.id,
        title,
        message
      })
    );
    
    await Promise.all(batchPromises);
  },

  /**
   * Real-time notifications for a specific user
   */
  subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppNotification));
      callback(notifications);
    });
  },

  /**
   * Mark as read
   */
  async markAsRead(id: string): Promise<void> {
    const docRef = doc(db, "notifications", id);
    await updateDoc(docRef, { read: true });
  },

  /**
   * Send a success notification after exam completion
   */
  async sendExamSuccessNotification(userId: string, examName: string, score: number, total: number): Promise<void> {
    const percentage = Math.round((score / total) * 100);
    let message = `لقد أكملت اختبار "${examName}" بنجاح! درجتك هي ${score} من ${total} (${percentage}%).`;
    
    if (percentage >= 90) message += " أداء أسطوري ومتميز جداً! 🌟";
    else if (percentage >= 75) message += " عمل رائع، أحسنت! 👍";
    
    await this.sendNotification({
      userId,
      title: "تهانينا! تم إكمال الاختبار",
      message
    });
  },

  /**
   * Send a random motivational message
   */
  async sendMotivationalNotification(userId: string): Promise<void> {
    const randomMsg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
    await this.sendNotification({
      userId,
      title: "رسالة تحفيزية لك ✨",
      message: randomMsg
    });
  },

  /**
   * Send notification for an upcoming scheduled exam
   */
  async notifyUpcomingExam(userId: string, examName: string, startTime: Timestamp): Promise<void> {
    const dateStr = startTime.toDate().toLocaleString('ar-SA', { 
      weekday: 'long', 
      hour: 'numeric', 
      minute: 'numeric' 
    });
    
    await this.sendNotification({
      userId,
      title: "تذكير باختبار قادم ⏰",
      message: `لديك اختبار "${examName}" مجدول في ${dateStr}. استعد جيداً!`
    });
  }
};
