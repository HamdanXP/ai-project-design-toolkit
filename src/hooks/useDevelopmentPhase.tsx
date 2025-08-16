import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { 
  DevelopmentPhaseData, 
  AISolution, 
  ProjectGenerationRequest,
  ProjectGenerationResponse,
  SolutionSelection,
  DevelopmentStatus,
  ProjectContextOnly,
  SolutionsData
} from "@/types/development-phase";

import {  
  developmentApi,
  createProjectGenerationRequest,
  extractContextSummary,
  analyzeSolutionDiversity,
  validateSolutionQuality,
  DevelopmentApiError
} from "@/lib/development-api";

export interface DevelopmentPhaseStep {
  id: string;
  title: string;
  completed: boolean;
  canAccess: boolean;
}

export const useDevelopmentPhase = () => {
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [error, setError] = useState<DevelopmentApiError | null>(null);
  const [solutionsError, setSolutionsError] = useState<DevelopmentApiError | null>(null);
  
  const [contextData, setContextData] = useState<ProjectContextOnly | null>(null);
  const [solutionsData, setSolutionsData] = useState<SolutionsData | null>(null);
  const [solutionsFromCache, setSolutionsFromCache] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<AISolution | null>(null);
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<ProjectGenerationResponse | null>(null);
  const [developmentStatus, setDevelopmentStatus] = useState<DevelopmentStatus | null>(null);

  const developmentData = useMemo(() => {
    if (!contextData) return null;
    
    return {
      project_context: contextData.project_context,
      available_solutions: solutionsData?.available_solutions || [],
      ethical_safeguards: contextData.ethical_safeguards,
      solution_rationale: solutionsData?.solution_rationale || contextData.solution_rationale
    } as DevelopmentPhaseData;
  }, [contextData, solutionsData]);

  const steps = useMemo(() => [
    { 
      id: 'overview', 
      title: 'Project Overview', 
      completed: !!contextData,
      canAccess: true
    },
    { 
      id: 'solution', 
      title: 'Choose Solution', 
      completed: !!selectedSolution,
      canAccess: !!contextData
    },
    { 
      id: 'generate', 
      title: 'Generate Prototype', 
      completed: !!generatedProject && generatedProject.success,
      canAccess: !!selectedSolution
    }
  ], [contextData, selectedSolution, generatedProject]);

  const summary = developmentData ? extractContextSummary(developmentData) : null;
  const progressPercentage = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  const solutionQuality = useMemo(() => {
    if (!solutionsData?.available_solutions) return null;
    return validateSolutionQuality(solutionsData.available_solutions);
  }, [solutionsData]);

  const solutionDiversity = useMemo(() => {
    if (!solutionsData?.available_solutions) return null;
    return analyzeSolutionDiversity(solutionsData.available_solutions);
  }, [solutionsData]);

  const showSuccessToast = useCallback((message: string, description?: string) => {
    toast({
      title: message,
      description: description,
    });
  }, [toast]);

  useEffect(() => {
    loadContextData();
    console.log(`Loading development context for project: ${projectId}`);
  }, [projectId]);

  useEffect(() => {
    const needsSolutions = (currentStep === 1 || (currentStep === 2 && !selectedSolution)) 
                          && contextData 
                          && !solutionsData 
                          && !solutionsLoading;
    
    if (needsSolutions) {
      loadSolutions();
    }
  }, [currentStep, contextData, solutionsData, solutionsLoading, selectedSolution]);

  useEffect(() => {
    if (solutionQuality && solutionQuality.issues.length > 0) {
      console.warn('Solution quality issues:', solutionQuality.issues);
    }
  }, [solutionQuality]);

  const loadContextData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!projectId) {
        console.log('No specific project ID provided, loading demo data...');
        setLoading(false);
        return;
      }
      
      const [contextResponse, statusData] = await Promise.all([
        developmentApi.getDevelopmentContext(projectId),
        developmentApi.getDevelopmentStatus(projectId).catch(() => null)
      ]);
      
      setContextData(contextResponse);
      
      if (statusData) {
        setDevelopmentStatus(statusData);
        
        if (statusData.generated_project && statusData.development_data?.generated_project) {
          setGeneratedProject({
            success: true,
            project: statusData.development_data.generated_project,
            generation_steps: ['Project generated successfully'],
            estimated_completion_time: 'Complete',
            next_steps: [
              'Test the prototype in evaluation phase',
              'Review the production readiness guidance',
              'Use technical handover documentation with development teams',
              'Proceed to evaluation phase'
            ]
          });
          setCurrentStep(2);
          
          if (statusData.development_data?.available_solutions && statusData.selected_solution) {
            const solution = statusData.development_data.available_solutions.find(
              (s: any) => s.id === statusData.selected_solution?.solution_id
            );
            if (solution) {
              setSelectedSolution(solution);
              setSolutionsData({
                available_solutions: statusData.development_data.available_solutions,
                solution_rationale: statusData.development_data.solution_rationale || 'Solutions restored from previous session'
              });
            }
          }
        } else if (statusData.selected_solution && statusData.development_data?.available_solutions) {
          const solution = statusData.development_data.available_solutions.find(
            (s: any) => s.id === statusData.selected_solution?.solution_id
          );
          if (solution) {
            setSelectedSolution(solution);
            setSolutionsData({
              available_solutions: statusData.development_data.available_solutions,
              solution_rationale: statusData.development_data.solution_rationale || 'Solutions restored from previous session'
            });
            setSolutionsFromCache(true);
            setCurrentStep(2);
          }
        }
      }
            
    } catch (err) {
      const apiError = err as DevelopmentApiError;
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const loadSolutions = async () => {
    if (!projectId) {
      return;
    }

    try {
      setSolutionsLoading(true);
      setSolutionsError(null);
      
      const solutionsResponse = await developmentApi.generateSolutions(projectId);
      setSolutionsData(solutionsResponse);
      setSolutionsFromCache(false);
      
      if (developmentStatus?.selected_solution && !selectedSolution) {
        const solution = solutionsResponse.available_solutions.find(
          s => s.id === developmentStatus.selected_solution?.solution_id
        );
        if (solution) {
          setSelectedSolution(solution);
        }
      }
      
      const diversity = analyzeSolutionDiversity(solutionsResponse.available_solutions);
      const quality = validateSolutionQuality(solutionsResponse.available_solutions);
      
      let toastMessage = `Found ${solutionsResponse.available_solutions.length} AI solutions for your project`;
      
      if (diversity.hasMultipleTechniques) {
        toastMessage += ` using ${diversity.techniques.length} different approaches`;
      }
      
      showSuccessToast("AI Solutions Generated", toastMessage);
      
      if (quality.issues.length > 0 && quality.recommendations.length > 0) {
        setTimeout(() => {
          showSuccessToast("Suggestion", quality.recommendations[0]);
        }, 2000);
      }
      
    } catch (err) {
      const apiError = err as DevelopmentApiError;
      setSolutionsError(apiError);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const generateFreshSolutions = async () => {
    try {
      setSolutionsLoading(true);
      setSolutionsError(null);
      
      setSolutionsData(null);
      setSelectedSolution(null);
      setGeneratedProject(null);
      setSolutionsFromCache(false);
      
      if (!projectId) {
        return;
      }
      
      const solutionsResponse = await developmentApi.generateSolutions(projectId);
      setSolutionsData(solutionsResponse);
      setSolutionsFromCache(false);
      
      const diversity = analyzeSolutionDiversity(solutionsResponse.available_solutions);
      
      let toastMessage = `Generated ${solutionsResponse.available_solutions.length} fresh AI solutions`;
      
      if (diversity.hasMultipleTechniques) {
        toastMessage += ` using ${diversity.techniques.length} different approaches`;
      }
      
      showSuccessToast("Fresh AI Solutions Generated", toastMessage);
      
    } catch (err) {
      const apiError = err as DevelopmentApiError;
      setSolutionsError(apiError);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const generateSolutionsWithFeedback = async (userFeedback?: string) => {
    if (!projectId) {
      return;
    }

    try {
      setSolutionsLoading(true);
      setSolutionsError(null);
      
      setSolutionsData(null);
      setSelectedSolution(null);
      setGeneratedProject(null);
      setSolutionsFromCache(false);
      
      const requestData = userFeedback ? { feedback: userFeedback } : undefined;
      const solutionsResponse = await developmentApi.generateSolutionsWithFeedback(projectId, requestData);
      setSolutionsData(solutionsResponse);
      setSolutionsFromCache(false);
      
      const diversity = analyzeSolutionDiversity(solutionsResponse.available_solutions);
      const quality = validateSolutionQuality(solutionsResponse.available_solutions);
      
      let toastMessage = `Generated ${solutionsResponse.available_solutions.length} AI solutions`;
      if (userFeedback) {
        toastMessage += ' based on your requirements';
      }
      
      if (diversity.hasMultipleTechniques) {
        toastMessage += ` using ${diversity.techniques.length} different approaches`;
      }
      
      showSuccessToast(userFeedback ? "Custom AI Solutions Generated" : "AI Solutions Generated", toastMessage);
      
      if (quality.issues.length > 0 && quality.recommendations.length > 0) {
        setTimeout(() => {
          showSuccessToast("Suggestion", quality.recommendations[0]);
        }, 2000);
      }
      
    } catch (err) {
      const apiError = err as DevelopmentApiError;
      setSolutionsError(apiError);
    } finally {
      setSolutionsLoading(false);
    }
  };

  const selectSolution = async (solution: AISolution) => {
    try {
      setSelectedSolution(solution);
      
      if (projectId) {
        await developmentApi.selectSolution(
          projectId, 
          solution.id, 
          solution.title,
          `Selected ${solution.title} - ${solution.description.slice(0, 100)}...`
        );
      }
      
    } catch (err) {
      throw err;
    }
  };

  const generateProject = async (customizations?: Record<string, any>) => {
    if (!selectedSolution) {
      throw new Error('No AI approach selected');
    }
    
    try {
      setGenerationInProgress(true);
      
      if (!projectId) {        
        return;
      }
      
      const generationRequest = createProjectGenerationRequest(
        selectedSolution.id,
        ['privacy_preservation', 'bias_mitigation', 'transparency', 'user_autonomy'],
        customizations
      );
      
      const result = await developmentApi.generateProject(projectId, generationRequest);
      
      setGeneratedProject(result);
      
      const aiTechniqueDisplay = selectedSolution.ai_technique
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      showSuccessToast("AI Prototype Generated!", `Your ${aiTechniqueDisplay} prototype is ready for evaluation and testing`);
      
      return result;
      
    } catch (err) {
      throw err;
    } finally {
      setGenerationInProgress(false);
    }
  };

  const downloadFile = async (fileType: 'complete' | 'documentation' | 'setup' | 'ethical-report' | 'deployment') => {
    try {
      if (!projectId) {
        showSuccessToast("Demo Download", `This would download the ${fileType} in a real project`);
        return;
      }
      
      const result = await developmentApi.downloadProjectFile(projectId, fileType);
      
      showSuccessToast("Download Started", `Downloading ${fileType}...`);
      
      return result;
      
    } catch (err) {
      throw err;
    }
  };

  const navigateToStep = (stepIndex: number) => {
    const step = steps[stepIndex];
    if (step && step.canAccess) {
      setCurrentStep(stepIndex);
    } else {
      toast({
        title: "Step Not Available",
        description: "Complete previous steps first",
        variant: "destructive"
      });
    }
  };

  const canProceedToNextPhase = useCallback(() => {
    return steps.every(s => s.completed) && generatedProject?.success;
  }, [steps, generatedProject]);

  const retryLoading = () => {
    setError(null);
    setSolutionsError(null);
    loadContextData();
  };

  const retrySolutions = () => {
    setSolutionsError(null);
    loadSolutions();
  };

  const getSolutionBadgeInfo = (solution: AISolution) => {
    const badges = [];
    
    if (solution.recommended) {
      badges.push({ text: 'Recommended', variant: 'success' as const });
    }
    
    if (solution.id === selectedSolution?.id) {
      badges.push({ text: 'Selected', variant: 'primary' as const });
    }
    
    return badges;
  };

  const getSolutionSuitabilityInfo = (solution: AISolution) => {
    if (!developmentData) return { suitable: true, reasons: [] };
    
    const reasons: string[] = [];
    let suitable = true;
    
    if (solution.confidence_score >= 80) {
      reasons.push('High confidence this approach will work for your project');
    } else if (solution.confidence_score >= 60) {
      reasons.push('Good potential for addressing your project needs');
    } else {
      reasons.push('Lower confidence - may need additional context or different approach');
      suitable = false;
    }
    
    if (suitable) {
      if (solution.recommended) {
        reasons.push('Recommended based on your project characteristics');
      }
      reasons.push('Includes built-in ethical safeguards');
      reasons.push('Tailored for humanitarian use cases');
      
      if (solution.best_for) {
        reasons.push(`Specifically designed for: ${solution.best_for}`);
      }
    }
    
    return { suitable, reasons };
  };

  return {
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
    developmentStatus,
    
    steps,
    summary,
    progressPercentage,
    
    solutionQuality,
    solutionDiversity,
    solutionsFromCache,
    
    setCurrentStep: navigateToStep,
    selectSolution,
    generateProject,
    generateSolutionsWithFeedback,
    generateFreshSolutions,
    downloadFile,
    retryLoading,
    retrySolutions,
    
    canProceedToNextPhase,
    getSolutionBadgeInfo,
    getSolutionSuitabilityInfo,
    setGeneratedProject,
    
    projectId
  };
};