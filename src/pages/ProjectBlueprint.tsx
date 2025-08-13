import { useState, useEffect, useRef } from "react";
import { TopBar } from "@/components/TopBar";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useProjectPhases } from "@/hooks/useProjectPhases";
import { ProjectBlueprintSidebar } from "@/components/project-blueprint/ProjectBlueprintSidebar";
import { ProjectPhaseContent } from "@/components/project-blueprint/ProjectPhaseContent";
import { ProjectPhaseHeader } from "@/components/project-blueprint/ProjectPhaseHeader";
import { useProject } from "@/contexts/ProjectContext";
import { api } from "@/lib/api";
import { useLocation, useNavigate } from "react-router-dom";

const ProjectBlueprint = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  
  useEffect(() => {
    console.log('ProjectBlueprint loaded with projectId:', projectId);
  }, [projectId]);
  
  const { activePhaseId } = useProject();

  const {
    phases,
    setActivePhaseId,
    handleCompletePhase,
    updatePhaseStatus,
    handleReflectionProgress,
    handleScopingProgress,
    handleDevelopmentProgress,
    handleEvaluationProgress,
    handleCompleteProject,
    allPhasesCompleted,
    canAccessPhase
  } = useProjectPhases();

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

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
    if (canAccessPhase(phaseId)) {
      setActivePhaseId(phaseId);
      
      if (isMobile) {
        setSidebarOpen(false);
      }
    } else {
      toast({
        title: "Phase Locked",
        description: "You need to complete previous phases first.",
        variant: "destructive"
      });
    }
  };
  
  const handleCompletePhaseWithApi = async (phaseId: string) => {
    handleCompletePhase(phaseId);
  };
  
  const handleUpdatePhaseStatusWithApi = async (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => {
    updatePhaseStatus(phaseId, status, progress);
    
  };
  
  const handleCompleteProjectWithApi = async () => {
    handleCompleteProject();
    
    if (projectId) {
      try {
        await api.projects.completeProject(projectId);
        navigate(`/project-completion?projectId=${projectId}`);
      } catch (error) {
        navigate('/project-completion');
      }
    } else {
      navigate('/project-completion');
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
          <ProjectPhaseHeader 
            isMobile={isMobile}
            toggleSidebar={toggleSidebar}
            toggleBtnRef={toggleBtnRef}
            activePhaseId={activePhaseId}
            phases={phases}
            sidebarOpen={sidebarOpen}
          />
          
          <div className="max-w-4xl mx-auto">
            <ProjectPhaseContent
              activePhaseId={activePhaseId}
              handleCompletePhase={handleCompletePhaseWithApi}
              updatePhaseStatus={handleUpdatePhaseStatusWithApi}
              canAccessPhase={canAccessPhase}
              handleReflectionProgress={(completed, total) => {
                handleReflectionProgress(completed, total);
              }}
              handleScopingProgress={(completed, total) => {
                handleScopingProgress(completed, total);
              }}
              handleDevelopmentProgress={(completed, total) => {
                handleDevelopmentProgress(completed, total);
              }}
              handleEvaluationProgress={(completed, total) => {
                handleEvaluationProgress(completed, total);
              }}
              handleCompleteProject={handleCompleteProjectWithApi}
              allPhasesCompleted={allPhasesCompleted}
              phases={phases}
              setActivePhaseId={setActivePhaseId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBlueprint;