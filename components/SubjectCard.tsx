import { LucideIcon, Pencil, Trash2, Plus, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface SubjectCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  examCount?: number;
  questionCount?: number;
  onActionClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isTeacher?: boolean;
   primaryAction: string;
}

export function SubjectCard({
  title,
  description,
  icon: Icon,
  examCount = 0,
  questionCount = 0,
  onActionClick,
  onEdit,
  onDelete,
  isTeacher = false
}: SubjectCardProps) {
  return (
    <Card 
      onClick={onActionClick}
      className={`flex flex-col md:flex-row items-center justify-between p-5 gap-6 bg-surface-container-lowest border border-border/40 shadow-sm rounded-[2rem] transition-all hover:shadow-xl group ${onActionClick ? 'cursor-pointer hover:border-primary/40' : ''}`}
    >
      {/* Right Side: Title & Icon */}
    <div className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-2xl border border-border/40 bg-surface transition-colors hover:bg-surface-container-low">

  {/* Right: Title + Icon */}
  <div className="md:col-span-3 flex items-center justify-end gap-4 text-right">
    <div className="size-14 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-colors">
      <Icon className="size-7" />
    </div>
    <div>
      <h3 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
        {title}
      </h3>
    </div>
   
  </div>

  {/* Description */}
  <div className="md:col-span-4">
    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-2">
      {description}
    </p>
  </div>

  {/* Stats */}
  <div className="md:col-span-3 flex flex-wrap items-center gap-3 justify-start md:justify-center">
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface-variant">
      <Plus className="size-4 text-primary" />
      <span>{questionCount} سؤال</span>
    </div>

    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high text-xs font-semibold text-on-surface-variant">
      <FileText className="size-4 text-primary/70" />
      <span>{examCount} اختبار</span>
    </div>
  </div>

  {/* Actions */}
  {isTeacher && (
    <div className="md:col-span-2  flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 ">
      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        className="h-12 w-12 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors"
      >
        <Pencil className="size-5" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="h-12 w-12 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
      >
        <Trash2 className="size-5" />
      </Button>
    </div>
  )}
</div>
      
    </Card>
  );
}
