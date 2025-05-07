
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useRef } from "react";
import { ProjectPhase } from "@/hooks/useProjectPhases";

type ProjectBlueprintSidebarProps = {
  phases: ProjectPhase[];
  activePhase: string;
  setActivePhase: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export const ProjectBlueprintSidebar = ({
  phases,
  activePhase,
  setActivePhase,
  isOpen,
  onToggle,
}: ProjectBlueprintSidebarProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);

  const getStatusColor = (status: ProjectPhase["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500";
      case "in-progress":
        return "bg-primary";
      default:
        return "bg-muted";
    }
  };

  // Handle touch swipe to close sidebar on mobile
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;
    
    let touchStartX: number;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX || !isOpen) return;
      
      const touchX = e.touches[0].clientX;
      const diff = touchStartX - touchX;
      
      // If swiped left more than 50px, close the sidebar
      if (diff > 50) {
        onToggle();
        touchStartX = 0;
      }
    };
    
    const element = containerRef.current;
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMobile, isOpen, onToggle]);

  if (isMobile && !isOpen) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "transition-all duration-300 ease-in-out bg-card border-r border-border h-full z-10",
        isMobile ? (isOpen ? "fixed top-16 left-0 bottom-0 w-[250px]" : "hidden") : "relative",
        !isMobile && (isOpen ? "w-[250px]" : "w-[60px]")
      )}
    >
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h2 className={cn("font-medium text-foreground", !isOpen && !isMobile ? "hidden" : "block")}>Project Phases</h2>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-7 w-7"
          onClick={onToggle}
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </Button>
      </div>
      <div className="overflow-y-auto p-2 h-[calc(100%-56px)]">
        {phases.map((phase) => (
          <div
            key={phase.id}
            className={cn(
              "mb-2 p-2 rounded-md cursor-pointer transition-all",
              activePhase === phase.id
                ? "bg-primary/10 border-l-2 border-primary"
                : "hover:bg-accent/50"
            )}
            onClick={() => setActivePhase(phase.id)}
          >
            <div className="flex items-center mb-2">
              <div
                className={cn(
                  "h-3 w-3 rounded-full mr-2",
                  getStatusColor(phase.status)
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  !isMobile && !isOpen ? "hidden" : "block"
                )}
              >
                {phase.name}
              </span>
            </div>
            {(isMobile || isOpen) && (
              <div className="pl-5">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{phase.completedSteps}/{phase.totalSteps}</span>
                </div>
                <Progress
                  value={phase.progress}
                  className="h-1.5"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
