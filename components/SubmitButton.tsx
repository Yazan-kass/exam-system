import { Button } from "./ui/button";
import { CheckCircle } from "lucide-react";

interface SubmitButtonProps {
  onClick: () => void;
  text: string;
  isSubmitting?: boolean;
}

export function SubmitButton({ onClick, text, isSubmitting = false }: SubmitButtonProps) {
  return (
    <Button 
        onClick={onClick} 
        disabled={isSubmitting}
        className="bg-gradient-to-br from-primary to-blue-700 text-white hover:from-primary hover:to-primary hover:shadow-[0px_20px_50px_rgba(37,99,235,0.2)] transition-all h-14 px-10 text-xl font-bold rounded-xl flex items-center gap-3"
    >
      {text}
      <CheckCircle className="w-6 h-6" />
    </Button>
  );
}
