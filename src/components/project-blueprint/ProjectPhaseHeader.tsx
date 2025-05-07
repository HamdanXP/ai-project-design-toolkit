
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface ProjectPhaseHeaderProps {
  isMobile: boolean;
  toggleSidebar: () => void;
}

export const ProjectPhaseHeader = ({ isMobile, toggleSidebar }: ProjectPhaseHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <BackButton />

      {isMobile && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
