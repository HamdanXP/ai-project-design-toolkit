
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
  
  // Get projectId from URL query params
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId') || 'current';
  
  // Get activePhaseId from context
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
      
      // Update the project phase status via API
      if (projectId !== 'current') {
        api.projects.updatePhaseStatus(projectId, phaseId, "in-progress", 0)
          .catch(() => {
            // Silent fallback - handled by localStorage in the API module
          });
      }
    } else {
      toast({
        title: "Phase Locked",
        description: "You need to complete previous phases first.",
        variant: "destructive"
      });
    }
  };
  
  // Enhanced complete phase handler with API integration
  const handleCompletePhaseWithApi = async (phaseId: string) => {
    handleCompletePhase(phaseId);
    
    // Also update via API if we have a project ID
    if (projectId !== 'current') {
      try {
        await api.projects.completePhase(projectId, phaseId);
      } catch (error) {
        // Silent catch - already handled by localStorage in the API module
      }
    }
  };
  
  // Enhanced update phase status handler with API integration
  const handleUpdatePhaseStatusWithApi = async (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => {
    updatePhaseStatus(phaseId, status, progress);
    
    // Also update via API if we have a project ID
    if (projectId !== 'current') {
      try {
        await api.projects.updatePhaseStatus(projectId, phaseId, status, progress);
      } catch (error) {
        // Silent catch - already handled by localStorage in the API module
      }
    }
  };
  
  // Enhanced complete project handler with API integration
  const handleCompleteProjectWithApi = async () => {
    handleCompleteProject();
    
    // Also update via API if we have a project ID
    if (projectId !== 'current') {
      try {
        await api.projects.completeProject(projectId);
        navigate(`/project-completion?projectId=${projectId}`);
      } catch (error) {
        // Fallback to default behavior
        navigate('/project-completion');
      }
    } else {
      navigate('/project-completion');
    }
  };
  
  // Enhanced progress handlers with API integration
  const handlePhaseProgressWithApi = async (phaseId: string, completed: number, total: number) => {
    const progress = Math.round((completed / total) * 100);
    
    // Update phase progress in the API if we have a project ID
    if (projectId !== 'current') {
      try {
        await api.projects.updatePhaseProgress(projectId, phaseId, progress);
      } catch (error) {
        // Silent catch - already handled by localStorage in the API module
      }
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
                handlePhaseProgressWithApi("reflection", completed, total);
              }}
              handleScopingProgress={(completed, total) => {
                handleScopingProgress(completed, total);
                handlePhaseProgressWithApi("scoping", completed, total);
              }}
              handleDevelopmentProgress={(completed, total) => {
                handleDevelopmentProgress(completed, total);
                handlePhaseProgressWithApi("development", completed, total);
              }}
              handleEvaluationProgress={(completed, total) => {
                handleEvaluationProgress(completed, total);
                handlePhaseProgressWithApi("evaluation", completed, total);
              }}
              handleCompleteProject={handleCompleteProjectWithApi}
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
