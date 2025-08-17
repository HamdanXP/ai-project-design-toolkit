import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/useToast";
import { useProject } from "@/contexts/ProjectContext";
import JSZip from "jszip";
import { 
  evaluationApi
} from "@/lib/evaluation-api";
import { DatasetAnalysisEngine } from "@/lib/dataset-analysis-utils";
import { convertMarkdownToPdf, getPdfFileName } from "@/lib/pdf-download-utils";
import {
  EvaluationPhaseStep,
  EvaluationContext,
  SimulationResult,
  EvaluationResult,
  AVAILABLE_DOCUMENTS,
  ComponentTransparency,
  ScenarioResult
} from "@/types/evaluation-phase";

const getFileExtension = (fileType: string): string => {
  const docInfo = AVAILABLE_DOCUMENTS.find(doc => doc.key === fileType);
  if (fileType === 'complete_project') {
    return '.zip';
  }
  return '.md';
};

const getFileName = (fileType: string, projectTitle?: string): string => {
  const docInfo = AVAILABLE_DOCUMENTS.find(doc => doc.key === fileType);
  const baseTitle = projectTitle ? `${projectTitle}-` : 'ai-project-';
  
  switch (fileType) {
    case 'complete_project':
      return `${baseTitle}complete.zip`;
    case 'documentation':
      return `${baseTitle}documentation.md`;
    case 'setup_instructions':
      return `${baseTitle}setup-guide.md`;
    case 'deployment_guide':
      return `${baseTitle}deployment-guide.md`;
    case 'ethical_assessment_guide':
      return `${baseTitle}ethical-assessment.md`;
    case 'technical_handover_package':
      return `${baseTitle}technical-handover.md`;
    default:
      return `${baseTitle}${fileType}.md`;
  }
};

