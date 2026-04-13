"use client";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  containerClassName?: string;
}

export function FormInput({ 
  label, 
  error, 
  id, 
  className, 
  containerClassName, 
  ...props 
}: FormInputProps) {
  return (
    <div className={cn("flex flex-col space-y-2.5", containerClassName)}>
      <Label htmlFor={id} className="text-right text-on-surface-variant font-medium">
        {label}
      </Label>
      <Input
        id={id}
        className={cn(
          "text-right bg-surface-container-high border-none h-12 rounded-xl focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-0 transition-all shadow-sm",
          error && "ring-2 ring-destructive",
          className
        )}
        {...props}
      />
      {error && (
        <span className="text-xs text-destructive text-right mt-1">{error}</span>
      )}
    </div>
  );
}
