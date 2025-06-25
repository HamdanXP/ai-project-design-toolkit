import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import {
  RiskAssessment,
  ImpactGoalCheck,
  EvaluationDecision
} from "@/types/development-phase";
import { StakeholderFeedback } from "@/types/evaluation-phase";

export interface UseEvaluationPhaseOptions {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
}

export const useEvaluationPhase = (options: UseEvaluationPhaseOptions = {}) => {
  const { onUpdateProgress, onCompletePhase } = options;
  const {
    evaluationTestResults,
    setEvaluationTestResults,
    evaluationImpactGoalChecks,
    setEvaluationImpactGoalChecks,
    evaluationRiskAssessments,
    setEvaluationRiskAssessments,
    evaluationStakeholderFeedback,
    setEvaluationStakeholderFeedback,
    evaluationDecision,
    setEvaluationDecision,
    evaluationJustification,
    setEvaluationJustification,
    reflectionAnswers
  } = useProject();

  const [activeTab, setActiveTab] = useState("testing");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [currentFeedbackItem, setCurrentFeedbackItem] = useState<StakeholderFeedback>({
    id: "",
    name: "",
    role: "",
    notes: "",
    rating: 3
  });

  const updateProgress = () => {
    if (!onUpdateProgress) return;

    const testingComplete = !!evaluationTestResults.trim();
    const impactGoalComplete = evaluationImpactGoalChecks.every(
      (check) => check.notes.trim() !== ""
    );
    const riskAssessmentComplete = evaluationRiskAssessments.every(
      (risk) => risk.level !== "unknown" && risk.notes.trim() !== ""
    );
    const stakeholderFeedbackComplete = evaluationStakeholderFeedback.length > 0;
    const decisionComplete = !!evaluationDecision && !!evaluationJustification.trim();

    const completedSteps = [
      testingComplete,
      impactGoalComplete,
      riskAssessmentComplete,
      stakeholderFeedbackComplete,
      decisionComplete
    ].filter(Boolean).length;

    onUpdateProgress(completedSteps, 5);
  };

  const handleImpactGoalChange = (
    id: string,
    field: keyof ImpactGoalCheck,
    value: any
  ) => {
    setEvaluationImpactGoalChecks((prev) =>
      prev.map((check) => (check.id === id ? { ...check, [field]: value } : check))
    );
    updateProgress();
  };

  const handleRiskAssessmentChange = (
    id: string,
    field: keyof RiskAssessment,
    value: any
  ) => {
    setEvaluationRiskAssessments((prev) =>
      prev.map((risk) => (risk.id === id ? { ...risk, [field]: value } : risk))
    );
    updateProgress();
  };

  const handleAddFeedback = () => {
    if (!currentFeedbackItem.name || !currentFeedbackItem.role) return;

    const newFeedback = {
      ...currentFeedbackItem,
      id: `feedback-${Date.now()}`
    };

    setEvaluationStakeholderFeedback((prev) => [...prev, newFeedback]);
    setCurrentFeedbackItem({ id: "", name: "", role: "", notes: "", rating: 3 });
    updateProgress();
  };

  const handleTestResultsChange = (value: string) => {
    setEvaluationTestResults(value);
    updateProgress();
  };

  const handleDecisionChange = (decision: EvaluationDecision) => {
    setEvaluationDecision(decision);
    updateProgress();
  };

  const handleJustificationChange = (value: string) => {
    setEvaluationJustification(value);
    updateProgress();
  };

  const canCompletePhase = () => {
    return (
      !!evaluationTestResults.trim() &&
      evaluationImpactGoalChecks.every((check) => check.notes.trim() !== "") &&
      evaluationRiskAssessments.every(
        (risk) => risk.level !== "unknown" && risk.notes.trim() !== ""
      ) &&
      evaluationStakeholderFeedback.length > 0 &&
      !!evaluationDecision &&
      !!evaluationJustification.trim()
    );
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    updateProgress();
  };

  const handleCompletePhase = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
  };

  return {
    reflectionAnswers,
    evaluationTestResults,
    evaluationImpactGoalChecks,
    evaluationRiskAssessments,
    evaluationStakeholderFeedback,
    evaluationDecision,
    evaluationJustification,
    activeTab,
    confirmDialogOpen,
    currentFeedbackItem,
    setConfirmDialogOpen,
    setCurrentFeedbackItem,
    handleImpactGoalChange,
    handleRiskAssessmentChange,
    handleAddFeedback,
    handleTestResultsChange,
    handleDecisionChange,
    handleJustificationChange,
    handleTabChange,
    handleCompletePhase,
    canCompletePhase
  };
};

export type UseEvaluationPhaseReturn = ReturnType<typeof useEvaluationPhase>;
