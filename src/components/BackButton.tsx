
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export const BackButton = ({ 
  label = "Back",
  className = ""
}: BackButtonProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(-1);
  };

  return (
    <Button 
      onClick={handleClick}
      variant="ghost" 
      size="sm"
      className={`flex items-center gap-2 hover:bg-accent/50 transition-all rounded-md px-3 py-2 h-auto ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );
};
