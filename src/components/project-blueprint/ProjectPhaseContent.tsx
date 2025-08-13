import { useState, useEffect } from "react";
import { ReflectionPhase } from "@/components/ReflectionPhase";
import { ScopingPhase } from "@/components/ScopingPhase";
import { DevelopmentPhase } from "@/components/DevelopmentPhase";
import { EvaluationPhase } from "@/components/EvaluationPhase";
import { PhaseLockedMessage } from "@/components/PhaseLockedMessage";
import { EthicalConsiderationsModal } from "@/components/reflection/EthicalConsiderationsModal";
import { ProjectPhase } from "@/types/project";
import { AIAssistant } from "@/components/AIAssistant";
import { CompleteProjectButton } from "./CompleteProjectButton";
import { useProject } from "@/contexts/ProjectContext";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

type ProjectPhaseContentProps = {
  activePhaseId: string;
  handleCompletePhase: (phaseId: string) => void;
  updatePhaseStatus: (
    phaseId: string,
    status: "not-started" | "in-progress" | "completed",
    progress: number
  ) => void;
  canAccessPhase: (phaseId: string) => boolean;
  handleReflectionProgress: (completed: number, total: number) => void;
  handleScopingProgress: (completed: number, total: number) => void;
  handleDevelopmentProgress: (completed: number, total: number) => void;
  handleEvaluationProgress: (completed: number, total: number) => void;
  handleCompleteProject: () => void;
  allPhasesCompleted: boolean;
  phases: ProjectPhase[];
  setActivePhaseId: (phaseId: string) => void;
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
  phases,
  setActivePhaseId,
}: ProjectPhaseContentProps) => {
  const { ethicalConsiderations, ethicalConsiderationsAcknowledged, resetDevelopmentPhase } =
    useProject();

  const [showEthicalModal, setShowEthicalModal] = useState(false);
  const [hasShownEthicalModal, setHasShownEthicalModal] = useState(false);
  
  const currentPhaseStatus =
    phases.find((p) => p.id === activePhaseId)?.status || "not-started";

  useEffect(() => {
    if (
      activePhaseId === "reflection" &&
      !ethicalConsiderationsAcknowledged &&
      !hasShownEthicalModal
    ) {
      setShowEthicalModal(true);
      setHasShownEthicalModal(true);
    }
  }, [activePhaseId, ethicalConsiderationsAcknowledged, hasShownEthicalModal]);

  const handleEthicalModalContinue = () => {
    setShowEthicalModal(false);
  };

  const openEthicalModal = () => {
    setShowEthicalModal(true);
  };

  return (
    <>
      <EthicalConsiderationsModal
        isOpen={showEthicalModal}
        onOpenChange={setShowEthicalModal}
        onContinue={handleEthicalModalContinue}
      />

      {activePhaseId === "reflection" && (
        <div className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Ethical Considerations
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {ethicalConsiderations.length > 0 ? (
                      <>
                        {ethicalConsiderations.length} considerations identified
                        {ethicalConsiderationsAcknowledged
                          ? " (reviewed)"
                          : " (needs review)"}
                      </>
                    ) : (
                      "No specific considerations found for this project"
                    )}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openEthicalModal}
                className="border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
              >
                {ethicalConsiderationsAcknowledged ? "Review Again" : "Review"}
              </Button>
            </div>
          </div>

          <ReflectionPhase
            onUpdateProgress={handleReflectionProgress}
            onCompletePhase={() => handleCompletePhase("reflection")}
          />
        </div>
      )}

      {activePhaseId === "scoping" &&
        (canAccessPhase("scoping") ? (
          <ScopingPhase
            onUpdateProgress={handleScopingProgress}
            onCompletePhase={() => handleCompletePhase("scoping")}
            updatePhaseStatus={updatePhaseStatus}
            currentPhaseStatus={currentPhaseStatus}
          />
        ) : (
          <PhaseLockedMessage phaseName="Scoping" />
        ))}

      {activePhaseId === "development" &&
        (canAccessPhase("development") ? (
          <DevelopmentPhase
            onUpdateProgress={handleDevelopmentProgress}
            onCompletePhase={() => handleCompletePhase("development")}
          />
        ) : (
          <PhaseLockedMessage phaseName="Development" />
        ))}

      {activePhaseId === "evaluation" &&
        (canAccessPhase("evaluation") ? (
          <EvaluationPhase
            onUpdateProgress={handleEvaluationProgress}
            onCompletePhase={() => handleCompletePhase("evaluation")}
            onReturnToDevelopment={() => {
              resetDevelopmentPhase();
              setActivePhaseId("development");
            }}
          />
        ) : (
          <PhaseLockedMessage phaseName="Evaluation" />
        ))}

      {allPhasesCompleted && (
        <div className="mt-8 flex justify-center">
          <CompleteProjectButton onClick={handleCompleteProject} />
        </div>
      )}

      <AIAssistant />
    </>
  );
};
