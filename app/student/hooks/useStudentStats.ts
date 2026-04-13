// app/student/hooks/useStudentStats.ts
import { useState, useEffect } from "react";
import { studentService, StudentStats } from "../../../lib/services/student.service";

export function useStudentStats(studentId: string) {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const data = await studentService.getStudentStats(studentId);
      setStats(data);
    } catch (err) {
      console.error("Error fetching student stats:", err);
      setError("فشل تحميل الإحصائيات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [studentId]);

  return { stats, loading, error, refreshStats: fetchStats };
}
