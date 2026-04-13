"use client";

import { useState, useEffect } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
import { FormCard } from "./FormCard";
import { FormInput } from "./FormInput";
import { LoadingButton } from "./LoadingButton";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

// New Services
import { examService, SubjectDTO } from "../lib/services/exam.service";

interface QuestionFormData {
  text: string;
  options: string[];
  correctAnswer: number;
  subjectId: string;
}

interface QuestionFormProps {
  onSave: (data: QuestionFormData) => void;
  onCancel: () => void;
  initialData?: QuestionFormData;
  subjects?: SubjectDTO[]; // Accept as prop if available
}

export function QuestionForm({ onSave, onCancel, initialData, subjects: initialSubjects }: QuestionFormProps) {
  const [text, setText] = useState(initialData?.text || "");
  const [options, setOptions] = useState<string[]>(initialData?.options || ["", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<number>(initialData?.correctAnswer ?? 0);
  const [subjectId, setSubjectId] = useState<string>(initialData?.subjectId || "");
  const [subjects, setSubjects] = useState<SubjectDTO[]>(initialSubjects || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (subjects.length === 0) {
      const fetchSubjects = async () => {
        try {
          const data = await examService.getSubjects();
          if (isMounted) {
            setSubjects(data);
            if (data.length > 0 && !subjectId) {
              setSubjectId(data[0].id);
            }
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
        }
      };
      fetchSubjects();
    } else if (!subjectId && subjects.length > 0) {
      setSubjectId(subjects[0].id);
    }
    return () => { isMounted = false; };
  }, [subjectId, subjects]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleOptionChange = (index: number, val: string) => {
    const newOptions = [...options];
    newOptions[index] = val;
    setOptions(newOptions);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    if (correctAnswer >= newOptions.length) {
       setCorrectAnswer(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text || options.some(opt => !opt) || !subjectId) {
      alert("يرجى إكمال جميع الحقول وإضافة خيارين على الأقل.");
      return;
    }
    setLoading(true);
    try {
      await onSave({ text, options, correctAnswer, subjectId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard 
      title={initialData ? "تعديل السؤال" : "إضافة سؤال جديد"}
      className="max-w-4xl mb-6 shadow-none border-none bg-transparent p-0"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <Label className="text-on-surface-variant font-medium text-base">المادة الدراسية</Label>
          <select 
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full h-12 rounded-xl bg-surface-container-low border-2 border-outline-variant/30 px-4 focus:border-secondary outline-none font-bold"
          >
            {subjects.length === 0 && <option value="">جاري تحميل المواد...</option>}
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        <FormInput
          label="نص السؤال"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب السؤال هنا..."
        />

        <div className="space-y-4">
          <Label className="text-on-surface-variant font-medium text-base">الخيارات المتاحة (حدد الإجابة الصحيحة)</Label>
          <div className="grid grid-cols-1 gap-4">
            {options.map((opt, idx) => (
              <div 
                key={idx} 
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all group",
                  correctAnswer === idx 
                    ? "border-secondary bg-secondary/5 ring-4 ring-secondary/5" 
                    : "border-outline-variant/30 bg-surface-container-low hover:border-outline-variant/60"
                )}
              >
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors",
                    correctAnswer === idx ? "border-secondary bg-secondary" : "border-outline-variant group-hover:border-outline-variant/80"
                  )}
                  onClick={() => setCorrectAnswer(idx)}
                >
                  {correctAnswer === idx && <div className="w-2 h-2 rounded-full bg-white"></div>}
                </div>
                
                <input
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`الخيار ${idx + 1}`}
                  className="flex-1 text-right bg-transparent border-none focus:outline-none font-bold text-on-surface placeholder:text-on-surface-variant/40"
                />

                {options.length > 2 && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    type="button"
                    onClick={() => handleRemoveOption(idx)} 
                    className="text-destructive hover:bg-destructive/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5"/>
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button 
            type="button"
            variant="outline" 
            onClick={handleAddOption}
            className="w-full border-dashed border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-secondary hover:border-secondary h-12 rounded-xl mt-4 transition-all"
          >
            <PlusCircle className="ml-2 w-5 h-5" />
            إضافة خيار
          </Button>
        </div>

        <div className="flex gap-4 pt-4">
          <LoadingButton 
            type="submit" 
            loading={loading}
            className="flex-1 h-14 font-black shadow-lg shadow-primary/20"
          >
            حفظ السؤال
          </LoadingButton>
          <Button 
            type="button"
            onClick={onCancel} 
            variant="ghost" 
            className="flex-1 bg-surface-container-high text-on-surface-variant hover:bg-surface-container-low h-14 rounded-xl text-lg font-bold"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </FormCard>
  );
}
