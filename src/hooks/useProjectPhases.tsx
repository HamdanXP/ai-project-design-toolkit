
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
    scopingFinalDecision, 
    setScopingFinalDecision 
  } = useProject();
  
  // Function to update phase progress based on completed steps
  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // Don't update if the phase is already completed
          if (phase.status === "completed") {
            console.log(`Phase ${phaseId} is already completed. Not updating progress.`);
            return phase;
          }
          
          // Calculate the progress percentage
          const progress = Math.round((completed / total) * 100);
          
          // Determine status based on progress
          let status = phase.status;
          if (progress === 0) status = "not-started";
          else if (progress < 100) status = "in-progress";
          
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
  
  // Explicitly set the status of a phase
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

  const handleCompletePhase = (phaseId: string) => {
    console.log(`Completing phase: ${phaseId}`);
    
    // Mark the phase as completed first - CRITICAL
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
      
      // Update the next phase to in-progress after a short delay
      // This prevents race conditions by ensuring the completed status is saved first
      setTimeout(() => {
        setPhases(prevPhases => 
          prevPhases.map(phase => {
            // Verify the current phase is still marked as completed
            if (phase.id === phaseId && phase.status !== "completed") {
              console.warn(`Warning: Phase ${phaseId} should be completed but is ${phase.status}`);
              return { ...phase, status: "completed", progress: 100, completedSteps: phase.totalSteps };
            }
            
            // Set the next phase to in-progress
            if (phase.id === nextPhaseId) {
              return {
                ...phase,
                status: "in-progress",
                progress: phase.progress === 0 ? 5 : phase.progress // Start with at least 5% progress
              };
            }
            return phase;
          })
        );
        
        // Move to the next phase
        setActivePhaseId(nextPhaseId);
        
        toast({
          title: "Phase Completed",
          description: `You've completed the ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} phase!`,
        });
      }, 100);
    }
  };

  // These handlers now use the updated updatePhaseProgress function
  const handleReflectionProgress = (completed: number, total: number) => {
    updatePhaseProgress("reflection", completed, total);
  };

  const handleScopingProgress = (completed: number, total: number) => {
    const scopingPhase = phases.find(p => p.id === "scoping");
    if (scopingPhase?.status === "completed") {
      console.log("Scoping phase already completed. Not updating progress.");
      return;
    }
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
    canAccessPhase,
    scopingFinalDecision,
    setScopingFinalDecision
  };
};
