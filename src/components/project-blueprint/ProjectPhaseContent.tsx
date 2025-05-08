
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
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
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
  updatePhaseStatus,
  canAccessPhase,
  handleReflectionProgress,
  handleScopingProgress,
  handleDevelopmentProgress,
  handleEvaluationProgress,
  handleCompleteProject,
  allPhasesCompleted,
  phases
}: ProjectPhaseContentProps) => {
  return (
    <>
      {activePhaseId === "reflection" && (
        <ReflectionPhase 
          onUpdateProgress={handleReflectionProgress}
          onCompletePhase={() => handleCompletePhase("reflection")} 
        />
      )}
      
      {activePhaseId === "scoping" && (
        canAccessPhase("scoping") ? (
          <ScopingPhase 
            onUpdateProgress={handleScopingProgress}
            onCompletePhase={() => handleCompletePhase("scoping")}
            updatePhaseStatus={updatePhaseStatus}
          />
        ) : (
          <PhaseLockedMessage phaseName="Scoping" />
        )
      )}
      
      {activePhaseId === "development" && (
        canAccessPhase("development") ? (
          <DevelopmentPhase 
            onUpdateProgress={handleDevelopmentProgress}
            onCompletePhase={() => handleCompletePhase("development")} 
          />
        ) : (
          <PhaseLockedMessage phaseName="Development" />
        )
      )}
      
      {activePhaseId === "evaluation" && (
        canAccessPhase("evaluation") ? (
          <EvaluationPhase 
            onUpdateProgress={handleEvaluationProgress}
            onCompletePhase={() => handleCompletePhase("evaluation")}
          />
        ) : (
          <PhaseLockedMessage phaseName="Evaluation" />
        )
      )}
      
      {allPhasesCompleted && (
        <div className="mt-8 flex justify-center">
          <CompleteProjectButton onClick={handleCompleteProject} />
        </div>
      )}
      
      {/* Add the AI Assistant */}
      <AIAssistant />
    </>
  );
};
