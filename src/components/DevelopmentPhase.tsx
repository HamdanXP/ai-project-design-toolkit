
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProject } from "@/contexts/ProjectContext";
import { AIPipelineSelector } from "@/components/development/AIPipelineSelector";
import { MilestonesTimeline } from "@/components/development/MilestonesTimeline";
import { WorkspaceLauncher } from "@/components/development/WorkspaceLauncher";
import { EthicalCheckpoints } from "@/components/development/EthicalCheckpoints";
import { ModelOutputReview } from "@/components/development/ModelOutputReview";
import { ReadinessCheck } from "@/components/development/ReadinessCheck";
import { DevelopmentPhaseHeader } from "@/components/development/DevelopmentPhaseHeader";

type DevelopmentPhaseProps = {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
  updatePhaseStatus?: (phaseId: string, status: "not-started" | "in-progress" | "completed", progress: number) => void;
  currentPhaseStatus?: "not-started" | "in-progress" | "completed";
};

export const DevelopmentPhase = ({ 
  onUpdateProgress, 
  onCompletePhase, 
  updatePhaseStatus,
  currentPhaseStatus = "in-progress"
}: DevelopmentPhaseProps) => {
  // Get state from context
  const {
    developmentActiveStep,
    setDevelopmentActiveStep,
    selectedPipeline,
    setSelectedPipeline,
    developmentMilestones,
    setDevelopmentMilestones,
    selectedWorkspace,
    setSelectedWorkspace,
    ethicalChecks,
    setEthicalChecks,
    modelOutput,
    setModelOutput,
    developmentReadiness,
    setDevelopmentReadiness,
    phases
  } = useProject();

  // Check if the development phase is already completed from the phases array
  const developmentPhase = phases.find(p => p.id === "development");
  const effectiveStatus = developmentPhase?.status || currentPhaseStatus;
  const isCompleted = effectiveStatus === "completed";
  
  // Define the total number of steps in the development phase
  const totalSteps = 6;

  // Calculate progress based on completed steps
  const calculateProgress = () => {
    let completedSteps = 0;
    
    // Check each step's completion status
    if (selectedPipeline) completedSteps++;
    if (developmentMilestones.some(m => m.isCompleted)) completedSteps++;
    if (selectedWorkspace) completedSteps++;
    if (ethicalChecks.some(c => c.answer !== "unknown")) completedSteps++;
    if (modelOutput.performance || modelOutput.samplePredictions) completedSteps++;
    if (developmentReadiness > 0) completedSteps++;
    
    return completedSteps;
  };

  // Update progress when steps change
  useEffect(() => {
    // Skip updating if phase is completed
    if (isCompleted) return;

    const completedSteps = calculateProgress();
    
    if (onUpdateProgress) {
      onUpdateProgress(completedSteps, totalSteps);
    }
    
    if (updatePhaseStatus) {
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100);
      updatePhaseStatus("development", "in-progress", progressPercentage);
    }
  }, [selectedPipeline, developmentMilestones, selectedWorkspace, 
      ethicalChecks, modelOutput, developmentReadiness]);

  // Handle step navigation
  const moveToNextStep = () => {
    if (developmentActiveStep < totalSteps) {
      setDevelopmentActiveStep(developmentActiveStep + 1);
    }
  };
  
  const moveToPreviousStep = () => {
    if (developmentActiveStep > 1) {
      setDevelopmentActiveStep(developmentActiveStep - 1);
    }
  };

  // Handle phase completion
  const handleCompletePhase = () => {
    if (onCompletePhase) {
      onCompletePhase();
    }
  };

  // Calculate if ready to complete
  const isReadyToComplete = developmentReadiness >= 70; // 70% readiness threshold

  // Progress percentage for display
  const progressPercentage = Math.round((calculateProgress() / totalSteps) * 100);

  return (
    <div className="space-y-6">
      <DevelopmentPhaseHeader
        currentStep={developmentActiveStep}
        totalSteps={totalSteps}
        isCompleted={isCompleted}
      />
      
      <div className="mb-4 flex items-center">
        <div className="flex-1 mr-4">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {calculateProgress()} of {totalSteps} steps
        </div>
      </div>

      {developmentActiveStep === 1 && (
        <AIPipelineSelector
          selectedPipeline={selectedPipeline}
          setSelectedPipeline={(!isCompleted ? setSelectedPipeline : undefined)}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {developmentActiveStep === 2 && (
        <MilestonesTimeline
          milestones={developmentMilestones}
          setMilestones={(!isCompleted ? setDevelopmentMilestones : undefined)}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {developmentActiveStep === 3 && (
        <WorkspaceLauncher
          selectedWorkspace={selectedWorkspace}
          setSelectedWorkspace={(!isCompleted ? setSelectedWorkspace : undefined)}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {developmentActiveStep === 4 && (
        <EthicalCheckpoints
          ethicalChecks={ethicalChecks}
          setEthicalChecks={(!isCompleted ? setEthicalChecks : undefined)}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {developmentActiveStep === 5 && (
        <ModelOutputReview
          modelOutput={modelOutput}
          setModelOutput={(!isCompleted ? setModelOutput : undefined)}
          moveToPreviousStep={moveToPreviousStep}
          moveToNextStep={moveToNextStep}
        />
      )}
      
      {developmentActiveStep === 6 && (
        <ReadinessCheck
          readiness={developmentReadiness}
          setReadiness={(!isCompleted ? setDevelopmentReadiness : undefined)}
          isReadyToComplete={isReadyToComplete}
          moveToPreviousStep={moveToPreviousStep}
          onCompletePhase={handleCompletePhase}
        />
      )}
    </div>
  );
};
