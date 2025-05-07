
import { useState, useEffect } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProjectBlueprintSidebar, ProjectPhase } from "@/components/ProjectBlueprintSidebar";
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { ScopingPhase } from "@/components/ScopingPhase";
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { useIsMobile } from "@/hooks/use-mobile";

const ProjectBlueprint = () => {
  const navigate = useNavigate();
  const [activePhaseId, setActivePhaseId] = useState("reflection");
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
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
      totalSteps: 5,
      completedSteps: 0
    },
    {
      id: "development",
      name: "Development",
      status: "not-started",
      progress: 0,
      totalSteps: 10,
      completedSteps: 0
    },
    {
      id: "evaluation",
      name: "Evaluation",
      status: "not-started",
      progress: 0,
      totalSteps: 3,
      completedSteps: 0
    }
  ]);

  useEffect(() => {
    // Close sidebar by default on mobile
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleGoBack = () => {
    navigate("/");
  };

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
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col md:flex-row pt-16">
        <ProjectBlueprintSidebar 
          phases={phases} 
          activePhase={activePhaseId}
          setActivePhase={setActivePhaseId}
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
        />
        
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={handleGoBack}
              size="sm"
              className="flex items-center"
            >
              <ChevronLeft className="mr-1 size-4" /> Back to Home
            </Button>

            {isMobile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleSidebar}
              >
                {sidebarOpen ? "Hide Phases" : "Show Phases"}
              </Button>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            {activePhaseId === "reflection" && (
              <ReflectionPhase onUpdateProgress={handleReflectionProgress} />
            )}
            {activePhaseId === "scoping" && (
              <ScopingPhase />
            )}
            {activePhaseId === "development" && (
              <DevelopmentPhase />
            )}
            {activePhaseId === "evaluation" && (
              <EvaluationPhase />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBlueprint;
