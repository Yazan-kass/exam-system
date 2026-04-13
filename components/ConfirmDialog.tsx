"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { LoadingButton } from "./LoadingButton";
import { Button } from "./ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default" | "secondary";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "default",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl border-none shadow-2xl">
        <DialogHeader className="text-right">
          <DialogTitle className="text-xl font-bold text-on-surface">{title}</DialogTitle>
          <DialogDescription className="text-on-surface-variant pt-2 leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-3 pt-6 sm:justify-start">
          <LoadingButton
            onClick={onConfirm}
            loading={loading}
            variant={variant === "destructive" ? "default" : (variant as any)}
            className={variant === "destructive" ? "bg-destructive hover:bg-destructive/90 text-white" : ""}
          >
            {confirmLabel}
          </LoadingButton>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="bg-surface-container-high hover:bg-surface-container-low"
          >
            {cancelLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
