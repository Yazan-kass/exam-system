"use client";

import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  description, 
  children, 
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10", className)}>
      <div className="space-y-1.5">
        <h2 className="text-3xl font-bold tracking-tight text-on-surface leading-normal">
          {title}
          
        </h2>
        {description && (
          <div className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {children}
      </div>
    </div>
  );
}
