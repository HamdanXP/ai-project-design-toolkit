import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, AlertCircle, Loader2 } from "lucide-react";
import { useDevelopmentPhase } from "@/hooks/useDevelopmentPhase";
import { AISolution } from "@/types/development-phase";
import { ProjectOverviewStep } from "@/components/development/ProjectOverviewStep";
import { SolutionSelectionStep } from "@/components/development/SolutionSelectionStep";
import { ProjectGenerationStep } from "@/components/development/ProjectGenerationStep";

interface DevelopmentPhaseProps {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
}

export const DevelopmentPhase = ({ onUpdateProgress, onCompletePhase }: DevelopmentPhaseProps) => {
  const [generationProgress, setGenerationProgress] = useState(0);
  
  const {
    currentStep,
    loading,
    solutionsLoading,
    error,
    solutionsError,
    developmentData,
    contextData,
    solutionsData,
    selectedSolution,
    generationInProgress,
    generatedProject,
    steps,
    summary,
    progressPercentage,
    setCurrentStep,
    selectSolution,
    generateProject,
    downloadFile,
    retryLoading,
    retrySolutions,
    canProceedToNextPhase,
    getSolutionBadgeInfo
  } = useDevelopmentPhase();

  // Update progress when steps change
  useEffect(() => {
    if (onUpdateProgress) {
      const completedSteps = steps.filter(s => s.completed).length;
      onUpdateProgress(completedSteps, steps.length);
    }
  }, [steps, onUpdateProgress]);

  // Animate progress bar during project generation
  useEffect(() => {
    let interval: number;
    
    if (generationInProgress) {
      setGenerationProgress(0);
      interval = window.setInterval(() => {
        setGenerationProgress(prev => {
          // Animate from 0 to 95% over ~8 seconds, then hold at 95% until completion
          const increment = Math.random() * 8 + 2; // Random increment between 2-10%
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 800); // Update every 800ms for realistic feel
    } else {
      // Reset progress when not generating
      setGenerationProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationInProgress]);

  // Complete progress bar when generation finishes
  useEffect(() => {
    if (!generationInProgress && generatedProject?.success) {
      setGenerationProgress(100);
    }
  }, [generationInProgress, generatedProject]);

  // Complete phase when ready
  useEffect(() => {
    if (canProceedToNextPhase() && onCompletePhase) {
      // Don't auto-complete - let user manually proceed after reviewing downloads
      // onCompletePhase();
    }
  }, [canProceedToNextPhase, onCompletePhase]);

  const handleSelectSolution = async (solution: AISolution) => {
    try {
      await selectSolution(solution);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateProject = async () => {
    try {
      await generateProject();
      // Don't auto-complete the phase - let user review and download first
      // onCompletePhase will be called when user clicks "Continue to Evaluation Phase"
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  // Loading state for initial context
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your project context...</p>
      </div>
    );
  }

  // Error state for context loading
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Development Phase</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button onClick={retryLoading} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!contextData || !summary) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Development Phase</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate a complete, ethical AI solution tailored to your project
        </p>
        
        {/* Progress */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {steps.filter(s => s.completed).length} of {steps.length} completed
          </span>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
              <span className={`text-sm ${step.completed ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-200 dark:bg-gray-700 ml-2" />
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Step Content */}
      {currentStep === 0 && summary && (
        <ProjectOverviewStep summary={summary} onNext={() => setCurrentStep(1)} />
      )}
      {currentStep === 1 && (
        <SolutionSelectionStep
          solutionsData={solutionsData}
          solutionsLoading={solutionsLoading}
          solutionsError={solutionsError}
          selectedSolution={selectedSolution}
          onSelectSolution={handleSelectSolution}
          getSolutionBadgeInfo={getSolutionBadgeInfo}
          onBack={() => setCurrentStep(0)}
          onNext={() => setCurrentStep(2)}
          retrySolutions={retrySolutions}
        />
      )}
      {currentStep === 2 && selectedSolution && (
        <ProjectGenerationStep
          selectedSolution={selectedSolution}
          generatedProject={generatedProject}
          generationInProgress={generationInProgress}
          generationProgress={generationProgress}
          onGenerateProject={handleGenerateProject}
          onDownloadFile={downloadFile}
          onBack={() => setCurrentStep(1)}
          onComplete={() => onCompletePhase && onCompletePhase()}
        />
      )}
    </div>
  );
};