
import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useToast } from "@/hooks/use-toast";
import { ProjectBlueprintSidebar } from "@/components/ProjectBlueprintSidebar";
import { ProjectPhaseContent } from "@/components/ProjectPhaseContent";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectPhases } from "@/hooks/useProjectPhases";

const ProjectBlueprint = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);

  const {
    phases,
    activePhaseId,
    setActivePhaseId,
    handleCompletePhase,
    handleReflectionProgress,
    handleScopingProgress,
    handleDevelopmentProgress,
    handleEvaluationProgress,
    handleCompleteProject,
    allPhasesCompleted,
    canAccessPhase
  } = useProjectPhases();

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

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const handleSetActivePhase = (phaseId: string) => {
    // Only allow setting active phase if previous phases are completed
    if (canAccessPhase(phaseId)) {
      setActivePhaseId(phaseId);
    } else {
      toast({
        title: "Phase Locked",
        description: "You need to complete previous phases first.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopBar />
      <div className="flex-1 flex flex-col md:flex-row pt-16">
        <div ref={sidebarRef}>
          <ProjectBlueprintSidebar 
            phases={phases} 
            activePhase={activePhaseId}
            setActivePhase={handleSetActivePhase}
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
            <ProjectPhaseContent
              activePhaseId={activePhaseId}
              handleCompletePhase={handleCompletePhase}
              canAccessPhase={canAccessPhase}
              handleReflectionProgress={handleReflectionProgress}
              handleScopingProgress={handleScopingProgress}
              handleDevelopmentProgress={handleDevelopmentProgress}
              handleEvaluationProgress={handleEvaluationProgress}
              handleCompleteProject={handleCompleteProject}
              allPhasesCompleted={allPhasesCompleted}
              phases={phases}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBlueprint;
