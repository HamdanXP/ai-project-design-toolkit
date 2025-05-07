
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ProjectPhase = {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
  totalSteps: number;
  completedSteps: number;
};

type ProjectBlueprintSidebarProps = {
  phases: ProjectPhase[];
  activePhase: string;
  setActivePhase: (id: string) => void;
};

export const ProjectBlueprintSidebar = ({
  phases,
  activePhase,
  setActivePhase,
}: ProjectBlueprintSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div
      className={cn(
        "transition-all duration-300 ease-in-out bg-card border-r border-border h-full relative",
        isCollapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      <div className="p-4 flex justify-between items-center border-b border-border">
        <h2 className={cn("font-medium text-foreground", isCollapsed ? "hidden" : "block")}>Project Phases</h2>
        <Button
          variant="ghost"
          size="sm"
          className="p-1 h-7 w-7"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      <div className="overflow-y-auto p-2">
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
                  isCollapsed ? "hidden" : "block"
                )}
              >
                {phase.name}
              </span>
            </div>
            {!isCollapsed && (
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
