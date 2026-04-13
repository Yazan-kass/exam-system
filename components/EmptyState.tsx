"use client";

import { LucideIcon, Ghost } from "lucide-react";
import { LoadingButton } from "./LoadingButton";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  title, 
  description, 
  icon: Icon = Ghost, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/50",
      className
    )}>
      <div className="flex size-20 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant/40 mb-6">
        <Icon className="size-10" />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">{title}</h3>
      <p className="text-on-surface-variant mb-8 max-w-sm leading-relaxed">
        {description}
      </p>
      {action && (
        <LoadingButton onClick={action.onClick} className="px-8">
          {action.label}
        </LoadingButton>
      )}
    </div>
  );
}
