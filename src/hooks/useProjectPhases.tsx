
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProjectPhase } from "@/types/project";

export const useProjectPhases = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const handleCompletePhase = (phaseId: string) => {
    // First ensure the current phase is marked as 100% completed
    const currentPhase = phases.find(p => p.id === phaseId);
    if (!currentPhase) return;
    
    // Store phase data in localStorage when a phase is completed
    const phaseData = {
      phaseId,
      projectPrompt,
      projectFiles,
      completedAt: new Date().toISOString()
    };
    
    // Store in localStorage under a key specific to this phase and project
    localStorage.setItem(`project_phase_${phaseId}`, JSON.stringify(phaseData));
    
    // Set the phase as completed with 100% progress
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
      
      // Move to the next phase
      setActivePhaseId(nextPhaseId);
    }
    
    // Show a toast notification
    toast({
      title: `${phaseId.charAt(0).toUpperCase() + phaseId.slice(1)} Phase Completed`,
      description: `Moving to the next phase.`,
    });
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
    handleReflectionProgress,
    handleScopingProgress,
    handleDevelopmentProgress,
    handleEvaluationProgress,
    handleCompleteProject,
    allPhasesCompleted,
    canAccessPhase
  };
};
