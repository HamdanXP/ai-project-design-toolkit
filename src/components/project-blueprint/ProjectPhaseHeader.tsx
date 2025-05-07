
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

type ProjectPhaseHeaderProps = {
  isMobile: boolean;
  toggleSidebar: () => void;
};

export const ProjectPhaseHeader = ({
  isMobile,
  toggleSidebar,
}: ProjectPhaseHeaderProps) => {
  return (
    <div className="flex items-center mb-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="mr-2 p-1 h-7 w-7"
          onClick={toggleSidebar}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
