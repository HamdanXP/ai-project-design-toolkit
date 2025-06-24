import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
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

import
{  
  developmentApi,
  createProjectGenerationRequest,
  extractContextSummary,
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

  // UI State
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solutionsError, setSolutionsError] = useState<string | null>(null);
  
  // Data State - Split into context and solutions
  const [contextData, setContextData] = useState<ProjectContextOnly | null>(null);
  const [solutionsData, setSolutionsData] = useState<SolutionsData | null>(null);
  const [selectedSolution, setSelectedSolution] = useState<AISolution | null>(null);
  const [generationInProgress, setGenerationInProgress] = useState(false);
  const [generatedProject, setGeneratedProject] = useState<ProjectGenerationResponse | null>(null);
  const [developmentStatus, setDevelopmentStatus] = useState<DevelopmentStatus | null>(null);
  
  // Track if we've already reported progress to prevent loops
  const [progressReported, setProgressReported] = useState(false);

  // Combine context and solutions data for backward compatibility
  const developmentData = useMemo(() => {
    if (!contextData) return null;
    
    return {
      project_context: contextData.project_context,
      available_solutions: solutionsData?.available_solutions || [],
      ethical_safeguards: contextData.ethical_safeguards,
      solution_rationale: solutionsData?.solution_rationale || contextData.solution_rationale
    } as DevelopmentPhaseData;
  }, [contextData, solutionsData]);

  // Computed State
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
      title: 'Generate Project', 
      completed: !!generatedProject && generatedProject.success,
      canAccess: !!selectedSolution
    }
  ], [contextData, selectedSolution, generatedProject]);

  const summary = developmentData ? extractContextSummary(developmentData) : null;
  const progressPercentage = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  // Load basic context on mount (fast)
  useEffect(() => {
    loadContextData();
    console.log(`Loading development context for project: ${projectId}`);
  }, [projectId]);

  // Load solutions when user navigates to step 1 (slow, on-demand)
  useEffect(() => {
    if (currentStep === 1 && contextData && !solutionsData && !solutionsLoading) {
      loadSolutions();
    }
  }, [currentStep, contextData, solutionsData, solutionsLoading]);

  const loadContextData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid project ID
      if (!projectId || projectId === 'current') {
        // Handle default/demo project case
        console.log('No specific project ID provided, loading demo data...');
        setLoading(false);
        return;
      }
      
      // Load context (fast) and status in parallel
      const [contextResponse, statusData] = await Promise.all([
        developmentApi.getDevelopmentContext(projectId),
        developmentApi.getDevelopmentStatus(projectId).catch(() => null) // Status might not exist yet
      ]);
      
      setContextData(contextResponse);
      
      if (statusData) {
        setDevelopmentStatus(statusData);
        
        // Check if project was already generated
        if (statusData.generated_project && statusData.development_data?.generated_project) {
          setGeneratedProject({
            success: true,
            project: statusData.development_data.generated_project,
            generation_steps: ['Project generated successfully'],
            estimated_completion_time: 'Complete',
            next_steps: [
              'Download the complete project',
              'Review the documentation',
              'Follow setup instructions',
              'Proceed to evaluation phase'
            ]
          });
          setCurrentStep(2);
        }
      }
      
      toast({
        title: "Project Context Loaded",
        description: "Ready to generate AI solutions tailored for your project",
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load development context';
      setError(errorMessage);
      toast({
        title: "Error Loading Development Context",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSolutions = async () => {
    if (!projectId || projectId === 'current') {
      // Handle demo case
      return;
    }

    try {
      setSolutionsLoading(true);
      setSolutionsError(null);
      
      const solutionsResponse = await developmentApi.generateSolutions(projectId);
      setSolutionsData(solutionsResponse);
      
      // Restore previous selection if it exists
      if (developmentStatus?.selected_solution) {
        const solution = solutionsResponse.available_solutions.find(
          s => s.id === developmentStatus.selected_solution?.solution_id
        );
        if (solution) {
          setSelectedSolution(solution);
          setCurrentStep(2); // Go to generation step
        }
      }
      
      toast({
        title: "AI Solutions Generated",
        description: `Found ${solutionsResponse.available_solutions.length} AI solutions tailored for your project`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI solutions';
      setSolutionsError(errorMessage);
      toast({
        title: "Error Generating Solutions",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSolutionsLoading(false);
    }
  }

  const selectSolution = async (solution: AISolution) => {
    try {
      setSelectedSolution(solution);
      
      // Only save to backend if we have a real project ID
      if (projectId && projectId !== 'current') {
        const selection = await developmentApi.selectSolution(
          projectId, 
          solution.id, 
          solution.title,
          `Selected ${solution.title} - ${solution.description}`
        );
      }
      
      toast({
        title: "Solution Selected",
        description: `You've selected ${solution.title}`,
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to select solution';
      toast({
        title: "Error Selecting Solution",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    }
  };

  const generateProject = async (customizations?: Record<string, any>) => {
    if (!selectedSolution) {
      throw new Error('No solution selected');
    }
    
    try {
      setGenerationInProgress(true);
      
      // For demo projects, simulate generation
      if (!projectId || projectId === 'current') {        
        return;
      }
      
      // For real projects, call the API
      const generationRequest = createProjectGenerationRequest(
        selectedSolution.id,
        ['privacy_preservation', 'bias_mitigation', 'transparency', 'user_autonomy'],
        customizations
      );
      
      const result = await developmentApi.generateProject(projectId, generationRequest);
      
      setGeneratedProject(result);
      
      toast({
        title: "Project Generated Successfully!",
        description: "Your complete AI solution is ready to download",
      });
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate project';
      toast({
        title: "Error Generating Project",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setGenerationInProgress(false);
    }
  };

  const downloadFile = async (fileType: 'complete' | 'documentation' | 'setup' | 'ethical-report' | 'deployment') => {
    try {
      // For demo projects, simulate download
      if (!projectId || projectId === 'current') {
        toast({
          title: "Demo Download",
          description: `This would download the ${fileType} in a real project`,
        });
        return;
      }
      
      const result = await developmentApi.downloadProjectFile(projectId, fileType);
      
      toast({
        title: "Download Started",
        description: `Downloading ${fileType}...`,
      });
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to download file';
      toast({
        title: "Download Failed",
        description: errorMessage,
        variant: "destructive"
      });
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
    setProgressReported(false);
    loadContextData();
  };

  const retrySolutions = () => {
    setSolutionsError(null);
    loadSolutions();
  };

  // Helper functions for UI components
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
    
    // Add positive reasons
    if (suitable) {
      if (solution.recommended) {
        reasons.push('Recommended based on your project characteristics');
      }
      reasons.push('Includes built-in ethical safeguards');
      reasons.push('Tailored for humanitarian use cases');
    }
    
    return { suitable, reasons };
  };

  return {
    // State
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
    
    // Computed
    steps,
    summary,
    progressPercentage,
    progressReported,
    setProgressReported,
    
    // Actions
    setCurrentStep: navigateToStep,
    selectSolution,
    generateProject,
    downloadFile,
    retryLoading,
    retrySolutions,
    
    // Helpers
    canProceedToNextPhase,
    getSolutionBadgeInfo,
    getSolutionSuitabilityInfo,
    
    // Project context
    projectId
  };
};