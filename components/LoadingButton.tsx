"use client";

import { Button, buttonVariants } from "./ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean; // From primitive if needed, but we wrap Button
}

export function LoadingButton({ 
  children, 
  loading, 
  loadingText, 
  className, 
  disabled, 
  variant,
  size,
  ...props 
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      variant={variant}
      size={size}
      className={cn(
        "h-12 rounded-xl font-bold text-lg transition-all",
        variant === "secondary" ? "bg-secondary text-white hover:bg-green-800" : (variant === "outline" ? "" : "bg-gradient-to-br from-primary to-blue-700 text-white hover:shadow-lg"),
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText || "جاري التحميل..."}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
