
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
    // Special handling for Scoping phase
    if (phaseId === "scoping") {
      const currentPhase = phases.find(p => p.id === phaseId);
      
      // Don't override progress if we're in the final step (step 5)
      // and a decision has been made (proceed or revise)
      if (currentPhase && scopingFinalDecision) {
        if (
          (scopingFinalDecision === 'proceed' && currentPhase.progress === 100) || 
          (scopingFinalDecision === 'revise' && currentPhase.progress === 80)
        ) {
          return;
        }
      }
    }
    
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // Calculate the progress percentage
          const progress = Math.round((completed / total) * 100);
          
          // Determine status based on progress
          let status = phase.status;
          if (progress === 0) status = "not-started";
          else if (progress === 100) status = "completed";
          else status = "in-progress";
          
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
    if (phaseId === "scoping" && status === "in-progress") {
      if (progress === 100) {
        setScopingFinalDecision('proceed');
      } else if (progress === 80) {
        setScopingFinalDecision('revise');
      }
    }
    
    console.log(`Updating phase ${phaseId} to status: ${status}, progress: ${progress}`);
    
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // Calculate completedSteps based on the provided progress percentage
          const completedSteps = Math.round((progress / 100) * phase.totalSteps);
          
          const updatedPhase = {
            ...phase,
            status,
            progress,
            completedSteps: status === "completed" ? phase.totalSteps : completedSteps
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
    
    // First, make sure we mark the phase as completed
    updatePhaseStatus(phaseId, "completed", 100);
    
    // Reset the scoping decision state if we're completing that phase
    if (phaseId === "scoping") {
      setScopingFinalDecision('proceed');
    }
    
    // Store phase data
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    console.log("Phase completed with data:", phaseData);
    
    // Force a UI update by updating all phases
    setTimeout(() => {
      setPhases(prevPhases => [...prevPhases]);
    }, 100);
    
    // Determine the next phase to activate
    const phaseOrder = ["reflection", "scoping", "development", "evaluation"];
    const currentIndex = phaseOrder.indexOf(phaseId);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhaseId = phaseOrder[currentIndex + 1];
      
      // Update the next phase to in-progress
      setPhases(prevPhases => 
        prevPhases.map(phase => {
          if (phase.id === nextPhaseId) {
            return {
              ...phase,
              status: "in-progress"
            };
          }
          return phase;
        })
      );
      
      // Immediately move to the next phase
      setActivePhaseId(nextPhaseId);
      
      toast({
        title: "Phase Completed",
        description: `You've completed the ${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} phase!`,
      });
    }
  };

  // These handlers now use the updated updatePhaseProgress function
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
    canAccessPhase,
    scopingFinalDecision,
    setScopingFinalDecision
  };
};
