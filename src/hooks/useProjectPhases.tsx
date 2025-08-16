import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { ProjectPhase } from "@/types/project";
import { useToast } from "@/hooks/useToast";

export const useProjectPhases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    phases, 
    setPhases, 
    activePhaseId, 
    setActivePhaseId, 
    projectPrompt, 
    projectFiles, 
    setScopingFinalDecision 
  } = useProject();
  
  const updatePhaseStatus = (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => {
    if (phaseId === "scoping") {
      if (status === "in-progress") {
        if (progress >= 100) {
          setScopingFinalDecision('proceed');
        } else if (progress >= 80) {
          setScopingFinalDecision('revise');
        }
      }
      
      if (status === "completed") {
        setScopingFinalDecision('proceed');
      }
    }
    
    const currentPhase = phases.find(p => p.id === phaseId);
    
    if (currentPhase && 
        currentPhase.status === status && 
        currentPhase.progress === progress) {
      console.log(`Skipping redundant update for phase ${phaseId}`);
      return;
    }
    
    console.log(`Updating phase ${phaseId} to status: ${status}, progress: ${progress}`);
    
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          const completedSteps = status === "completed" ? phase.totalSteps : Math.round((progress / 100) * phase.totalSteps);
          
          const updatedPhase = {
            ...phase,
            status,
            progress: status === "completed" ? 100 : progress,
            completedSteps
          };
          
          console.log(`Updated phase ${phaseId}:`, updatedPhase);
          return updatedPhase;
        }
        return phase;
      })
    );
  };

  const handleCompletePhase = (phaseId: string) => {
    console.log(`Completing phase: ${phaseId}`);
    
    updatePhaseStatus(phaseId, "completed", 100);
    
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    console.log("Phase completed with data:", phaseData);
    
    const phaseOrder = phases.map(p => p.id);
    const currentIndex = phaseOrder.indexOf(phaseId);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhaseId = phaseOrder[currentIndex + 1];
      
      updatePhaseStatus(nextPhaseId, "in-progress", Math.min(10, 100 / phases.length));
      
      setActivePhaseId(nextPhaseId);
      
      toast({
        title: "Phase Completed",
        description: `You've completed the ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} phase!`,
      });
    }
  };

  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    const currentPhase = phases.find(p => p.id === phaseId);
    
    if (currentPhase?.status === "completed") {
      console.log(`Phase ${phaseId} is already completed. Not updating progress.`);
      return;
    }
    
    const progress = Math.round((completed / total) * 100);
    
    if (currentPhase?.progress === progress) {
      console.log(`Progress for phase ${phaseId} hasn't changed (${progress}%). Skipping update.`);
      return;
    }
    
    console.log(`Updating progress for phase ${phaseId}: ${completed}/${total} = ${progress}%`);
    
    updatePhaseStatus(phaseId, currentPhase?.status || "in-progress", progress);
  };

  const handleReflectionProgress = (completed: number, total: number) => {
    updatePhaseProgress("reflection", completed, total);
  };

  const handleScopingProgress = (completed: number, total: number) => {
    updatePhaseProgress("scoping", completed, total);
  };

  const handleDevelopmentProgress = (completed: number, total: number) => {
    updatePhaseProgress("development", completed, total);
  };

  const handleEvaluationProgress = (completed: number, total: number) => {
    updatePhaseProgress("evaluation", completed, total);
  };

  const handleCompleteProject = () => {
    const projectData = {
      prompt: projectPrompt,
      files: projectFiles,
      phases,
      completedAt: new Date().toISOString()
    };
    
    console.log("Project completed with data:", projectData);
    navigate('/project-completion');
  };

  const allPhasesCompleted = phases.every(phase => phase.status === "completed");
  
  const canAccessPhase = (phaseId: string) => {
    const phaseOrder = phases.map(p => p.id);
    
    if (phaseId === phaseOrder[0]) return true;
    
    const targetIndex = phaseOrder.indexOf(phaseId);
    
    for (let i = 0; i < targetIndex; i++) {
      const previousPhase = phases.find(p => p.id === phaseOrder[i]);
      if (previousPhase?.status !== "completed") {
        return false;
      }
    }
    
    return true;
  };

  return {
    phases,
    activePhaseId,
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
  };
};