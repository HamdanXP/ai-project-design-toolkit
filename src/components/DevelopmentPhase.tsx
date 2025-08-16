import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Circle, Info, Lightbulb, Play, Shield, Eye, Users, AlertCircle, Loader2, RefreshCw, ArrowRight, MessageSquare, FileText, Code, Settings, Zap, Download, Copy, Maximize2, Cpu, Package, File, Clock, MapPin, Target, Building, Wrench, TrendingUp, Wifi, WifiOff, Server, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevelopmentPhase } from "@/hooks/useDevelopmentPhase";
import { AISolution } from "@/types/development-phase";
import { useToast } from "@/hooks/useToast";
import { DevelopmentApiError } from "@/lib/development-api";

interface DevelopmentPhaseProps {
  onUpdateProgress?: (completed: number, total: number) => void;
  onCompletePhase?: () => void;
}

const ErrorIcon = ({ errorType }: { errorType: string }) => {
  switch (errorType) {
    case 'network':
      return <WifiOff className="h-12 w-12 text-orange-500" />;
    case 'server':
      return <Server className="h-12 w-12 text-red-500" />;
    case 'not_found':
      return <AlertTriangle className="h-12 w-12 text-yellow-500" />;
    case 'timeout':
      return <Clock className="h-12 w-12 text-blue-500" />;
    case 'validation':
      return <AlertCircle className="h-12 w-12 text-purple-500" />;
    default:
      return <AlertCircle className="h-12 w-12 text-destructive" />;
  }
};

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  onNavigateBack,
  context 
}: { 
  error: DevelopmentApiError;
  onRetry: () => void;
  onNavigateBack?: () => void;
  context: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <ErrorIcon errorType={error.type} />
      
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {error.type === 'network' && 'Connection Problem'}
          {error.type === 'server' && 'Server Unavailable'}
          {error.type === 'not_found' && 'Project Not Found'}
          {error.type === 'timeout' && 'Request Taking Too Long'}
          {error.type === 'validation' && 'Invalid Project Data'}
          {error.type === 'unknown' && 'Something Went Wrong'}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          {error.userMessage}
        </p>
        
        {error.suggestedAction && (
          <Alert className="mb-4 text-left">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>What you can do:</strong> {error.suggestedAction}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2 justify-center">
          {error.retryable && (
            <Button onClick={onRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          {onNavigateBack && (error.type === 'not_found' || error.type === 'validation') && (
            <Button variant="outline" onClick={onNavigateBack}>
              Go Back
            </Button>
          )}
          
          {error.type === 'network' && (
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reload Page
            </Button>
          )}
        </div>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <details className="text-xs text-gray-500 max-w-lg">
          <summary className="cursor-pointer">Technical Details</summary>
          <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-left overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export const DevelopmentPhase = ({ onUpdateProgress, onCompletePhase }: DevelopmentPhaseProps) => {
  const [generationProgress, setGenerationProgress] = useState(0);
  const [userFeedback, setUserFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string, filename: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: `${filename} has been copied to your clipboard`,
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.py')) return <Code className="h-4 w-4 text-blue-600" />;
    if (filename.endsWith('.txt') || filename.endsWith('.md')) return <FileText className="h-4 w-4 text-gray-600" />;
    if (filename.endsWith('.json') || filename.endsWith('.yml')) return <Settings className="h-4 w-4 text-orange-600" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getFileTypeLabel = (filename: string) => {
    if (filename.endsWith('.py')) return 'Application';
    if (filename.endsWith('.txt')) return 'Instructions';
    if (filename.endsWith('.md')) return 'Documentation';
    if (filename.endsWith('.json') || filename.endsWith('.yml')) return 'Configuration';
    return 'File';
  };

  const formatAITechniqueName = (technique: string) => {
    return technique
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

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
    generateSolutionsWithFeedback,
    generateFreshSolutions,
    retryLoading,
    retrySolutions,
    canProceedToNextPhase,
    getSolutionBadgeInfo,
    solutionsFromCache,
    setGeneratedProject
  } = useDevelopmentPhase();

  useEffect(() => {
    if (onUpdateProgress) {
      const completedSteps = steps.filter(s => s.completed).length;
      onUpdateProgress(completedSteps, steps.length);
    }
  }, [steps, onUpdateProgress]);

  useEffect(() => {
    let interval: number;
    
    if (generationInProgress) {
      setGenerationProgress(0);
      interval = window.setInterval(() => {
        setGenerationProgress(prev => {
          const increment = Math.random() * 0.5 + 0.25;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 1000);
    } else {
      setGenerationProgress(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [generationInProgress]);

  useEffect(() => {
    if (!generationInProgress && generatedProject?.success) {
      setGenerationProgress(100);
    }
  }, [generationInProgress, generatedProject]);

  const handleSelectSolution = async (solution: AISolution) => {
    try {
      if (generatedProject && selectedSolution?.id !== solution.id) {
        setGeneratedProject(null);
        setCurrentStep(1);
      }
      await selectSolution(solution);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateProject = async () => {
    try {
      await generateProject();
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateSolutions = async () => {
    try {
      await generateSolutionsWithFeedback();
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  const handleGenerateSolutionsWithFeedback = async () => {
    try {
      await generateSolutionsWithFeedback(userFeedback);
      setUserFeedback("");
      setShowFeedbackInput(false);
    } catch (err) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your project context...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        onRetry={retryLoading}
        onNavigateBack={() => window.history.back()}
        context="loading project context"
      />
    );
  }

  if (!contextData || !summary) {
    return null;
  }

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">Development Phase</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate experimental AI prototypes to test different approaches for your project
        </p>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Progress value={progressPercentage} className="h-2" />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {steps.filter(s => s.completed).length} of {steps.length} completed
          </span>
        </div>

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
                  We'll generate experimental AI prototypes specifically designed for {summary.targetBeneficiaries}
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
                    {summary.hasTechnicalInfrastructure  ? ' Infrastructure configured' : ' Standard setup'}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">AI Prototypes Ready</h4>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-800 dark:text-green-200">✓ Context analyzed</p>
                    <p className="text-green-800 dark:text-green-200">✓ Ethical safeguards included</p>
                    <p className="text-green-800 dark:text-green-200">✓ Working code generation ready</p>
                    <p className="text-green-800 dark:text-green-200">✓ Solutions customized for your needs</p>
                  </div>
                </div>
              </div>

              {summary.keyRecommendations.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    Recommendations for Your Project
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
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Recommendations will appear based on your project analysis.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={() => setCurrentStep(1)}>
              Choose Your Solution
            </Button>
          </div>
        </div>
      )}

      {currentStep === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Explore Different AI Approaches</CardTitle>
              <CardDescription>
                Each approach uses a different AI technique to address your humanitarian problem. These are experimental prototypes to help you understand different possibilities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              
              {solutionsLoading && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Generating AI Solutions for Your Project</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      We're analyzing your project context to propose relevant AI solutions that could help address your humanitarian problem....
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                      This may take a moment
                    </p>
                  </div>
                </div>
              )}

              {solutionsError && !solutionsLoading && (
                <ErrorDisplay 
                  error={solutionsError}
                  onRetry={retrySolutions}
                  context="generating AI solutions"
                />
              )}

              {solutionsData && !solutionsLoading && (!solutionsData.available_solutions || solutionsData.available_solutions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <AlertCircle className="h-12 w-12 text-amber-500" />
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-amber-800">No AI Solutions Found</h3>
                    <p className="text-muted-foreground mt-2">
                      We couldn't identify suitable AI solutions for your project. Try providing more specific context.
                    </p>
                    <Button onClick={() => setShowFeedbackInput(true)} className="mt-4">
                      Provide More Context
                    </Button>
                  </div>
                </div>
              )}

              {solutionsData && !solutionsLoading && solutionsData.available_solutions && solutionsData.available_solutions.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 flex-1 mr-4">
                      <Info className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800 dark:text-amber-200">
                        <strong>AI Approach Analysis:</strong> {solutionsData.solution_rationale}
                      </AlertDescription>
                    </Alert>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={generateFreshSolutions}
                      disabled={solutionsLoading}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>

                  {showFeedbackInput && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">
                          Request Different AI Solutions
                        </h4>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 text-sm mb-3">
                        Describe what you're looking for and we'll generate different AI solutions.
                      </p>
                      
                      <div className="space-y-3">
                        <Textarea
                          placeholder="For example: Focus on image analysis, I need real-time processing, prioritize offline solutions, combine text and data analysis, etc."
                          value={userFeedback}
                          onChange={(e) => setUserFeedback(e.target.value)}
                          className="bg-white dark:bg-gray-800"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={handleGenerateSolutionsWithFeedback}
                            disabled={solutionsLoading || !userFeedback.trim()}
                          >
                            Generate Different Solutions
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              setShowFeedbackInput(false);
                              setUserFeedback("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {!showFeedbackInput && (
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowFeedbackInput(true)}
                      >
                        Want Different AI Solutions?
                      </Button>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {solutionsFromCache 
                          ? "Solutions restored from previous analysis • Use 'Fresh Analysis' for new solutions"
                          : "Solutions generated fresh • Automatically saved for this session"
                        }
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {solutionsData.available_solutions.map((solution) => {
                      const badges = getSolutionBadgeInfo(solution);                      
                      return (
                        <Card 
                          key={solution.id}
                          className={`cursor-pointer transition-all hover:border-gray-300 dark:hover:border-gray-600 ${
                            selectedSolution?.id === solution.id 
                              ? 'border-blue-500 border-2 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' 
                              : solution.recommended
                              ? 'border-green-200 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
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
                                  <Badge variant="outline" className="text-xs">
                                    {formatAITechniqueName(solution.ai_technique)}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{solution.description}</p>
                                <p className="text-xs font-medium mb-2">
                                  <span className="text-purple-600 dark:text-purple-400">Best for:</span> {solution.best_for}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium">How it helps:</span> {solution.use_case_alignment}
                                </p>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">What This Prototype Will Do:</h4>
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
                                <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Implementation Approach:</h4>
                                <div className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
                                  <p><span className="font-medium">AI Technique:</span> {formatAITechniqueName(solution.ai_technique)}</p>
                                  <p><span className="font-medium">Setup Time:</span> {solution.estimated_setup_time || solution.resource_requirements.setup_time}</p>
                                  <p><span className="font-medium">Data Input:</span> {solution.technical_architecture.data_input}</p>
                                  <p><span className="font-medium">Interface:</span> {solution.technical_architecture.user_interface}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {selectedSolution && selectedSolution.ethical_safeguards && selectedSolution.ethical_safeguards.length > 0 && (
                    <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                      <CardHeader>
                        <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Built-in Ethical Protections
                        </CardTitle>
                        <CardDescription className="text-green-700 dark:text-green-300">
                          Your {selectedSolution.title} prototype automatically includes these safeguards
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
                            These protections are automatically implemented in your generated prototype based on humanitarian AI ethics guidelines.
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
              Generate Prototype
            </Button>
          </div>
        </div>
      )}

      {currentStep === 2 && selectedSolution && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Your AI Prototype</CardTitle>
              <CardDescription>
                Creating your experimental {selectedSolution.title} prototype with all ethical protections included
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedProject ? (
                <div className="text-center py-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">Ready to Generate:</h3>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>✅ {selectedSolution.title} using {formatAITechniqueName(selectedSolution.ai_technique)}</p>
                      <p>✅ Working prototype code you can test immediately</p>
                      <p>✅ Simple setup instructions for experimentation</p>
                      <p>✅ Ethical protections built-in</p>
                      <p>✅ Clear usage documentation</p>
                      <p>✅ Production readiness guidance</p>
                    </div>

                    {generationInProgress ? (
                      <div className="space-y-4">
                        <div className="animate-spin mx-auto h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generating your AI prototype...
                        </p>
                        <div className="w-64 mx-auto space-y-2">
                          <Progress value={generationProgress} className="h-2" />
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            {generationProgress < 95 
                              ? `Creating working prototype... ${Math.round(generationProgress)}%`
                              : "Finalizing prototype... 95%"
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={handleGenerateProject} className="mx-auto flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Generate Prototype
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center py-6">
                    <div className="text-6xl mb-4">🎉</div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-600 mb-2">Your AI Prototype is Ready!</h3>
                      <p className="text-gray-600 dark:text-gray-400">You now have a complete, experimental AI solution for your humanitarian project</p>
                    </div>
                  </div>

                  {generatedProject.project && (
                    <div className="space-y-6">
                      <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                            <Package className="h-5 w-5" />
                            What You've Built
                          </CardTitle>
                          <CardDescription className="text-blue-700 dark:text-blue-300">
                            Your experimental AI prototype - ready to test and evaluate different approaches
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList>
                              <TabsTrigger value="overview">Prototype Overview</TabsTrigger>
                              <TabsTrigger value="files">Your Files</TabsTrigger>
                              {generatedProject.project.generation_report && (
                                <TabsTrigger value="technical">Technical Details</TabsTrigger>
                              )}
                            </TabsList>
                            
                            <TabsContent value="overview" className="space-y-4">
                              <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                                <Info className="h-4 w-4 text-amber-600" />
                                <AlertDescription className="text-amber-800 dark:text-amber-200">
                                  <strong>This is an experimental prototype</strong> designed to help you test and understand this AI approach. It demonstrates the concept but would need additional development for production use.
                                </AlertDescription>
                              </Alert>

                              <div className="grid gap-4">
                                <Card className="border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                      <Cpu className="h-5 w-5 text-green-600" />
                                      <h4 className="font-medium text-green-800 dark:text-green-200">
                                        Working AI Prototype
                                      </h4>
                                    </div>
                                    <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                                      A functional {formatAITechniqueName(generatedProject.project.ai_technique)} prototype that you can install and experiment with on your computer
                                    </p>
                                    <ul className="text-xs space-y-1">
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        Experimental interface for testing the AI approach
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        {formatAITechniqueName(generatedProject.project.ai_technique)} processing that you can test with sample data
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        Results display to evaluate the approach
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                        Built-in privacy and ethical protections
                                      </li>
                                    </ul>
                                  </CardContent>
                                </Card>

                                <Card className="border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                      <FileText className="h-5 w-5 text-blue-600" />
                                      <h4 className="font-medium text-blue-800 dark:text-blue-200">
                                        Complete Documentation
                                      </h4>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                      Comprehensive guides to help you set up, test, and understand your AI prototype
                                    </p>
                                    <ul className="text-xs space-y-1">
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-blue-600" />
                                        Installation instructions for your experimental environment
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-blue-600" />
                                        How to test the prototype with your data
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-blue-600" />
                                        Understanding and interpreting prototype results
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-blue-600" />
                                        Troubleshooting common prototype issues
                                      </li>
                                    </ul>
                                  </CardContent>
                                </Card>

                                <Card className="border-purple-200 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/10">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                      <Shield className="h-5 w-5 text-purple-600" />
                                      <h4 className="font-medium text-purple-800 dark:text-purple-200">
                                        Ethical AI Implementation
                                      </h4>
                                    </div>
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                                      Your prototype follows humanitarian AI ethics and keeps your experimental data safe
                                    </p>
                                    <ul className="text-xs space-y-1">
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-purple-600" />
                                        Data stays on your computer (privacy protected)
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-purple-600" />
                                        Fair and unbiased processing approach
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-purple-600" />
                                        Transparent decision making for testing
                                      </li>
                                      <li className="flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-purple-600" />
                                        Designed for humanitarian benefit evaluation
                                      </li>
                                    </ul>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>
                            
                            <TabsContent value="files" className="space-y-4">
                              <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  These are the files that make up your AI prototype. You can copy and use them to set up your experimental environment or share with a technical team.
                                </p>
                              </div>
                              
                              <Accordion type="single" collapsible className="w-full">
                                {Object.entries(generatedProject.project.files).map(([filename, content]) => (
                                  <AccordionItem key={filename} value={filename}>
                                    <AccordionTrigger className="hover:no-underline">
                                      <div className="flex items-center gap-3 flex-1">
                                        {getFileIcon(filename)}
                                        <div className="text-left">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium">{filename}</span>
                                            <Badge variant="outline" className="text-xs">
                                              {getFileTypeLabel(filename)}
                                            </Badge>
                                          </div>
                                          <p className="text-xs text-gray-500 mt-1">
                                            {generatedProject.project.generation_report?.files_generated
                                              ?.find(f => f.filename === filename)?.purpose || 
                                             "Essential file for your AI prototype"}
                                          </p>
                                        </div>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-3 pl-7">
                                        {generatedProject.project.generation_report?.files_generated
                                          ?.find(f => f.filename === filename)?.key_features && (
                                          <div>
                                            <h5 className="font-medium text-sm mb-2">What this file does:</h5>
                                            <ul className="text-xs space-y-1">
                                              {generatedProject.project.generation_report.files_generated
                                                .find(f => f.filename === filename)?.key_features.map((feature, idx) => (
                                                <li key={idx} className="flex items-center gap-2">
                                                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                                  <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                        
                                        <div className="flex gap-2">
                                          <Dialog>
                                            <DialogTrigger asChild>
                                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                                <Maximize2 className="h-3 w-3" />
                                                View Code
                                              </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[80vh]">
                                              <DialogHeader>
                                                <DialogTitle className="flex items-center gap-2">
                                                  {getFileIcon(filename)}
                                                  {filename}
                                                </DialogTitle>
                                                <DialogDescription>
                                                  Complete file content - you can copy this to use in your development environment
                                                </DialogDescription>
                                              </DialogHeader>
                                              <div className="relative">
                                                <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-96 border">
                                                  <code>{content}</code>
                                                </pre>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="absolute top-2 right-2"
                                                  onClick={() => copyToClipboard(content, filename)}
                                                >
                                                  <Copy className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </DialogContent>
                                          </Dialog>
                                          
                                          <Button 
                                            variant="outline" 
                                            size="sm" 
                                            onClick={() => copyToClipboard(content, filename)}
                                            className="flex items-center gap-2"
                                          >
                                            <Copy className="h-3 w-3" />
                                            Copy
                                          </Button>
                                        </div>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                                ))}
                              </Accordion>
                            </TabsContent>
                            
                            {generatedProject.project.generation_report && (
                              <TabsContent value="technical" className="space-y-4">
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Technical details about how your AI prototype was built - useful for understanding the approach and for technical teams.
                                  </p>
                                </div>
                                
                                <Accordion type="single" collapsible className="w-full">
                                  <AccordionItem value="approach">
                                    <AccordionTrigger>
                                      <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Solution Approach
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {generatedProject.project.generation_report.solution_approach}
                                      </p>
                                    </AccordionContent>
                                  </AccordionItem>

                                  <AccordionItem value="ethical">
                                    <AccordionTrigger>
                                      <div className="flex items-center gap-2">
                                        <Shield className="h-4 w-4" />
                                        Ethical Implementation
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-3">
                                      {generatedProject.project.generation_report.ethical_implementation.map((ethical, index) => (
                                        <div key={index} className="border-l-2 border-green-200 pl-3">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm">{ethical.category}</span>
                                            <Badge 
                                              variant={ethical.status === 'implemented' ? 'default' : 'secondary'}
                                              className="text-xs"
                                            >
                                              {ethical.status}
                                            </Badge>
                                          </div>
                                          <div className="text-xs space-y-1">
                                            <div>
                                              <span className="font-medium">Implementation:</span>
                                              <ul className="list-disc list-inside ml-2">
                                                {ethical.implementation_details.map((detail, idx) => (
                                                  <li key={idx}>{detail}</li>
                                                ))}
                                              </ul>
                                            </div>
                                            <div>
                                              <span className="font-medium">Verification:</span> {ethical.verification_method}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </AccordionContent>
                                  </AccordionItem>

                                  <AccordionItem value="architecture">
                                    <AccordionTrigger>
                                      <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4" />
                                        Architecture Decisions
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <ul className="text-sm space-y-1">
                                        {generatedProject.project.generation_report.architecture_decisions.map((decision, index) => (
                                          <li key={index} className="flex items-center gap-2">
                                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                                            {decision}
                                          </li>
                                        ))}
                                      </ul>
                                    </AccordionContent>
                                  </AccordionItem>

                                  <AccordionItem value="deployment">
                                    <AccordionTrigger>
                                      <div className="flex items-center gap-2">
                                        <Package className="h-4 w-4" />
                                        Deployment Considerations
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <ul className="text-sm space-y-1">
                                        {generatedProject.project.generation_report.deployment_considerations.map((consideration, index) => (
                                          <li key={index} className="flex items-center gap-2">
                                            <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                            {consideration}
                                          </li>
                                        ))}
                                      </ul>
                                    </AccordionContent>
                                  </AccordionItem>
                                </Accordion>
                              </TabsContent>
                            )}
                          </Tabs>
                        </CardContent>
                      </Card>

                      <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 dark:text-blue-200">
                          <strong>Next Step:</strong> Test your AI prototype in the Evaluation phase to see how well it works with your data. 
                          This will help you assess if this AI approach is worth pursuing for production development.
                        </AlertDescription>
                      </Alert>
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
              <Button size="lg" onClick={onCompletePhase} className="flex items-center gap-2">
                Continue to Evaluation Phase
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};