export const useEvaluationPhase = () => {
  const { toast } = useToast();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId');
  const { updatePhaseSteps } = useProject();

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [evaluationContext, setEvaluationContext] = useState<EvaluationContext | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false);

  const [simulationLoading, setSimulationLoading] = useState(false);
  const [evaluationLoading, setEvaluationLoading] = useState(false);
  const [regeneratingScenarios, setRegeneratingScenarios] = useState(false); 
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [componentTransparency, setComponentTransparency] = useState<ComponentTransparency | null>(null);
  const [scenarioResults, setScenarioResults] = useState<ScenarioResult[] | null>(null);

  const steps: EvaluationPhaseStep[] = useMemo(() => {
    if (evaluationContext?.simulation_capabilities.evaluation_approach === 'evaluation_bypass') {
      return [
        { id: 'setup', title: 'Review Solution', completed: !!evaluationContext, canAccess: true },
        { id: 'guidance', title: 'Evaluation Guidance', completed: !!simulationResult, canAccess: !!evaluationContext },
        { id: 'summary', title: 'Project Summary', completed: !!evaluationResult, canAccess: !!simulationResult }
      ];
    }
    
    return [
      { id: 'setup', title: 'Review Solution', completed: !!evaluationContext, canAccess: true },
      { id: 'test', title: 'Test & Assess', completed: !!simulationResult, canAccess: !!evaluationContext },
      { id: 'evaluate', title: 'Review Results', completed: !!evaluationResult, canAccess: !!simulationResult },
      { id: 'summary', title: 'Project Summary', completed: !!evaluationResult, canAccess: !!evaluationResult }
    ];
  }, [evaluationContext, simulationResult, evaluationResult]);

  const progressPercentage = Math.round((steps.filter(s => s.completed).length / steps.length) * 100);

  useEffect(() => {
    if (evaluationContext) {
      updatePhaseSteps("evaluation", steps.length);
    }
  }, [steps.length, evaluationContext, updatePhaseSteps]);

  useEffect(() => {
    loadEvaluationContext();
  }, [projectId]);

  useEffect(() => {
    if (simulationResult && currentStep === 1 && !hasAutoAdvanced && 
        evaluationContext?.simulation_capabilities.evaluation_approach !== 'evaluation_bypass') {
      setCurrentStep(2);
      setHasAutoAdvanced(true);
    }
  }, [simulationResult, currentStep, hasAutoAdvanced, evaluationContext]);

  const loadEvaluationContext = async () => {
    if (!projectId) {
      setError("No project ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const context = await evaluationApi.getEvaluationContext(projectId);
      setEvaluationContext(context);
      
      if (context.simulation_capabilities.evaluation_approach === 'evaluation_bypass') {
        const bypassResult: SimulationResult = {
          simulation_type: 'suitability_assessment',
          testing_method: 'bypass',
          confidence_level: 'medium',
          evaluation_bypass: context.evaluation_bypass,
          simulation_explanation: {
            methodology: "Evaluation Bypass",
            data_usage: "No data processing required for this solution type",
            calculation_basis: ["Solution requires specialized evaluation tools"],
            limitations: ["Generated code ready for specialist testing"]
          }
        };

        // Create minimal evaluation result for bypass
        const bypassEvaluationResult: EvaluationResult = {
          status: "ready_for_deployment",
          evaluation_summary: {
            overall_assessment: "Project ready for specialist evaluation",
            solution_performance: {
              testing_method: "bypass",
              confidence_level: "medium",
              suitability_score: null
            },
            deployment_readiness: true,
            recommendation: "Download and proceed with specialist evaluation",
            key_strengths: ["Generated code is complete", "Ready for specialist testing"],
            areas_for_improvement: ["Requires domain-specific evaluation"]
          },
          simulation_results: bypassResult,
          development_feedback: null,
          decision_options: ["proceed_with_solution"],
          next_steps: [
            "Download the generated project files",
            "Consult with specialists for proper evaluation",
            "Test with real data in specialized environment"
          ],
          evaluation_timestamp: new Date().toISOString()
        };
        
        setSimulationResult(bypassResult);
        setEvaluationResult(bypassEvaluationResult);
        setCurrentStep(1);
        
        toast({
          title: "Evaluation Guidance Ready",
          description: "This solution requires specialized evaluation - guidance provided",
        });
      } else {
        toast({
          title: "Evaluation Ready",
          description: "Your generated project is ready for testing and evaluation",
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load evaluation context';
      setError(errorMessage);
      toast({
        title: "Error Loading Evaluation",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (file: File) => {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 50MB",
        variant: "destructive"
      });
      return;
    }
    setUploadedFile(file);
  };

    const regenerateScenarios = async () => {
    if (!projectId || !evaluationContext) return;

    try {
      setRegeneratingScenarios(true);
      
      const newScenarios = await evaluationApi.regenerateScenarios(projectId,{});
      
      setEvaluationContext({
        ...evaluationContext,
        testing_scenarios: newScenarios
      });
      
      toast({
        title: "Scenarios Regenerated",
        description: "New test scenarios have been generated for your project",
      });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate scenarios';
      toast({
        title: "Regeneration Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setRegeneratingScenarios(false);
    }
  };

  const runSimulation = async () => {
    if (!projectId) return;

    try {
      setSimulationLoading(true);
      setHasAutoAdvanced(false);

      setSimulationResult(null);
      setEvaluationResult(null);
      setComponentTransparency(null);
      setScenarioResults(null);

      const testingMethod = evaluationContext?.simulation_capabilities.testing_method;
      const evaluationApproach = evaluationContext?.simulation_capabilities.evaluation_approach;
      
      if (evaluationApproach === 'evaluation_bypass') {
        return;
      }
      
      let result: SimulationResult;
      
      if (testingMethod === 'dataset' && uploadedFile) {
        const datasetStatistics = await DatasetAnalysisEngine.analyzeDataset(uploadedFile);
        result = await evaluationApi.simulateWithStatistics(projectId, datasetStatistics);
      } else {

        result = await evaluationApi.simulateWithScenarios(projectId);
      }
      
      setSimulationResult(result);
      setComponentTransparency(result.component_transparency || null);
      setScenarioResults(result.scenario_results || null);
      setHasAutoAdvanced(false);
      
      if (result.scenario_results && result.scenario_results.length > 0) {
        toast({
          title: "Component Testing Complete",
          description: `Tested ${result.scenario_results.length} scenarios with your generated ${result.component_transparency?.component_type} component`,
        });
      } else if (result.suitability_assessment) {
        if (result.suitability_assessment.is_suitable) {
          toast({
            title: "Dataset Assessment Complete",
            description: `Your dataset is compatible with this AI solution (${Math.round(result.suitability_assessment.overall_score * 100)}% suitability)`,
          });
        }
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Assessment failed';
      toast({
        title: "Assessment Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setSimulationLoading(false);
    }
  };

  const evaluateResults = async () => {
    if (!projectId || !simulationResult) return;

    try {
      setEvaluationLoading(true);
      const result = await evaluationApi.evaluateResults(projectId, simulationResult);
      
      setEvaluationResult(result);
      setCurrentStep(steps.length - 1);
      
      toast({
        title: "Evaluation Complete",
        description: "Your AI solution has been evaluated and results are ready",
      });
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Evaluation failed';
      toast({
        title: "Evaluation Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw err;
    } finally {
      setEvaluationLoading(false);
    }
  };

  const downloadFile = async (fileType: string) => {
    if (!projectId) {
      toast({
        title: "Demo Download",
        description: `This would download the ${fileType} in a real project`,
      });
      return;
    }

    try {
      const result = await evaluationApi.downloadProjectFile(projectId, fileType);
      const docInfo = AVAILABLE_DOCUMENTS.find(doc => doc.key === fileType);
      const projectTitle = evaluationContext?.generated_project?.title || 'ai-project';
      
      if (fileType === 'complete_project' && result.files) {
        const zip = new JSZip();
        
        const files = result.files as Record<string, string>;
        Object.entries(files).forEach(([filename, content]) => {
          if (typeof content === 'string') {
            zip.file(filename, content);
          } else {
            console.warn(`Skipping file ${filename}: content is not a string`);
          }
        });
        
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = getFileName(fileType, projectTitle);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download Started",
          description: "Complete project downloaded as ZIP file",
        });
      } else if (result.content && typeof result.content === 'string') {

        const pdfFileName = getPdfFileName(fileType, projectTitle);
        await convertMarkdownToPdf(result.content, pdfFileName, projectTitle);
        
        toast({
          title: "Download Complete",
          description: `${docInfo?.title || fileType} downloaded successfully`,
        });
      } else {
        throw new Error('Invalid file content received');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      toast({
        title: "Download Error",
        description: errorMessage,
        variant: "destructive"
      });
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

  const retryLoading = () => {
    setError(null);
    loadEvaluationContext();
  };

  const canProceedToNextPhase = () => {
    return evaluationResult?.status === "ready_for_deployment" || 
           evaluationResult?.status === "needs_minor_improvements";
  };

  const canDownloadProject = () => {
    return evaluationResult?.status === "ready_for_deployment" || 
           evaluationResult?.status === "needs_minor_improvements";
  };

  return {
    currentStep,
    loading,
    error,
    evaluationContext,
    simulationResult,
    evaluationResult,
    evaluationLoading,
    simulationLoading,
    uploadedFile,
    steps,
    progressPercentage,
    regenerateScenarios,
    regeneratingScenarios,
    setCurrentStep: navigateToStep,
    handleFileUpload,
    runSimulation,
    evaluateResults,
    downloadFile,
    retryLoading,
    canProceedToNextPhase,
    canDownloadProject,
    componentTransparency,
    scenarioResults,
    projectId,
  };
};