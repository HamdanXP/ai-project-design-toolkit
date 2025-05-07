
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { ScopingPhase } from "@/components/ScopingPhase";
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { PhaseLockedMessage } from "@/components/PhaseLockedMessage";
import { ProjectPhase } from "@/types/project";
import { AIAssistant } from "@/components/AIAssistant";
import { CompleteProjectButton } from "./CompleteProjectButton";

type ProjectPhaseContentProps = {
  activePhaseId: string;
  handleCompletePhase: (phaseId: string) => void;
  canAccessPhase: (phaseId: string) => boolean;
  handleReflectionProgress: (completed: number, total: number) => void;
  handleScopingProgress: (completed: number, total: number) => void;
  handleDevelopmentProgress: (completed: number, total: number) => void;
  handleEvaluationProgress: (completed: number, total: number) => void;
  handleCompleteProject: () => void;
  allPhasesCompleted: boolean;
  phases: ProjectPhase[];
};

export const ProjectPhaseContent = ({
  activePhaseId,
  handleCompletePhase,
  canAccessPhase,
  handleReflectionProgress,
  handleScopingProgress,
  handleDevelopmentProgress,
  handleEvaluationProgress,
  handleCompleteProject,
  allPhasesCompleted,
  phases
}: ProjectPhaseContentProps) => {
  
  // This ensures that when we complete a phase, its progress is set to 100%
  const completePhase = (phaseId: string) => {
    // First set progress to show full completion
    switch(phaseId) {
      case "reflection":
        handleReflectionProgress(7, 7); // 7 is the total from useProjectPhases
        break;
      case "scoping":
        handleScopingProgress(5, 5); // 5 is the total from useProjectPhases
        break;
      case "development":
        handleDevelopmentProgress(6, 6); // 6 is the total from useProjectPhases
        break;
      case "evaluation":
        handleEvaluationProgress(4, 4); // 4 is the total from useProjectPhases
        break;
    }
    
    // Then complete the phase
    handleCompletePhase(phaseId);
  };

  return (
    <>
      {activePhaseId === "reflection" && (
        <ReflectionPhase 
          onUpdateProgress={handleReflectionProgress}
          onCompletePhase={() => completePhase("reflection")} 
        />
      )}
      
      {activePhaseId === "scoping" && (
        canAccessPhase("scoping") ? (
          <ScopingPhase 
            onUpdateProgress={handleScopingProgress}
            onCompletePhase={() => completePhase("scoping")} 
          />
        ) : (
          <PhaseLockedMessage phaseName="Scoping" />
        )
      )}
      
      {activePhaseId === "development" && (
        canAccessPhase("development") ? (
          <DevelopmentPhase 
            onUpdateProgress={handleDevelopmentProgress}
            onCompletePhase={() => completePhase("development")} 
          />
        ) : (
          <PhaseLockedMessage phaseName="Development" />
        )
      )}
      
      {activePhaseId === "evaluation" && (
        canAccessPhase("evaluation") ? (
          <EvaluationPhase 
            onUpdateProgress={handleEvaluationProgress}
            onCompletePhase={() => completePhase("evaluation")}
          />
        ) : (
          <PhaseLockedMessage phaseName="Evaluation" />
        )
      )}
      
      {allPhasesCompleted && <CompleteProjectButton onComplete={handleCompleteProject} />}
      
      {/* Add the AI Assistant */}
      <AIAssistant />
    </>
  );
};
