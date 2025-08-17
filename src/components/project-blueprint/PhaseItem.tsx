
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { ProjectPhase } from "@/types/project";
import { useEffect, useState, useRef } from "react";

interface PhaseItemProps {
  phase: ProjectPhase;
  isActive: boolean;
  isOpen: boolean;
  isMobile: boolean;
  onSelect: () => void;
  getStatusColor: (status: ProjectPhase["status"]) => string;
}

export const PhaseItem = ({ 
  phase, 
  isActive, 
  isOpen, 
  isMobile,
  onSelect, 
  getStatusColor 
}: PhaseItemProps) => {
  const [renderedPhase, setRenderedPhase] = useState(phase);
  const initialRender = useRef(true);
  
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    const isInvalidTransition = renderedPhase.status === "completed" && phase.status === "in-progress";
    
    if (!isInvalidTransition) {
      console.log(`PhaseItem updated: ${phase.id}, status: ${phase.status}, progress: ${phase.progress}`);
      setRenderedPhase(phase);
    } else {
      console.warn(`Prevented invalid transition for ${phase.id}: completed -> in-progress`);
    }
  }, [phase]);
  
  const isCompleted = renderedPhase.status === "completed";
  
  return (
    <div
      className={cn(
        "mb-2 p-2 rounded-md cursor-pointer transition-all",
        isActive
          ? "bg-primary/10 border-l-2 border-primary"
          : "hover:bg-accent/50",
        isCompleted ? "border-l-2 border-emerald-500" : ""
      )}
      onClick={onSelect}
    >
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "h-3 w-3 rounded-full mr-2",
            getStatusColor(renderedPhase.status)
          )}
        />
        <span
          className={cn(
            "text-sm font-medium",
            !isMobile && !isOpen ? "hidden" : "block",
            isCompleted ? "text-emerald-600" : ""
          )}
        >
          {renderedPhase.name}
          {isCompleted && " ✓"}
        </span>
      </div>
      {(isMobile || isOpen) && (
        <div className="pl-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{isCompleted ? renderedPhase.totalSteps : renderedPhase.completedSteps}/{renderedPhase.totalSteps}</span>
          </div>
          <Progress
            value={renderedPhase.progress}
            className={cn(
              "h-1.5",
              isCompleted ? "bg-emerald-100" : ""
            )}
            indicatorClassName={isCompleted ? "bg-emerald-500" : undefined}
          />
        </div>
      )}
    </div>
  );
};
