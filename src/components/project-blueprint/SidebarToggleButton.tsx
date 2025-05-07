
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarToggleButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SidebarToggleButton = ({ isOpen, onToggle }: SidebarToggleButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="p-1 h-7 w-7"
      onClick={onToggle}
    >
      {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </Button>
  );
};
