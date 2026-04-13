"use client";

import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "success" | "warning" | "destructive" | "outline";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  secondary: "bg-surface-container-high text-on-surface-variant border-outline-variant/30",
  success: "bg-secondary/10 text-secondary border-secondary/20",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  outline: "bg-transparent border-outline-variant text-on-surface-variant",
};

export function StatusBadge({ 
  children, 
  variant = "default", 
  className 
}: StatusBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border transition-all",
      VARIANTS[variant],
      className
    )}>
      {children}
    </span>
  );
}
