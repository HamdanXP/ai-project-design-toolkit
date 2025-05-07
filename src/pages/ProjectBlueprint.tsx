
import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectBlueprintSidebar, ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { ScopingPhase } from "@/components/ScopingPhase";
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { useIsMobile } from "@/hooks/use-mobile";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";

const ProjectBlueprint = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activePhaseId, setActivePhaseId] = useState("reflection");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  
  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: "reflection",
      name: "Reflection",
      status: "in-progress",
      progress: 0,
      totalSteps: 7,
      completedSteps: 0
    },
    {
      id: "scoping",
      name: "Scoping",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "development",
      name: "Development",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "evaluation",
      name: "Evaluation",
      status: "not-started",
      progress: 0,
      totalSteps: 4,
      completedSteps: 0
    }
  ]);

  // Check if all phases are completed
  const allPhasesCompleted = phases.every(phase => phase.status === "completed");

  useEffect(() => {
    // Close sidebar by default on mobile
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile && 
        sidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) && 
        toggleBtnRef.current && 
        !toggleBtnRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          const progress = Math.round((completed / total) * 100);
          const status = 
            progress === 0 ? "not-started" :
            progress === 100 ? "completed" : "in-progress";
          
          return {
            ...phase,
            progress,
            completedSteps: completed,
            status
          };
        }
        return phase;
      })
    );
  };

  const handleReflectionProgress = (completed: number, total: number) => {
    updatePhaseProgress("reflection", completed, total);
    
    // If reflection is completed, automatically move to scoping
    if (completed === total) {
      toast({
        title: "Reflection Phase Completed!",
        description: "You've completed the Reflection Phase. Moving to Scoping Phase.",
      });
      setTimeout(() => setActivePhaseId("scoping"), 500);
    }
  };

  const handleScopingProgress = (completed: number, total: number) => {
    updatePhaseProgress("scoping", completed, total);
    
    // If scoping is completed, automatically move to development
    if (completed === total) {
      toast({
        title: "Scoping Phase Completed!",
        description: "You've completed the Scoping Phase. Moving to Development Phase.",
      });
      setTimeout(() => setActivePhaseId("development"), 500);
    }
  };

  const handleDevelopmentProgress = (completed: number, total: number) => {
    updatePhaseProgress("development", completed, total);
    
    // If development is completed, automatically move to evaluation
    if (completed === total) {
      toast({
        title: "Development Phase Completed!",
        description: "You've completed the Development Phase. Moving to Evaluation Phase.",
      });
      setTimeout(() => setActivePhaseId("evaluation"), 500);
    }
  };

  const handleEvaluationProgress = (completed: number, total: number) => {
    updatePhaseProgress("evaluation", completed, total);
    
    // If evaluation is completed, show project completion notification
    if (completed === total) {
      toast({
        title: "Evaluation Phase Completed!",
        description: "You've completed all phases of your project!",
      });
    }
  };

  const handleCompleteProject = () => {
    navigate('/project-completion');
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col md:flex-row pt-16">
        <div ref={sidebarRef}>
          <ProjectBlueprintSidebar 
            phases={phases} 
            activePhase={activePhaseId}
            setActivePhase={setActivePhaseId}
            isOpen={sidebarOpen}
            onToggle={toggleSidebar}
          />
        </div>
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <BackButton />

            {isMobile && (
              <Button 
                ref={toggleBtnRef}
                variant="outline" 
                size="icon" 
                onClick={toggleSidebar}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            {activePhaseId === "reflection" && (
              <ReflectionPhase onUpdateProgress={handleReflectionProgress} />
            )}
            {activePhaseId === "scoping" && (
              <ScopingPhase onUpdateProgress={handleScopingProgress} />
            )}
            {activePhaseId === "development" && (
              <DevelopmentPhase onUpdateProgress={handleDevelopmentProgress} />
            )}
            {activePhaseId === "evaluation" && (
              <EvaluationPhase onUpdateProgress={handleEvaluationProgress} />
            )}
            
            {allPhasesCompleted && (
              <div className="mt-8 flex justify-center">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg px-8"
                  onClick={handleCompleteProject}
                >
                  Complete Project
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBlueprint;
