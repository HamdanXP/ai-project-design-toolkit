import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { ProjectPhase } from "@/types/project";
import { useToast } from "@/hooks/use-toast";

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
  
  // Explicitly set the status of a phase - this is the ONLY function that should update phase status
  const updatePhaseStatus = (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => {
    // Special handling for scoping "ready to proceed" (100%) vs "revise approach" (80%)
    if (phaseId === "scoping") {
      if (status === "in-progress") {
        if (progress === 100) {
          setScopingFinalDecision('proceed');
        } else if (progress === 80) {
          setScopingFinalDecision('revise');
        }
      }
      
      // If status is completed, ensure scopingFinalDecision is 'proceed'
      if (status === "completed") {
        setScopingFinalDecision('proceed');
      }
    }
    
    console.log(`Updating phase ${phaseId} to status: ${status}, progress: ${progress}`);
    
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // Calculate completedSteps based on the provided progress percentage
          const completedSteps = status === "completed" ? phase.totalSteps : Math.round((progress / 100) * phase.totalSteps);
          
          const updatedPhase = {
            ...phase,
            status,
            progress: status === "completed" ? 100 : progress, // Ensure completed phases show 100%
            completedSteps
          };
          
          console.log(`Updated phase ${phaseId}:`, updatedPhase);
          return updatedPhase;
        }
        return phase;
      })
    );
  };

  // This is now the ONLY function that completes a phase and moves to the next phase
  const handleCompletePhase = (phaseId: string) => {
    console.log(`Completing phase: ${phaseId}`);
    
    // Mark the phase as completed - this is critical
    updatePhaseStatus(phaseId, "completed", 100);
    
    // Store phase data
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    console.log("Phase completed with data:", phaseData);
    
    // Determine the next phase to activate
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const currentIndex = phaseOrder.indexOf(phaseId);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhaseId = phaseOrder[currentIndex + 1];
      
      // Update the next phase to in-progress 
      updatePhaseStatus(nextPhaseId, "in-progress", 5);
      
      // Move to the next phase
      setActivePhaseId(nextPhaseId);
      
      toast({
        title: "Phase Completed",
        description: `You've completed the ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} phase!`,
      });
    }
  };

  // These functions provide a simple interface for updating progress without changing status
  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    // Get the current phase
    const currentPhase = phases.find(p => p.id === phaseId);
    
    // Don't update if the phase is already completed
    if (currentPhase?.status === "completed") {
      console.log(`Phase ${phaseId} is already completed. Not updating progress.`);
      return;
    }
    
    // Calculate the progress percentage
    const progress = Math.round((completed / total) * 100);
    
    // Update the phase with the new progress, keeping the current status
    updatePhaseStatus(phaseId, currentPhase?.status || "in-progress", progress);
  };

  // Phase-specific progress handlers that use the central updatePhaseProgress function
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
    // Save all project data before completion
    const projectData = {
      prompt: projectPrompt,
      files: projectFiles,
      phases,
      completedAt: new Date().toISOString()
    };
    
    console.log("Project completed with data:", projectData);
    navigate('/project-completion');
  };

  // Check if all phases are completed
  const allPhasesCompleted = phases.every(phase => phase.status === "completed");
  
  // Check if the current phase is accessible
  const canAccessPhase = (phaseId: string) => {
    if (phaseId === "reflection") return true;
    
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const targetIndex = phaseOrder.indexOf(phaseId);
    
    // Check if all previous phases are completed
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
