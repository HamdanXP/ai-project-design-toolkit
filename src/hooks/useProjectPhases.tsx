
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProjectPhase } from "@/types/project";

export const useProjectPhases = () => {
  const navigate = useNavigate();
  const [activePhaseId, setActivePhaseId] = useState("reflection");
  const [projectPrompt, setProjectPrompt] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  
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

  // Load project information when component mounts
  useEffect(() => {
    const prompt = localStorage.getItem('projectPrompt');
    const files = localStorage.getItem('projectFiles');
    
    if (prompt) {
      setProjectPrompt(prompt);
    }
    
    if (files) {
      try {
        setProjectFiles(JSON.parse(files));
      } catch (error) {
        console.error("Error parsing project files:", error);
      }
    }
  }, []);

  // Modified updatePhaseProgress to respect explicit status changes
  const updatePhaseProgress = (phaseId: string, completed: number, total: number) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // Calculate the progress percentage
          const progress = Math.round((completed / total) * 100);
          
          // If we're explicitly trying to update a phase that was manually set to completed or not-completed,
          // don't change its status based on progress
          if (phase.status === "completed" && progress < 100) {
            // Don't change status from completed unless explicitly requested
            return phase;
          }
          
          // Determine status based on progress
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
  
  // This function explicitly sets the status and should always work
  const updatePhaseStatus = (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => {
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          // For explicit status updates, always honor the requested status
          const completedSteps = status === "completed" ? phase.totalSteps : 
                               status === "not-started" ? 0 : 
                               Math.round((progress / 100) * phase.totalSteps);
          
          return {
            ...phase,
            status,
            progress,
            completedSteps
          };
        }
        return phase;
      })
    );
  };

  const handleCompletePhase = (phaseId: string) => {
    // First ensure the current phase is marked as 100% completed
    const currentPhase = phases.find(p => p.id === phaseId);
    if (!currentPhase) return;
    
    // Immediately update the UI to show the phase as completed
    setPhases(prevPhases => 
      prevPhases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            status: "completed",
            progress: 100,
            completedSteps: phase.totalSteps
          };
        }
        return phase;
      })
    );
    
    // Store phase data in localStorage when a phase is completed
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    // Store in localStorage under a key specific to this phase and project
    localStorage.setItem(`project_phase_${phaseId}`, JSON.stringify(phaseData));
    
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
    }
  };

  // These handlers now use the modified updatePhaseProgress
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
    
    localStorage.setItem('completed_project', JSON.stringify(projectData));
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
