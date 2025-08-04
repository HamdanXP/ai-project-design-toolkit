import { useProject } from "@/contexts/ProjectContext";
import { TechnicalInfrastructureAssessment } from "@/components/scoping/TechnicalInfrastructureAssessment";
import { UseCaseExplorer } from "@/components/scoping/UseCaseExplorer";
import { DatasetDiscovery } from "@/components/scoping/DatasetDiscovery";
import { DatasetAnalyzer } from "@/components/scoping/DatasetAnalyzer";
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
    errorDatasets,
    hasSearchedDatasets,
    handleSearch,
    handleCategorySelect,
    handleSelectUseCase,
    handleSelectDataset,
    handleRetryUseCases,
    handleRetryDatasets,
    handleContinueWithoutUseCase,
    loadUseCases,
    loadDatasets
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
  const [hasSearchedDatasetsState, setHasSearchedDatasetsState] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const projectId = searchParams.get('projectId');
    setProjectDomain("general_humanitarian");
  }, []);

  useEffect(() => {
    if (scopingActiveStep !== 3) {
      setHasSearchedDatasetsState(false);
    }
  }, [scopingActiveStep]);

  const handleSelectDatasetWrapper = (dataset: Dataset | null) => {
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

  const handleTriggerDatasetSearch = () => {
    setHasSearchedDatasetsState(true);
    loadDatasets();
  };

  const handleRetryDatasetSearch = () => {
    setHasSearchedDatasetsState(false);
    handleRetryDatasets();
    setHasSearchedDatasetsState(true);
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

  const effectiveHasSearchedDatasets = hasSearchedDatasets || hasSearchedDatasetsState;

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
          onRetryDatasetSearch={handleRetryDatasetSearch}
          onTriggerSearch={handleTriggerDatasetSearch}
          hasSearchedDatasets={effectiveHasSearchedDatasets}
        />
      )}
      
      {scopingActiveStep === 4 && (
        <DatasetAnalyzer
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