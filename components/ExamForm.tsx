"use client";

import { useState, useEffect } from "react";
import { FormCard } from "./FormCard";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { Label } from "./ui/label";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { Input } from "./ui/input";

// New Services
import { examService, SubjectDTO } from "../lib/services/exam.service";

interface ExamFormProps {
  onSave: (data: { 
    title: string; 
    duration: number; 
    subjectId: string;
    startTime: string;
    endTime: string;
  }) => void;
  initialData?: { 
    title: string; 
    duration: number; 
    subjectId: string;
    startTime?: string;
    endTime?: string;
  };
}

export function ExamForm({ onSave, initialData }: ExamFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [duration, setDuration] = useState<number>(initialData?.duration || 60);
  const [subjectId, setSubjectId] = useState(initialData?.subjectId || "");
  const [startTime, setStartTime] = useState(initialData?.startTime || "");
  const [endTime, setEndTime] = useState(initialData?.endTime || "");
  
  const [subjects, setSubjects] = useState<SubjectDTO[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await examService.getSubjects();
        setSubjects(data);
        // If initial subjectId matches one of the fetched subjects, keep it.
        // Otherwise, if we have subjects and no initial ID, pick the first one.
        if (data.length > 0 && !subjectId) {
          setSubjectId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, [subjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || duration <= 0 || !subjectId || !startTime || !endTime) {
      alert("يرجى إكمال جميع الحقول المطلوبة بما في ذلك المواعيد.");
      return;
    }
    setLoading(true);
    try {
      await onSave({ title, duration, subjectId, startTime, endTime });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard 
      title="إعدادات وجدولة الاختبار" 
      className="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-bold flex items-center gap-2">
              <BookOpen className="size-4 text-primary" />
              المادة الدراسية
            </Label>
            <select 
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full h-12 rounded-xl bg-surface-container-low border-2 border-outline-variant/30 px-4 focus:border-secondary outline-none font-bold"
            >
              <option value="" disabled>اختر المادة</option>
              {loadingSubjects ? <option disabled>جاري التحميل...</option> : subjects.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <FormInput
            label="عنوان الاختبار"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: اختبار منتصف الفصل"
          />
        </div>

        {/* Schedule & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
           <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                <Clock className="size-4 text-secondary" />
                المدة (دقيقة)
              </Label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                className="h-12 rounded-xl"
                dir="ltr"
              />
           </div>
           <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                وقت البدء
              </Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 rounded-xl"
                dir="ltr"
              />
           </div>
           <div className="space-y-2">
              <Label className="font-bold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                وقت الانتهاء
              </Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12 rounded-xl"
                dir="ltr"
              />
           </div>
        </div>

        <LoadingButton 
          type="submit" 
          loading={loading}
          variant="secondary"
          className="w-full h-14 font-black shadow-lg shadow-secondary/20 rounded-2xl"
        >
          {initialData ? "حفظ التغييرات" : "المتابعة لاختيار الأسئلة"}
        </LoadingButton>
      </form>
    </FormCard>
  );
}
