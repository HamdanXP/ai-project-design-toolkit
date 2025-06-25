import { FeasibilityConstraint } from "@/types/scoping-phase";
import { FeasibilityWizard } from "./enhanced/FeasibilityWizard";
import { useFeasibilityForm } from "@/hooks/useFeasibilityForm";

type FeasibilityFormProps = {
  constraints: FeasibilityConstraint[];
  handleConstraintUpdate: (id: string, value: string | boolean) => void;
  feasibilityScore: number;
  feasibilityLevel: "high" | "medium" | "low";
  moveToPreviousStep: () => void;
  moveToNextStep: () => void;
};

export const FeasibilityForm = ({
  constraints,
  handleConstraintUpdate,
  feasibilityScore,
  feasibilityLevel,
  moveToPreviousStep,
  moveToNextStep,
}: FeasibilityFormProps) => {
  const {
    feasibilityCategories,
    constraintValues,
    getRiskMitigations,
    handleCategoryConstraintUpdate,
  } = useFeasibilityForm(constraints, handleConstraintUpdate);

  return (
    <FeasibilityWizard
      categories={feasibilityCategories}
      onUpdateConstraint={handleCategoryConstraintUpdate}
      feasibilityScore={feasibilityScore}
      feasibilityLevel={feasibilityLevel}
      riskMitigations={getRiskMitigations()}
      moveToPreviousStep={moveToPreviousStep}
      moveToNextStep={moveToNextStep}
      constraintValues={constraintValues}
    />
  );
};

