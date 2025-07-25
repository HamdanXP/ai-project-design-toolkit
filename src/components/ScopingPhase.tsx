import { useProject } from "@/contexts/ProjectContext";
import { TechnicalInfrastructureAssessment } from "@/components/scoping/TechnicalInfrastructureAssessment";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { DatasetDiscovery } from "@/components/scoping/dataset-discovery/DatasetDiscovery";
import { SuitabilityChecklist } from "@/components/scoping/SuitabilityChecklist";
import { ProjectReadinessSummary } from "@/components/scoping/ProjectReadinessSummary";
import { ScopingPhaseHeader } from "@/components/scoping/ScopingPhaseHeader";
import { useScopingPhaseData } from "@/hooks/useScopingPhaseData";
import { useScopingPhaseNavigation } from "@/hooks/useScopingPhaseNavigation";
import { UseCase, Dataset } from "@/types/scoping-phase";
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
  const {
    scopingActiveStep,
    selectedUseCase,
    setSelectedUseCase,
    selectedDataset,
    setSelectedDataset,
    suitabilityChecks,
    setSuitabilityChecks,
    scopingFinalDecision,
    setScopingFinalDecision,
    phases,
    technicalInfrastructure,
    infrastructureAssessment
  } = useProject();

  const [projectDomain, setProjectDomain] = useState<string>("general_humanitarian");
  
  const {
    useCases,
    datasets,
    filteredDatasets,
    searchTerm,
    selectedCategory,
    loadingUseCases,
    loadingDatasets,
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

  const [hasSearchedUseCases, setHasSearchedUseCases] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    setProjectDomain("general_humanitarian");
  }, []);

  const handleSuitabilityUpdate = (id: string, answer: 'yes' | 'no' | 'unknown') => {
    if (effectiveStatus === "completed") return;
    
    setSuitabilityChecks(prevChecks => 
      prevChecks.map(check => 
        check.id === id ? { ...check, answer } : check
      )
    );
  };

  const handleSelectDatasetWrapper = (dataset: Dataset) => {
    if (effectiveStatus === "completed") return;
    handleSelectDataset(dataset);
  };

  const handleSelectUseCaseWrapper = (useCase: UseCase | null) => {
    if (effectiveStatus === "completed") return;
    handleSelectUseCase(useCase, setSelectedUseCase);
  };

  const handleTriggerSearch = () => {
    setHasSearchedUseCases(true);
    loadUseCases();
  };

  const handleRetrySearch = () => {
    setHasSearchedUseCases(false);
    handleRetryUseCases();
    setHasSearchedUseCases(true);
  };

  const handleContinueWithoutUseCaseWrapper = () => {
    handleContinueWithoutUseCase();
    moveToNextStep();
  };

  const handleStepNavigation = (step: number) => {
    if (step <= scopingActiveStep || effectiveStatus === "completed") {
      moveToStep(step);
    }
  };

  return (
    <div className="space-y-6">
      <ScopingPhaseHeader 
        totalSteps={totalSteps} 
        currentStep={scopingActiveStep} 
        isCompleted={effectiveStatus === "completed"}
      />
      
      {scopingActiveStep === 1 && (
        <TechnicalInfrastructureAssessment
          moveToNextStep={moveToNextStep}
          updatePhaseStatus={updatePhaseStatus}
        />
      )}
      
      {scopingActiveStep === 2 && (
        <UseCaseExplorer
          useCases={useCases}
          loadingUseCases={loadingUseCases}
          errorUseCases={errorUseCases}
          noUseCasesFound={noUseCasesFound}
          selectedUseCase={selectedUseCase}
          handleSelectUseCase={handleSelectUseCaseWrapper}
          moveToNextStep={moveToNextStep}
          moveToPreviousStep={moveToPreviousStep}
          onRetrySearch={handleRetrySearch}
          onContinueWithoutUseCase={handleContinueWithoutUseCaseWrapper}
          domain={projectDomain}
          onTriggerSearch={handleTriggerSearch}
          hasSearchedUseCases={hasSearchedUseCases}
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
        <ProjectReadinessSummary
          selectedUseCase={selectedUseCase}
          selectedDataset={selectedDataset}
          technicalInfrastructure={technicalInfrastructure}
          infrastructureAssessment={infrastructureAssessment}
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