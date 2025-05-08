
import { useEffect } from "react";
import { UseCase, Dataset } from "@/types/scoping-phase";
import { useProject } from "@/contexts/ProjectContext";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { FeasibilityForm } from "@/components/scoping/FeasibilityForm";
import { DatasetDiscovery } from "@/components/scoping/dataset-discovery/DatasetDiscovery";
import { SuitabilityChecklist } from "@/components/scoping/SuitabilityChecklist";
import { FinalFeasibilityGate } from "@/components/scoping/FinalFeasibilityGate";
import { ScopingPhaseHeader } from "@/components/scoping/ScopingPhaseHeader";
import { useScopingPhaseData } from "@/hooks/useScopingPhaseData";
import { useScopingPhaseNavigation } from "@/hooks/useScopingPhaseNavigation";

export const ScopingPhase = ({
  onUpdateProgress,
  onCompletePhase,
  updatePhaseStatus,
  currentPhaseStatus = "in-progress"
}: {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  currentPhaseStatus?: "not-started" | "in-progress" | "completed";
}) => {
  // Get state from context
  const {
    scopingActiveStep,
    selectedUseCase,
    setSelectedUseCase,
    constraints,
    setConstraints,
    selectedDataset,
    setSelectedDataset,
    suitabilityChecks,
    setSuitabilityChecks,
    scopingFinalDecision,
    setScopingFinalDecision
  } = useProject();
  
  // Use custom hooks for cleaner component
  const {
    useCases,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    previewDataset,
    loadingUseCases,
    loadingDatasets,
    feasibilityScore,
    feasibilityRisk,
    suitabilityScore,
    handleSearch,
    handleCategorySelect,
    handlePreviewDataset,
    setPreviewDataset,
    handleSelectUseCase,
  } = useScopingPhaseData();

  const {
    totalSteps,
    moveToNextStep,
    moveToPreviousStep,
    resetPhase,
    handleCompletePhase
  } = useScopingPhaseNavigation({
    onUpdateProgress,
    onCompletePhase,
    updatePhaseStatus,
    currentPhaseStatus
  });

  // Handle suitability check update
  const handleSuitabilityUpdate = (id: string, answer: 'yes' | 'no' | 'unknown') => {
    setSuitabilityChecks(prevChecks => 
      prevChecks.map(check => 
        check.id === id ? { ...check, answer } : check
      )
    );
  };

  // Handle constraint updates
  const handleConstraintUpdate = (id: string, value: string | boolean) => {
    setConstraints(prevConstraints =>
      prevConstraints.map(constraint =>
        constraint.id === id ? { ...constraint, value } : constraint
      )
    );
  };

  // Handle dataset selection
  const handleSelectDatasetWrapper = (dataset: Dataset) => {
    setSelectedDataset(dataset);
  };

  // Handle use case selection wrapper
  const handleSelectUseCaseWrapper = (useCase: UseCase) => {
    handleSelectUseCase(useCase, setSelectedUseCase);
  };

  return (
    <div className="space-y-6">
      <ScopingPhaseHeader 
        totalSteps={totalSteps} 
        currentStep={scopingActiveStep} 
        isCompleted={currentPhaseStatus === "completed"} 
      />
      
      {scopingActiveStep === 1 && (
        <UseCaseExplorer
          useCases={useCases}
          loadingUseCases={loadingUseCases}
          selectedUseCase={selectedUseCase}
          handleSelectUseCase={handleSelectUseCaseWrapper}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {scopingActiveStep === 2 && (
        <FeasibilityForm
          constraints={constraints}
          handleConstraintUpdate={handleConstraintUpdate}
          feasibilityScore={feasibilityScore}
          feasibilityRisk={feasibilityRisk}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {scopingActiveStep === 3 && (
        <DatasetDiscovery
          datasets={datasets}
          filteredDatasets={filteredDatasets}
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          selectedDataset={selectedDataset}
          previewDataset={previewDataset}
          loadingDatasets={loadingDatasets}
          handleSearch={handleSearch}
          handleCategorySelect={handleCategorySelect}
          handleSelectDataset={handleSelectDatasetWrapper}
          handlePreviewDataset={handlePreviewDataset}
          setPreviewDataset={setPreviewDataset}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {scopingActiveStep === 4 && (
        <SuitabilityChecklist
          suitabilityChecks={suitabilityChecks}
          handleSuitabilityUpdate={handleSuitabilityUpdate}
          suitabilityScore={suitabilityScore}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {scopingActiveStep === 5 && (
        <FinalFeasibilityGate
          selectedUseCase={selectedUseCase}
          selectedDataset={selectedDataset}
          constraints={constraints}
          feasibilityScore={feasibilityScore}
          feasibilityRisk={feasibilityRisk}
          suitabilityChecks={suitabilityChecks}
          suitabilityScore={suitabilityScore}
          readyToAdvance={scopingFinalDecision === 'proceed'}
          setReadyToAdvance={(ready) => {
            setScopingFinalDecision(ready ? 'proceed' : 'revise');
          }}
          moveToPreviousStep={moveToPreviousStep}
          handleCompletePhase={handleCompletePhase}
          updatePhaseStatus={updatePhaseStatus}
          resetPhase={resetPhase}
        />
      )}
    </div>
  );
};
