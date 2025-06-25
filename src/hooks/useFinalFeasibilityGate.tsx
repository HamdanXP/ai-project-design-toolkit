import { useState } from "react";
import { useProject } from "@/contexts/ProjectContext";
import {
  UseCase,
  Dataset,
  FeasibilityConstraint,
  DataSuitabilityCheck,
  ScopingCompletionData
} from "@/types/scoping-phase";
import { scopingApi } from "@/lib/scopingApi";

export interface FinalFeasibilityGateParams {
  selectedUseCase: UseCase | null;
  selectedDataset: Dataset | null;
  constraints: FeasibilityConstraint[];
  feasibilityScore: number;
  feasibilityLevel: "high" | "medium" | "low";
  suitabilityChecks: DataSuitabilityCheck[];
  suitabilityScore: number;
  readyToAdvance: boolean;
  setReadyToAdvance: (value: boolean) => void;
  handleCompletePhase: () => void;
  resetPhase: () => void;
}

export const useFinalFeasibilityGate = ({
  selectedUseCase,
  selectedDataset,
  constraints,
  feasibilityScore,
  feasibilityLevel,
  suitabilityChecks,
  suitabilityScore,
  readyToAdvance,
  setReadyToAdvance,
  handleCompletePhase,
  resetPhase
}: FinalFeasibilityGateParams) => {
  const { projectId } = useProject();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleReadyToProceed = () => {
    setReadyToAdvance(true);
    setSubmitError(null);
  };

  const handleReviseApproach = () => {
    setReadyToAdvance(false);
    setSubmitError(null);
  };

  const handleRevisePhase = () => {
    resetPhase();
  };

  const getSuitabilityLevel = (score: number): "excellent" | "good" | "moderate" | "poor" => {
    if (score >= 80) return "excellent";
    if (score >= 60) return "good";
    if (score >= 40) return "moderate";
    return "poor";
  };

  const extractHumanitarianConstraints = (cons: FeasibilityConstraint[]): string[] => {
    const constraintMap: { [key: string]: { values: (string | boolean)[]; label: string } } = {
      "budget": { values: ["limited"], label: "Limited Budget" },
      "stakeholder-support": { values: ["low"], label: "Low Stakeholder Support" },
      "ai-experience": { values: ["none"], label: "No AI Experience" },
      "time": { values: ["short-term"], label: "Tight Timeline" },
      "internet": { values: [false], label: "Connectivity Issues" },
      "technical-skills": { values: ["limited"], label: "Technical Skills Gap" }
    };

    return cons
      .filter(c => {
        const mapping = constraintMap[c.id as keyof typeof constraintMap];
        return mapping && mapping.values.includes(c.value);
      })
      .map(c => constraintMap[c.id as keyof typeof constraintMap].label)
      .slice(0, 3);
  };

  const generateSimpleReasoning = (
    advance: boolean,
    feasScore: number,
    suitScore: number,
    cons: FeasibilityConstraint[]
  ): string => {
    if (advance) {
      const strengths = [] as string[];
      if (feasScore >= 70) strengths.push("strong project foundations");
      if (suitScore >= 60) strengths.push("suitable data available");
      const constraintIssues = extractHumanitarianConstraints(cons);
      if (constraintIssues.length === 0) strengths.push("no major barriers identified");
      return `Project is ready to proceed with ${strengths.join(", ")}. ${
        constraintIssues.length > 0 ? `Areas to monitor: ${constraintIssues.join(", ")}.` : ""
      }`;
    } else {
      const issues = [] as string[];
      if (feasScore < 50) issues.push("needs stronger foundations");
      if (suitScore < 40) issues.push("data concerns need addressing");
      const constraintIssues = extractHumanitarianConstraints(cons);
      if (constraintIssues.length > 0) issues.push("resource limitations");
      return `Recommend strengthening project setup: ${issues.join(", ")}. Consider revisiting earlier steps.`;
    }
  };

  const onCompletePhase = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const useCaseData: UseCase = selectedUseCase || {
        id: "no_use_case_selected",
        title: "Custom AI Solution",
        description: "Proceeding without a specific predefined use case",
        category: "Custom",
        complexity: "medium",
        source: "",
        source_url: "",
        type: "Custom",
        tags: ["Custom Solution"],
        selected: true,
        how_it_works: "Custom implementation based on project needs",
        real_world_impact: "To be determined based on implementation"
      };

      const datasetData: Dataset = selectedDataset || {
        name: "Custom Dataset",
        source: "User-provided data",
        url: "",
        description: "Using user-provided data for the project",
        size_estimate: "Unknown",
        data_types: [],
        ethical_concerns: [],
        id: "custom_dataset",
        title: "Custom Dataset",
        format: "Various",
        size: "Unknown",
        license: "Various"
      };

      const scopingCompletionData: ScopingCompletionData = {
        selected_use_case: useCaseData,
        selected_dataset: datasetData,
        feasibility_summary: {
          overall_percentage: feasibilityScore,
          feasibility_level: feasibilityLevel,
          key_constraints: extractHumanitarianConstraints(constraints)
        },
        data_suitability: {
          percentage: suitabilityScore,
          suitability_level: getSuitabilityLevel(suitabilityScore)
        },
        constraints: constraints.map(c => ({
          id: c.id,
          label: c.label,
          value: c.value,
          type: c.type
        })),
        suitability_checks: suitabilityChecks.map(c => ({
          id: c.id,
          question: c.question,
          answer: c.answer,
          description: c.description
        })),
        active_step: 5,
        ready_to_proceed: readyToAdvance,
        reasoning: generateSimpleReasoning(readyToAdvance, feasibilityScore, suitabilityScore, constraints)
      };

      const response = await scopingApi.completeScopingPhase(projectId, scopingCompletionData);

      if (response.success) {
        handleCompletePhase();
      } else {
        throw new Error(response.message || "Failed to complete scoping phase");
      }
    } catch (error) {
      console.error("Failed to complete scoping phase:", error);
      setSubmitError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProjectStrengths = () => {
    const strengths: string[] = [];
    const stakeholderSupport = constraints.find(c => c.id === "stakeholder-support")?.value;
    if (stakeholderSupport === "high" || stakeholderSupport === "champion") {
      strengths.push("Strong organizational support");
    }
    const budget = constraints.find(c => c.id === "budget")?.value;
    if (budget === "substantial" || budget === "unlimited") {
      strengths.push("Good budget allocation");
    }
    const internet = constraints.find(c => c.id === "internet")?.value;
    const infrastructure = constraints.find(c => c.id === "infrastructure")?.value;
    if (internet && infrastructure) {
      strengths.push("Solid technical setup");
    }
    return strengths;
  };

  const getAreasToImprove = () => {
    const constraintMap: { [key: string]: { values: (string | boolean)[]; label: string } } = {
      "budget": { values: ["limited"], label: "Limited Budget" },
      "stakeholder-support": { values: ["low"], label: "Low Stakeholder Support" },
      "ai-experience": { values: ["none"], label: "No AI Experience" },
      "time": { values: ["short-term"], label: "Tight Timeline" },
      "internet": { values: [false], label: "Connectivity Issues" },
      "technical-skills": { values: ["limited"], label: "Technical Skills Gap" }
    };

    const constraintIssues = constraints
      .filter(c => {
        const mapping = constraintMap[c.id as keyof typeof constraintMap];
        return mapping && mapping.values.includes(c.value);
      })
      .map(c => constraintMap[c.id as keyof typeof constraintMap].label)
      .slice(0, 3);

    return constraintIssues;
  };

  const overallReadiness = Math.round(feasibilityScore * 0.6 + suitabilityScore * 0.4);
  const projectStrengths = getProjectStrengths();
  const areasToImprove = getAreasToImprove();

  return {
    isSubmitting,
    submitError,
    handleReadyToProceed,
    handleReviseApproach,
    onCompletePhase,
    handleRevisePhase,
    overallReadiness,
    projectStrengths,
    areasToImprove
  };
};

export type UseFinalFeasibilityGateReturn = ReturnType<typeof useFinalFeasibilityGate>;

