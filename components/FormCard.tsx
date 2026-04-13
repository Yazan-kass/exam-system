"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

interface FormCardProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export function FormCard({ children, title, description, className }: FormCardProps) {
  return (
    <Card className={cn(
      "w-full max-w-md shadow-[0px_20px_50px_rgba(25,28,30,0.06)] bg-surface-container-lowest border-none rounded-3xl overflow-hidden", 
      className
    )}>
      <CardHeader className="pt-8 pb-4">
        <CardTitle className="text-2xl font-bold text-center text-primary">{title}</CardTitle>
        {description && (
          <CardDescription className="text-center text-on-surface-variant mt-2 text-base">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pb-8 px-8">
        {children}
      </CardContent>
    </Card>
  );
}
