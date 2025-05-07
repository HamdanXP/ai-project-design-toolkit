
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  variant?: "home" | "back";
  label?: string;
  className?: string;
}

export const BackButton = ({ 
  variant = "back", 
  label,
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (variant === "home") {
      navigate("/");
    } else {
      navigate(-1);
    }
  };

  return (
    <Button 
      onClick={handleClick}
      variant="ghost" 
      size="sm"
      className={`flex items-center gap-1 hover:bg-accent/50 transition-all rounded-full p-2 h-auto ${className}`}
    >
      {variant === "home" ? (
        <Home className="h-4 w-4 mr-1" />
      ) : (
        <ArrowLeft className="h-4 w-4 mr-1" />
      )}
      {label && <span className="text-sm">{label}</span>}
    </Button>
  );
};
