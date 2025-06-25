import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, Info, Lightbulb, Download, Play, Shield, Eye, Users, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useDevelopmentPhase } from "@/hooks/useDevelopmentPhase";
import { formatTechnicalSpecs } from "@/lib/developmentApi";
import { AISolution } from "@/types/development-phase";

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
      
      {/* Step 1: Project Overview */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Your Project Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">{summary.projectTitle}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  We've analyzed your project and will generate AI solutions specifically designed for {summary.targetBeneficiaries}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Project Domain</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm font-medium capitalize">
                    {summary.domain.replace('_', ' ')}
                  </p>
                  <p className="text-blue-700 dark:text-blue-300 text-xs mt-1">
                    {summary.hasUseCase ? 'Use case selected' : 'General approach'} • 
                    {summary.hasDeploymentEnv ? ' Deployment configured' : ' Standard deployment'}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">AI Solutions Ready</h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-800 dark:text-green-200">✓ Context analyzed and ready</p>
                    <p className="text-green-800 dark:text-green-200">✓ Ethical safeguards built-in</p>
                    <p className="text-green-800 dark:text-green-200">✓ Complete code generation ready</p>
                    <p className="text-green-800 dark:text-green-200">✓ Solutions will be generated on-demand</p>
                  </div>
                </div>
              </div>

              {/* AI Recommendations - Handle empty state gracefully */}
              {summary.keyRecommendations.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Strategic Recommendations for Your Project
                  </h4>
                  {summary.keyRecommendations.map((rec, index) => (
                    <Alert key={index}>
                      <AlertDescription>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-gray-100">{rec.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rec.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">
                              {rec.type}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                            {rec.reason}
                          </p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                // Empty state for recommendations
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Strategic recommendations will appear here based on your project analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(1)}>
              Choose Your AI Solution
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Choose Solution */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose Your AI Solution</CardTitle>
              <CardDescription>
                Each solution is a complete, ready-to-deploy system with built-in ethical safeguards.
                Recommended solutions are specifically optimized for your project.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Solutions Loading State */}
              {solutionsLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Generating AI Solutions</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Analyzing your project and creating tailored AI solutions...
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      This may take a moment while we generate 5 custom solutions for your project
                    </p>
                  </div>
                </div>
              )}

              {/* Solutions Error State */}
              {solutionsError && !solutionsLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-destructive">Error Generating Solutions</h3>
                    <p className="text-muted-foreground mt-2">{solutionsError}</p>
                    <Button onClick={retrySolutions} className="mt-4 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Retry Generating Solutions
                    </Button>
                  </div>
                </div>
              )}

              {/* Solutions Content */}
              {solutionsData && !solutionsLoading && (
                <div className="space-y-6">
                  {/* Solution Options - Group recommended first */}
                  <div className="space-y-4">
                    {/* Recommended Solutions First */}
                    {solutionsData.available_solutions
                      .filter(solution => solution.recommended)
                      .map((solution) => {
                        const badges = getSolutionBadgeInfo(solution);
                        
                        return (
                          <Card 
                            key={solution.id}
                            className={`cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                              selectedSolution?.id === solution.id 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                                : 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
                            }`}
                            onClick={() => handleSelectSolution(solution)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{solution.title}</h3>
                                    {badges.map((badge, idx) => (
                                      <Badge 
                                        key={idx}
                                        className={
                                          badge.variant === 'success' 
                                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700"
                                            : badge.variant === 'primary'
                                            ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                                            : ""
                                        }
                                      >
                                        {badge.text}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{solution.description}</p>
                                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">{solution.best_for}</p>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">What You'll Get:</h4>
                                  <ul className="text-xs space-y-1">
                                    {solution.capabilities.slice(0, 4).map((capability, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{capability}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Technical Stack:</h4>
                                  <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                    {formatTechnicalSpecs(solution).map((spec, idx) => (
                                      <p key={idx}>
                                        <span className="font-medium">{spec.label}:</span> {spec.value}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}

                    {/* Other Solutions */}
                    {solutionsData.available_solutions
                      .filter(solution => !solution.recommended)
                      .map((solution) => {
                        const badges = getSolutionBadgeInfo(solution);
                        
                        return (
                          <Card 
                            key={solution.id}
                            className={`cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                              selectedSolution?.id === solution.id 
                                ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                            onClick={() => handleSelectSolution(solution)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{solution.title}</h3>
                                    {badges.map((badge, idx) => (
                                      <Badge 
                                        key={idx}
                                        variant="outline"
                                      >
                                        {badge.text}
                                      </Badge>
                                    ))}
                                  </div>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{solution.description}</p>
                                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">{solution.best_for}</p>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">What You'll Get:</h4>
                                  <ul className="text-xs space-y-1">
                                    {solution.capabilities.slice(0, 4).map((capability, idx) => (
                                      <li key={idx} className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-300">{capability}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Technical Stack:</h4>
                                  <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                    {formatTechnicalSpecs(solution).map((spec, idx) => (
                                      <p key={idx}>
                                        <span className="font-medium">{spec.label}:</span> {spec.value}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>

                  {/* Show Ethical Safeguards for Selected Solution */}
                  {selectedSolution && (
                    <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                      <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Built-in Ethical Safeguards
                        </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-300">
                          Your {selectedSolution.title} automatically includes these ethical protections
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedSolution.ethical_safeguards.map((safeguard, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 flex items-center justify-center">
                                {safeguard.icon === 'users' && <Users className="h-4 w-4" />}
                                {safeguard.icon === 'eye' && <Eye className="h-4 w-4" />}
                                {safeguard.icon === 'shield' && <Shield className="h-4 w-4" />}
                              </div>
                              <h4 className="font-medium text-green-800 dark:text-green-200">{safeguard.category}</h4>
                            </div>
                            
                            <div className="ml-6 space-y-1">
                              {safeguard.measures.map((measure, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-sm text-green-700 dark:text-green-300">{measure}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        
                        <Alert className="bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                          <Info className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            These safeguards are automatically implemented in your generated project based on humanitarian AI ethics guidelines.
                          </AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(0)}>
              Back to Overview
            </Button>
            <Button 
              onClick={() => setCurrentStep(2)}
              disabled={!selectedSolution}
            >
              Generate Complete Project
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generate Project */}
      {currentStep === 2 && selectedSolution && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Your AI Project</CardTitle>
              <CardDescription>
                Creating your complete {selectedSolution.title} with all ethical safeguards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedProject ? (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ready to Generate:</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>✅ {selectedSolution.title}</p>
                      <p>✅ Complete source code (frontend + backend)</p>
                      <p>✅ Ethical safeguards automatically integrated</p>
                      <p>✅ Documentation and deployment guide</p>
                      <p>✅ Sample data and test cases</p>
                      <p>✅ Configuration for your deployment environment</p>
                    </div>

                    {generationInProgress ? (
                      <div className="space-y-4">
                        <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generating your AI project...
                        </p>
                        <div className="w-64 mx-auto space-y-2">
                          <Progress value={generationProgress} className="h-2" />
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            {generationProgress < 95 
                              ? `Creating project structure and code... ${Math.round(generationProgress)}%`
                              : "Finalizing project files... 95%"
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={handleGenerateProject} className="mx-auto flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Generate Complete Project
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-6">
                  <div className="text-6xl">🎉</div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-600 mb-2">Project Generated Successfully!</h3>
                    <p className="text-gray-600 dark:text-gray-400">Your complete AI solution is ready with all ethical safeguards built-in</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <Button onClick={() => downloadFile('complete')} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Complete Project
                    </Button>
                    <Button variant="outline" onClick={() => downloadFile('documentation')}>
                      Documentation
                    </Button>
                    <Button variant="outline" onClick={() => downloadFile('setup')}>
                      Setup Guide
                    </Button>
                    <Button variant="outline" onClick={() => downloadFile('ethical-report')}>
                      Ethics Report
                    </Button>
                    <Button variant="outline" onClick={() => downloadFile('deployment')}>
                      Deployment
                    </Button>
                  </div>

                  <Separator />

                  <Alert>
                    <AlertDescription>
                      <strong>What's Included:</strong> Complete source code, deployment scripts,
                      documentation, ethical audit reports, and step-by-step setup instructions.
                      Ready to deploy to your environment.
                    </AlertDescription>
                  </Alert>

                  {generatedProject.next_steps && generatedProject.next_steps.length > 0 && (
                    <div className="text-left">
                      <h4 className="font-medium mb-2">Next Steps:</h4>
                      <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                        {generatedProject.next_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="font-medium text-primary">{index + 1}.</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep(1)}>
              Back to Choose Solution
            </Button>

            {generatedProject && (
              <Button size="lg" onClick={onCompletePhase}>
                Continue to Evaluation Phase
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};