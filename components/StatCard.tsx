"use client";

import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isUp?: boolean;
  };
  color?: "primary" | "secondary" | "tertiary" | "destructive";
}

const COLOR_VARIANTS = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-amber-100 text-amber-700",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  color = "primary" 
}: StatCardProps) {
  return (
    <Card className="border-border/60 shadow-[0px_10px_30px_rgba(25,28,30,0.04)] hover:shadow-[0px_20px_50px_rgba(25,28,30,0.08)] transition-all overflow-hidden rounded-2xl group">
      <CardContent className="flex items-center justify-between py-6 px-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-on-surface">{value}</h3>
            {trend && (
              <span className={cn(
                "text-xs font-bold",
                trend.isUp ? "text-secondary" : "text-destructive"
              )}>
                {trend.value}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-on-surface-variant/70">{description}</p>
          )}
        </div>
        <div className={cn(
          "flex size-14 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 duration-300",
          COLOR_VARIANTS[color]
        )}>
          <Icon className="size-7" />
        </div>
      </CardContent>
    </Card>
  );
}
