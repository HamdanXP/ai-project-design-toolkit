
import { useEffect } from "react";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { FeasibilityForm } from "@/components/scoping/FeasibilityForm";
import { DatasetDiscovery } from "@/components/scoping/dataset-discovery/DatasetDiscovery";
import { SuitabilityChecklist } from "@/components/scoping/SuitabilityChecklist";
import { FinalFeasibilityGate } from "@/components/scoping/FinalFeasibilityGate";
import { useScopingPhaseState } from "@/hooks/useScopingPhaseState";
import { useScopingPhaseActions } from "@/hooks/useScopingPhaseActions";
import { ScopingHeader } from "@/components/scoping/ScopingHeader";

export const ScopingPhase = ({
  onUpdateProgress,
  onCompletePhase
}: {
  onUpdateProgress: (completed: number, total: number) => void;
  onCompletePhase: () => void;
}) => {
  const state = useScopingPhaseState();
  
  // Handle constraint updates
  const handleConstraintUpdate = (id: string, value: string | boolean) => {
    state.setConstraints(prevConstraints =>
      prevConstraints.map(constraint =>
        constraint.id === id ? { ...constraint, value } : constraint
      )
    );
  };
  
  // Handle suitability check update
  const handleSuitabilityUpdate = (id: string, answer: 'yes' | 'no' | 'unknown') => {
    state.setSuitabilityChecks(prevChecks => 
      prevChecks.map(check => 
        check.id === id ? { ...check, answer } : check
      )
    );
  };
  
  const actions = useScopingPhaseActions({
    setUseCases: state.setUseCases,
    setSelectedUseCase: state.setSelectedUseCase,
    setActiveStep: state.setActiveStep,
    setSearchTerm: state.setSearchTerm,
    setSelectedCategory: state.setSelectedCategory,
    setFilteredDatasets: state.setFilteredDatasets,
    setSelectedDataset: state.setSelectedDataset,
    setPreviewDataset: state.setPreviewDataset,
    handleConstraintUpdate,
    handleSuitabilityUpdate,
    datasets: state.datasets,
    toast: state.toast
  });

  // Update progress when step changes
  useEffect(() => {
    onUpdateProgress(state.activeStep - 1, state.totalSteps);
  }, [state.activeStep, onUpdateProgress]);

  // Handle phase completion
  const handleCompletePhase = () => {
    // Check if the user has completed the necessary steps
    if (!state.selectedUseCase) {
      state.toast({
        title: "Missing Use Case",
        description: "Please select an AI use case before completing.",
        variant: "destructive"
      });
      state.setActiveStep(1);
      return;
    }
    
    if (!state.selectedDataset) {
      state.toast({
        title: "Missing Dataset",
        description: "Please select a dataset before completing.",
        variant: "destructive"
      });
      state.setActiveStep(3);
      return;
    }
    
    if (state.readyToAdvance !== true) {
      state.toast({
        title: "Final Review Required",
        description: "Please confirm the project is ready to proceed.",
        variant: "destructive"
      });
      state.setActiveStep(5);
      return;
    }
    
    onCompletePhase();
  };

  return (
    <div className="space-y-6">
      <ScopingHeader
        activeStep={state.activeStep}
        totalSteps={state.totalSteps}
      />
      
      {state.activeStep === 1 && (
        <UseCaseExplorer
          useCases={state.useCases}
          loadingUseCases={state.loadingUseCases}
          selectedUseCase={state.selectedUseCase}
          handleSelectUseCase={actions.handleSelectUseCase}
          moveToNextStep={actions.moveToNextStep}
        />
      )}
      
      {state.activeStep === 2 && (
        <FeasibilityForm
          constraints={state.constraints}
          handleConstraintUpdate={handleConstraintUpdate}
          feasibilityScore={state.feasibilityScore}
          feasibilityRisk={state.feasibilityRisk}
          moveToPreviousStep={actions.moveToPreviousStep}
          moveToNextStep={actions.moveToNextStep}
        />
      )}
      
      {state.activeStep === 3 && (
        <DatasetDiscovery
          datasets={state.datasets}
          filteredDatasets={state.filteredDatasets}
          searchTerm={state.searchTerm}
          selectedCategory={state.selectedCategory}
          selectedDataset={state.selectedDataset}
          previewDataset={state.previewDataset}
          loadingDatasets={state.loadingDatasets}
          handleSearch={actions.handleSearch}
          handleCategorySelect={actions.handleCategorySelect}
          handleSelectDataset={actions.handleSelectDataset}
          handlePreviewDataset={actions.handlePreviewDataset}
          setPreviewDataset={state.setPreviewDataset}
          moveToPreviousStep={actions.moveToPreviousStep}
          moveToNextStep={actions.moveToNextStep}
        />
      )}
      
      {state.activeStep === 4 && (
        <SuitabilityChecklist
          suitabilityChecks={state.suitabilityChecks}
          handleSuitabilityUpdate={handleSuitabilityUpdate}
          suitabilityScore={state.suitabilityScore}
          moveToPreviousStep={actions.moveToPreviousStep}
          moveToNextStep={actions.moveToNextStep}
        />
      )}
      
      {state.activeStep === 5 && (
        <FinalFeasibilityGate
          selectedUseCase={state.selectedUseCase}
          selectedDataset={state.selectedDataset}
          constraints={state.constraints}
          feasibilityScore={state.feasibilityScore}
          feasibilityRisk={state.feasibilityRisk}
          suitabilityChecks={state.suitabilityChecks}
          suitabilityScore={state.suitabilityScore}
          readyToAdvance={state.readyToAdvance}
          setReadyToAdvance={state.setReadyToAdvance}
          moveToPreviousStep={actions.moveToPreviousStep}
          handleCompletePhase={handleCompletePhase}
        />
      )}
    </div>
  );
};
