import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  questionText: string;
  options: string[];
  onAnswerChange?: (selectedOption: string) => void;
  selectedAnswer?: string;
  isReview?: boolean;
  correctAnswer?: string;
  isManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function QuestionCard({
  questionNumber,
  totalQuestions,
  questionText,
  options,
  onAnswerChange,
  selectedAnswer,
  isReview = false,
  correctAnswer,
  isManage = false,
  onEdit,
  onDelete
}: QuestionCardProps) {
  return (
    <Card className="p-8 bg-surface-container-lowest border-none shadow-[0px_20px_50px_rgba(25,28,30,0.06)] rounded-2xl mb-6 relative group border border-outline-variant/20 hover:border-outline-variant/50 transition-colors">
      <div className="flex justify-between items-center mb-6">
        <span className="text-on-surface-variant text-sm font-medium">سؤال {questionNumber} من {totalQuestions}</span>
        {isReview && !isManage && (
           <span className={`text-sm font-bold px-3 py-1 rounded-full ${selectedAnswer === correctAnswer ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
             {selectedAnswer === correctAnswer ? 'إجابة صحيحة' : 'إجابة خاطئة'}
           </span>
        )}
        {isManage && (
           <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onEdit} className="text-primary hover:bg-primary/10">تعديل</Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive hover:bg-destructive/10">حذف</Button>
           </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-on-surface mb-8 leading-relaxed max-w-4xl">{questionText}</h3>
      
      <div className="flex flex-col gap-4">
        {options.map((option, idx) => {
          let optionClasses = "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ";
          
          if (isReview) {
             if (option === correctAnswer) {
                optionClasses += "border-secondary bg-secondary/5";
             } else if (option === selectedAnswer && option !== correctAnswer) {
                optionClasses += "border-destructive bg-destructive/5";
             } else {
                optionClasses += "border-transparent bg-surface-container-low";
             }
          } else {
             if (selectedAnswer === option) {
                optionClasses += "border-primary bg-primary/5 ring-4 ring-primary/10";
             } else {
                optionClasses += "border-transparent bg-surface-container-low hover:bg-surface-container-high";
             }
          }

          return (
            <div 
                key={idx} 
                className={optionClasses}
                onClick={() => !isReview && onAnswerChange?.(option)}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isReview ? (option === correctAnswer ? 'border-secondary bg-secondary' : (option === selectedAnswer ? 'border-destructive bg-destructive' : 'border-outline-variant')) : (selectedAnswer === option ? 'border-primary bg-primary' : 'border-outline-variant')}`}>
                 {(isReview && option === correctAnswer || selectedAnswer === option) && (
                     <div className="w-2 h-2 rounded-full bg-surface-container-lowest"></div>
                 )}
              </div>
              <Label className="text-lg text-on-surface flex-1 cursor-pointer leading-relaxed">{option}</Label>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
