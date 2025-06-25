import { useProject } from "@/contexts/ProjectContext";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { FeasibilityForm } from "@/components/scoping/FeasibilityForm";
import { DatasetDiscovery } from "@/components/scoping/dataset-discovery/DatasetDiscovery";
import { SuitabilityChecklist } from "@/components/scoping/SuitabilityChecklist";
import { FinalFeasibilityGate } from "@/components/scoping/FinalFeasibilityGate";
import { ScopingPhaseHeader } from "@/components/scoping/ScopingPhaseHeader";
import { useScopingPhaseData } from "@/hooks/useScopingPhaseData";
import { useScopingPhaseNavigation } from "@/hooks/useScopingPhaseNavigation";
import { UseCase, Dataset, FeasibilityConstraint } from "@/types/scoping-phase";
import { useEffect, useState } from "react";

interface ScopingPhaseProps {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase: () => void;
  updatePhaseStatus: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  currentPhaseStatus?: "not-started" | "in-progress" | "completed";
}

export const ScopingPhase = ({
  onCompletePhase,
  updatePhaseStatus,
  currentPhaseStatus = "in-progress"
}: ScopingPhaseProps) => {
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
    setScopingFinalDecision,
    phases
  } = useProject();

  // State for tracking project domain
  const [projectDomain, setProjectDomain] = useState<string>("general_humanitarian");
  
  // Use custom hooks for cleaner component
  const {
    useCases,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    loadingUseCases,
    loadingDatasets,
    feasibilityScore,
    feasibilityLevel, // Changed from feasibilityRisk
    suitabilityScore,
    errorUseCases,
    noUseCasesFound,
    noDatasets,
    handleSearch,
    handleCategorySelect,
    handleSelectUseCase,
    handleSelectDataset,
    handleRetryUseCases,
    handleRetryDatasets,
    handleContinueWithoutUseCase,
    loadUseCases
  } = useScopingPhaseData();

  // Check if the scoping phase is already completed from the phases array
  const scopingPhase = phases.find(p => p.id === "scoping");
  const effectiveStatus = scopingPhase?.status || currentPhaseStatus;
  
  const {
    totalSteps,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
    resetPhase,
    handleCompletePhase
  } = useScopingPhaseNavigation({
    onCompletePhase,
    updatePhaseStatus
  });

  // Track if search has been attempted
  const [hasSearchedUseCases, setHasSearchedUseCases] = useState(false);

  // Extract domain from project context on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');

    // Domain is now determined by the backend
    setProjectDomain("general_humanitarian");
  }, []);

  // Handle suitability check update
  const handleSuitabilityUpdate = (id: string, answer: 'yes' | 'no' | 'unknown') => {
    if (effectiveStatus === "completed") return;
    
    setSuitabilityChecks(prevChecks => 
      prevChecks.map(check => 
        check.id === id ? { ...check, answer } : check
      )
    );
  };

  // Enhanced constraint update logic to handle adding new constraints
  const handleConstraintUpdate = (id: string, value: string | boolean) => {
    if (effectiveStatus === "completed") return;
    
    setConstraints(prevConstraints => {
      // Check if constraint exists
      const existingConstraintIndex = prevConstraints.findIndex(constraint => constraint.id === id);
      
      if (existingConstraintIndex !== -1) {
        // Update existing constraint
        const updatedConstraints = prevConstraints.map(constraint =>
          constraint.id === id ? { ...constraint, value } : constraint
        );
        return updatedConstraints;
      } else {
        // Add new constraint if it doesn't exist
        const newConstraint: FeasibilityConstraint = {
          id,
          label: id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value,
          type: typeof value === 'boolean' ? 'toggle' : 'select',
          options: typeof value === 'string' ? [] : undefined
        };
        
        const updatedConstraints = [...prevConstraints, newConstraint];
        return updatedConstraints;
      }
    });
  };

  // Handle dataset selection
  const handleSelectDatasetWrapper = (dataset: Dataset) => {
    if (effectiveStatus === "completed") return;
    handleSelectDataset(dataset);
  };

  // Handle use case selection/unselection wrapper
  const handleSelectUseCaseWrapper = (useCase: UseCase | null) => {
    if (effectiveStatus === "completed") return;
    handleSelectUseCase(useCase, setSelectedUseCase);
  };

  // Handle manual search trigger
  const handleTriggerSearch = () => {
    setHasSearchedUseCases(true);
    loadUseCases();
  };

  // Handle retry search
  const handleRetrySearch = () => {
    setHasSearchedUseCases(false);
    handleRetryUseCases();
    setHasSearchedUseCases(true);
  };

  // Handle continue without use case
  const handleContinueWithoutUseCaseWrapper = () => {
    handleContinueWithoutUseCase();
    moveToNextStep();
  };

  // Enhanced navigation with step access
  const handleStepNavigation = (step: number) => {
    // Allow navigation to any completed step or current step
    if (step <= scopingActiveStep || effectiveStatus === "completed") {
      moveToStep(step);
    }
  };

  // Debug logging to track constraints

  return (
    <div className="space-y-6">
      <ScopingPhaseHeader 
        totalSteps={totalSteps} 
        currentStep={scopingActiveStep} 
        isCompleted={effectiveStatus === "completed"}
      />
      
      {scopingActiveStep === 1 && (
        <UseCaseExplorer
          useCases={useCases}
          loadingUseCases={loadingUseCases}
          errorUseCases={errorUseCases}
          noUseCasesFound={noUseCasesFound}
          selectedUseCase={selectedUseCase}
          handleSelectUseCase={handleSelectUseCaseWrapper}
          moveToNextStep={moveToNextStep}
          onRetrySearch={handleRetrySearch}
          onContinueWithoutUseCase={handleContinueWithoutUseCaseWrapper}
          domain={projectDomain}
          onTriggerSearch={handleTriggerSearch}
          hasSearchedUseCases={hasSearchedUseCases}
        />
      )}
      
      {scopingActiveStep === 2 && (
        <FeasibilityForm
          constraints={constraints}
          handleConstraintUpdate={handleConstraintUpdate}
          feasibilityScore={feasibilityScore}
          feasibilityLevel={feasibilityLevel} // Changed from feasibilityRisk
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
          loadingDatasets={loadingDatasets}
          noDatasets={noDatasets}
          handleSearch={handleSearch}
          handleCategorySelect={handleCategorySelect}
          handleSelectDataset={handleSelectDatasetWrapper}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
          onRetryDatasetSearch={handleRetryDatasets}
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
          feasibilityLevel={feasibilityLevel} // Changed from feasibilityRisk
          suitabilityChecks={suitabilityChecks}
          suitabilityScore={suitabilityScore}
          readyToAdvance={scopingFinalDecision === 'proceed'}
          setReadyToAdvance={(ready) => {
            if (effectiveStatus !== "completed") {
              setScopingFinalDecision(ready ? 'proceed' : 'revise');
              
              if (ready) {
                updatePhaseStatus("scoping", "in-progress", 100);
              } else {
                updatePhaseStatus("scoping", "in-progress", 80);
              }
            }
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