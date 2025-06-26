import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api";
import { ProjectPhase, EthicalConsideration } from "@/types/project";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";
import { 
  // Legacy development types for backward compatibility
  EthicalGuardrail, 
  PrototypeMilestone, 
  TestResult, 
  EvaluationCriteria,
  DevelopmentDecision,
  RiskAssessment,
  StakeholderFeedback,
  ImpactGoalCheck,
  EvaluationDecision,
  // New development types
  AISolution,
  ProjectGenerationResponse,
  SolutionSelection
} from "@/types/development-phase";

interface ProjectContextType {
  isLoading: boolean;
  phases: ProjectPhase[];
  setPhases: React.Dispatch<React.SetStateAction<ProjectPhase[]>>;
  activePhaseId: string;
  setActivePhaseId: React.Dispatch<React.SetStateAction<string>>;
  updatePhaseSteps: (phaseId: string, totalSteps: number) => void;
  projectPrompt: string;
  setProjectPrompt: React.Dispatch<React.SetStateAction<string>>;
  projectFiles: string[];
  setProjectFiles: React.Dispatch<React.SetStateAction<string[]>>;
  reflectionAnswers: Record<string, string>;
  setReflectionAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  scopingActiveStep: number;
  setScopingActiveStep: React.Dispatch<React.SetStateAction<number>>;
  selectedUseCase: UseCase | null;
  setSelectedUseCase: React.Dispatch<React.SetStateAction<UseCase | null>>;
  constraints: FeasibilityConstraint[];
  setConstraints: React.Dispatch<React.SetStateAction<FeasibilityConstraint[]>>;
  selectedDataset: Dataset | null;
  setSelectedDataset: React.Dispatch<React.SetStateAction<Dataset | null>>;
  suitabilityChecks: DataSuitabilityCheck[];
  setSuitabilityChecks: React.Dispatch<React.SetStateAction<DataSuitabilityCheck[]>>;
  scopingFinalDecision: 'proceed' | 'revise' | null;
  setScopingFinalDecision: React.Dispatch<React.SetStateAction<'proceed' | 'revise' | null>>;
  
  // NEW: Enhanced Development Phase State
  developmentSelectedSolution: AISolution | null;
  setDevelopmentSelectedSolution: React.Dispatch<React.SetStateAction<AISolution | null>>;
  developmentGeneratedProject: ProjectGenerationResponse | null;
  setDevelopmentGeneratedProject: React.Dispatch<React.SetStateAction<ProjectGenerationResponse | null>>;
  developmentSolutionSelection: SolutionSelection | null;
  setDevelopmentSolutionSelection: React.Dispatch<React.SetStateAction<SolutionSelection | null>>;
  
  // Legacy development fields for backward compatibility
  developmentSelectedPipeline: string;
  setDevelopmentSelectedPipeline: React.Dispatch<React.SetStateAction<string>>;
  developmentGuardrails: EthicalGuardrail[];
  setDevelopmentGuardrails: React.Dispatch<React.SetStateAction<EthicalGuardrail[]>>;
  developmentMilestones: PrototypeMilestone[];
  setDevelopmentMilestones: React.Dispatch<React.SetStateAction<PrototypeMilestone[]>>;
  developmentTestResults: TestResult[];
  setDevelopmentTestResults: React.Dispatch<React.SetStateAction<TestResult[]>>;
  developmentEvaluationCriteria: EvaluationCriteria[];
  setDevelopmentEvaluationCriteria: React.Dispatch<React.SetStateAction<EvaluationCriteria[]>>;
  developmentDecision: DevelopmentDecision;
  setDevelopmentDecision: React.Dispatch<React.SetStateAction<DevelopmentDecision>>;
  
  // Evaluation phase state
  evaluationTestResults: string;
  setEvaluationTestResults: React.Dispatch<React.SetStateAction<string>>;
  evaluationImpactGoalChecks: ImpactGoalCheck[];
  setEvaluationImpactGoalChecks: React.Dispatch<React.SetStateAction<ImpactGoalCheck[]>>;
  evaluationRiskAssessments: RiskAssessment[];
  setEvaluationRiskAssessments: React.Dispatch<React.SetStateAction<RiskAssessment[]>>;
  evaluationStakeholderFeedback: StakeholderFeedback[];
  setEvaluationStakeholderFeedback: React.Dispatch<React.SetStateAction<StakeholderFeedback[]>>;
  evaluationDecision: EvaluationDecision;
  setEvaluationDecision: React.Dispatch<React.SetStateAction<EvaluationDecision>>;
  evaluationJustification: string;
  setEvaluationJustification: React.Dispatch<React.SetStateAction<string>>;

  // NEW: Ethical Considerations
  ethicalConsiderations: EthicalConsideration[];
  setEthicalConsiderations: React.Dispatch<React.SetStateAction<EthicalConsideration[]>>;
  ethicalConsiderationsAcknowledged: boolean;
  setEthicalConsiderationsAcknowledged: React.Dispatch<React.SetStateAction<boolean>>;
  loadEthicalConsiderations: (projectId: string) => Promise<void>;
  acknowledgeEthicalConsiderations: (projectId: string, acknowledgedIds?: string[]) => Promise<void>;
  refreshEthicalConsiderations: (projectId: string) => Promise<void>;
}

// Helper functions for localStorage
const getStorageKey = (projectId: string) => `project-${projectId}`;
const getMetaKey = (projectId: string) => `project-${projectId}-meta`;

interface ProjectMetadata {
  lastSync: string; // ISO timestamp when we last synced with API
  version: number;  // Version from API
}

const getFromStorage = (projectId: string) => {
  try {
    const data = localStorage.getItem(getStorageKey(projectId));
    const meta = localStorage.getItem(getMetaKey(projectId));
    
    return {
      data: data ? JSON.parse(data) : null,
      meta: meta ? JSON.parse(meta) : null
    };
  } catch (error) {
    console.warn('Error reading from localStorage:', error);
    return { data: null, meta: null };
  }
};

const saveToStorage = (projectId: string, data: any, metadata: ProjectMetadata) => {
  try {
    localStorage.setItem(getStorageKey(projectId), JSON.stringify(data));
    localStorage.setItem(getMetaKey(projectId), JSON.stringify(metadata));
  } catch (error) {
    console.warn('Error saving to localStorage:', error);
  }
};

// Default values
const getDefaultPhases = (): ProjectPhase[] => [
  { id: "reflection", name: "Reflection", status: "in-progress", progress: 0, totalSteps: 8, completedSteps: 0 },
  { id: "scoping", name: "Scoping", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 },
  { id: "development", name: "Development", status: "not-started", progress: 0, totalSteps: 3, completedSteps: 0 }, // Updated to 3 steps
  { id: "evaluation", name: "Evaluation", status: "not-started", progress: 0, totalSteps: 5, completedSteps: 0 }
];

// Updated to include ALL constraints used in the feasibility assessment
const getDefaultConstraints = (): FeasibilityConstraint[] => [
  // Legacy constraints (keep for backward compatibility)
  { id: "time", label: "Time Available", value: "medium-term", options: ["short-term", "medium-term", "long-term", "ongoing"], type: "select" },
  { id: "tech", label: "Technical Capacity", value: "moderate", options: ["limited", "moderate", "extensive"], type: "select" },
  { id: "compute", label: "Computing Resources", value: "cloud", options: ["local", "cloud", "hybrid", "enterprise"], type: "select" },
  { id: "internet", label: "Internet Access", value: true, type: "toggle" },
  { id: "infrastructure", label: "Local Infrastructure", value: true, type: "toggle" },
  
  // Complete feasibility assessment constraints
  // Resources & Budget
  { id: "budget", label: "Project Budget", value: "limited", options: ["limited", "moderate", "substantial", "unlimited"], type: "select" },
  { id: "team-size", label: "Team Size", value: "small", options: ["individual", "small", "medium", "large"], type: "select" },
  
  // Team Expertise
  { id: "ai-experience", label: "AI/ML Experience", value: "beginner", options: ["none", "beginner", "intermediate", "advanced"], type: "select" },
  { id: "technical-skills", label: "Technical Skills", value: "moderate", options: ["limited", "moderate", "good", "excellent"], type: "select" },
  { id: "learning-capacity", label: "Learning & Training Capacity", value: true, type: "toggle" },
  
  // Organizational Readiness
  { id: "stakeholder-support", label: "Stakeholder Buy-in", value: "moderate", options: ["low", "moderate", "high", "champion"], type: "select" },
  { id: "change-management", label: "Change Management Readiness", value: false, type: "toggle" },
  { id: "data-governance", label: "Data Governance", value: "developing", options: ["none", "developing", "established", "mature"], type: "select" },
  
  // External Factors
  { id: "regulatory-compliance", label: "Regulatory Requirements", value: "moderate", options: ["minimal", "moderate", "strict", "complex"], type: "select" },
  { id: "partnerships", label: "External Partnerships", value: false, type: "toggle" },
  { id: "sustainability", label: "Long-term Sustainability Plan", value: false, type: "toggle" }
];

const getDefaultSuitabilityChecks = (): DataSuitabilityCheck[] => [
  { id: "data_completeness", question: "When you examine the data, what do you observe?", answer: "unknown", description: "Assess how complete and consistent your dataset appears" },
  { id: "population_representativeness", question: "Does this data fairly represent the people you want to help?", answer: "unknown", description: "Evaluate if the data covers your target communities adequately" },
  { id: "privacy_ethics", question: "Could using this data cause harm or raise privacy concerns?", answer: "unknown", description: "Consider potential risks to individuals and communities" },
  { id: "quality_sufficiency", question: "Do you have enough good quality data for your project?", answer: "unknown", description: "Assess if the data volume and quality meet your project needs" }
];

const getDefaultImpactGoalChecks = (): ImpactGoalCheck[] => [
  { id: "goal1", question: "Does the model deliver the benefit I defined earlier?", isAligned: false, notes: "" },
  { id: "goal2", question: "Does my model support the people it's meant to help?", isAligned: false, notes: "" },
  { id: "goal3", question: "Is the solution addressing the original problem effectively?", isAligned: false, notes: "" }
];

const getDefaultRiskAssessments = (): RiskAssessment[] => [
  { id: "risk1", category: "Bias", level: "unknown", notes: "" },
  { id: "risk2", category: "Misuse potential", level: "unknown", notes: "" },
  { id: "risk3", category: "Safety concerns", level: "unknown", notes: "" }
];

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const projectId = searchParams.get('projectId') || 'current';
  
  const [isLoading, setIsLoading] = useState(true);
  
  // All existing state
  const [phases, setPhases] = useState<ProjectPhase[]>(getDefaultPhases());
  const [activePhaseId, setActivePhaseId] = useState<string>("reflection");
  const [projectPrompt, setProjectPrompt] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  const [scopingActiveStep, setScopingActiveStep] = useState<number>(1);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [constraints, setConstraints] = useState<FeasibilityConstraint[]>(getDefaultConstraints());
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [suitabilityChecks, setSuitabilityChecks] = useState<DataSuitabilityCheck[]>(getDefaultSuitabilityChecks());
  const [scopingFinalDecision, setScopingFinalDecision] = useState<'proceed' | 'revise' | null>(null);
  
  // NEW: Enhanced Development Phase State
  const [developmentSelectedSolution, setDevelopmentSelectedSolution] = useState<AISolution | null>(null);
  const [developmentGeneratedProject, setDevelopmentGeneratedProject] = useState<ProjectGenerationResponse | null>(null);
  const [developmentSolutionSelection, setDevelopmentSolutionSelection] = useState<SolutionSelection | null>(null);
  
  // Legacy development state (for backward compatibility)
  const [developmentSelectedPipeline, setDevelopmentSelectedPipeline] = useState<string>("");
  const [developmentGuardrails, setDevelopmentGuardrails] = useState<EthicalGuardrail[]>([]);
  const [developmentMilestones, setDevelopmentMilestones] = useState<PrototypeMilestone[]>([]);
  const [developmentTestResults, setDevelopmentTestResults] = useState<TestResult[]>([]);
  const [developmentEvaluationCriteria, setDevelopmentEvaluationCriteria] = useState<EvaluationCriteria[]>([]);
  const [developmentDecision, setDevelopmentDecision] = useState<DevelopmentDecision>(null);
  
  // Evaluation state
  const [evaluationTestResults, setEvaluationTestResults] = useState<string>("");
  const [evaluationImpactGoalChecks, setEvaluationImpactGoalChecks] = useState<ImpactGoalCheck[]>(getDefaultImpactGoalChecks());
  const [evaluationRiskAssessments, setEvaluationRiskAssessments] = useState<RiskAssessment[]>(getDefaultRiskAssessments());
  const [evaluationStakeholderFeedback, setEvaluationStakeholderFeedback] = useState<StakeholderFeedback[]>([]);
  const [evaluationDecision, setEvaluationDecision] = useState<EvaluationDecision>(null);
  const [evaluationJustification, setEvaluationJustification] = useState<string>("");

  // NEW: Ethical Considerations State
  const [ethicalConsiderations, setEthicalConsiderations] = useState<EthicalConsideration[]>([]);
  const [ethicalConsiderationsAcknowledged, setEthicalConsiderationsAcknowledged] = useState<boolean>(false);

  // NEW: Load ethical considerations from API
  const loadEthicalConsiderations = async (projectId: string) => {
    if (projectId === 'current') {
      // Don't try to load for default project
      setEthicalConsiderations([]);
      return;
    }

    try {
      const response = await api.backend.ethicalConsiderations.get(projectId);
      if (response.success) {
        setEthicalConsiderations(response.data);
      }
    } catch (error) {
      console.error('Failed to load ethical considerations:', error);
      // Don't show error - user prefers to show component even if failed
      setEthicalConsiderations([]);
    }
  };

  // NEW: Acknowledge ethical considerations
  const acknowledgeEthicalConsiderations = async (projectId: string, acknowledgedIds?: string[]) => {
    if (projectId === 'current') {
      setEthicalConsiderationsAcknowledged(true);
      return;
    }

    try {
      const response = await api.backend.ethicalConsiderations.acknowledge(projectId, acknowledgedIds);
      if (response.success) {
        setEthicalConsiderationsAcknowledged(true);
        
        // Update local state to mark specific considerations as acknowledged
        if (acknowledgedIds) {
          setEthicalConsiderations(prev => prev.map(consideration => ({
            ...consideration,
            acknowledged: acknowledgedIds.includes(consideration.id) || consideration.acknowledged
          })));
        }
      }
    } catch (error) {
      console.error('Failed to acknowledge ethical considerations:', error);
      throw error;
    }
  };

  // NEW: Refresh ethical considerations
  const refreshEthicalConsiderations = async (projectId: string) => {
    if (projectId === 'current') {
      return;
    }

    try {
      const response = await api.backend.ethicalConsiderations.refresh(projectId);
      if (response.success) {
        setEthicalConsiderations(response.data);
        setEthicalConsiderationsAcknowledged(false); // Reset acknowledgment
      }
    } catch (error) {
      console.error('Failed to refresh ethical considerations:', error);
      throw error;
    }
  };

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoading) {
      const allData = {
        phases,
        activePhaseId,
        projectPrompt,
        projectFiles,
        reflectionAnswers,
        scopingActiveStep,
        selectedUseCase,
        constraints,
        selectedDataset,
        suitabilityChecks,
        scopingFinalDecision,
        
        // NEW: Enhanced development state
        developmentSelectedSolution,
        developmentGeneratedProject,
        developmentSolutionSelection,
        
        // Legacy development state
        developmentSelectedPipeline,
        developmentGuardrails,
        developmentMilestones,
        developmentTestResults,
        developmentEvaluationCriteria,
        developmentDecision,
        
        // Evaluation state
        evaluationTestResults,
        evaluationImpactGoalChecks,
        evaluationRiskAssessments,
        evaluationStakeholderFeedback,
        evaluationDecision,
        evaluationJustification,

        // NEW: Ethical considerations state
        ethicalConsiderations,
        ethicalConsiderationsAcknowledged
      };
      
      const { meta } = getFromStorage(projectId);
      const metadata: ProjectMetadata = {
        lastSync: meta?.lastSync || new Date().toISOString(),
        version: meta?.version || 1
      };
      
      saveToStorage(projectId, allData, metadata);
    }
  }, [
    isLoading, projectId, phases, activePhaseId, projectPrompt, projectFiles,
    reflectionAnswers, scopingActiveStep, selectedUseCase, constraints,
    selectedDataset, suitabilityChecks, scopingFinalDecision,
    
    // NEW: Enhanced development dependencies
    developmentSelectedSolution, developmentGeneratedProject, developmentSolutionSelection,
    
    // Legacy development dependencies
    developmentSelectedPipeline, developmentGuardrails, developmentMilestones,
    developmentTestResults, developmentEvaluationCriteria, developmentDecision,
    
    // Evaluation dependencies
    evaluationTestResults, evaluationImpactGoalChecks, evaluationRiskAssessments,
    evaluationStakeholderFeedback, evaluationDecision, evaluationJustification,

    // NEW: Ethical considerations dependencies
    ethicalConsiderations, ethicalConsiderationsAcknowledged
  ]);

  // Load and sync data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load from localStorage first (instant)
        const { data: localData } = getFromStorage(projectId);
        if (localData) {
          setPhases(localData.phases || getDefaultPhases());
          setActivePhaseId(localData.activePhaseId || "reflection");
          setProjectPrompt(localData.projectPrompt || "");
          setProjectFiles(localData.projectFiles || []);
          setReflectionAnswers(localData.reflectionAnswers || {});
          setScopingActiveStep(localData.scopingActiveStep || 1);
          setSelectedUseCase(localData.selectedUseCase || null);
          setConstraints(localData.constraints || getDefaultConstraints());
          setSelectedDataset(localData.selectedDataset || null);
          setSuitabilityChecks(localData.suitabilityChecks || getDefaultSuitabilityChecks());
          setScopingFinalDecision(localData.scopingFinalDecision || null);
          
          // NEW: Enhanced development state
          setDevelopmentSelectedSolution(localData.developmentSelectedSolution || null);
          setDevelopmentGeneratedProject(localData.developmentGeneratedProject || null);
          setDevelopmentSolutionSelection(localData.developmentSolutionSelection || null);
          
          // Legacy development state
          setDevelopmentSelectedPipeline(localData.developmentSelectedPipeline || "");
          setDevelopmentGuardrails(localData.developmentGuardrails || []);
          setDevelopmentMilestones(localData.developmentMilestones || []);
          setDevelopmentTestResults(localData.developmentTestResults || []);
          setDevelopmentEvaluationCriteria(localData.developmentEvaluationCriteria || []);
          setDevelopmentDecision(localData.developmentDecision || null);
          
          // Evaluation state
          setEvaluationTestResults(localData.evaluationTestResults || "");
          setEvaluationImpactGoalChecks(localData.evaluationImpactGoalChecks || getDefaultImpactGoalChecks());
          setEvaluationRiskAssessments(localData.evaluationRiskAssessments || getDefaultRiskAssessments());
          setEvaluationStakeholderFeedback(localData.evaluationStakeholderFeedback || []);
          setEvaluationDecision(localData.evaluationDecision || null);
          setEvaluationJustification(localData.evaluationJustification || "");

          // NEW: Ethical considerations state
          setEthicalConsiderations(localData.ethicalConsiderations || []);
          setEthicalConsiderationsAcknowledged(localData.ethicalConsiderationsAcknowledged || false);
        }
        
        // Then sync with API if not a default project
        if (projectId !== 'current') {
          try {
            const response = await api.backend.projects.getProjectSync(projectId);
            if (response.success) {
              const apiData = response.data;
              const { meta: localMeta } = getFromStorage(projectId);
              
              // Simple timestamp comparison
              const apiUpdated = new Date(apiData.updated_at).getTime();
              const localUpdated = localMeta?.lastSync ? new Date(localMeta.lastSync).getTime() : 0;
              
              // If API data is newer, use it
              if (apiUpdated > localUpdated) {
                console.log('API data is newer, syncing...');
                
                // Map API data to local state
                if (apiData.phases) setPhases(apiData.phases);

                if (apiData.reflection_questions) {
                    localStorage.setItem(
                      `project-${projectId}-reflection-questions`,
                      JSON.stringify(apiData.reflection_questions)
                    );
                }
                
                if (apiData.reflection_data?.answers) {
                  setReflectionAnswers(apiData.reflection_data.answers);
                }
                
                if (apiData.scoping_data) {
                  const sd = apiData.scoping_data;
                  if (sd.activeStep) setScopingActiveStep(sd.activeStep);
                  if (sd.selectedUseCase) setSelectedUseCase(sd.selectedUseCase);
                  if (sd.constraints) setConstraints(sd.constraints);
                  if (sd.selectedDataset) setSelectedDataset(sd.selectedDataset);
                  if (sd.suitabilityChecks) setSuitabilityChecks(sd.suitabilityChecks);
                  if (sd.finalDecision) setScopingFinalDecision(sd.finalDecision);
                }
                
                // NEW: Sync development data
                if (apiData.development_data) {
                  const dd = apiData.development_data;
                  if (dd.selected_solution) {
                    // Convert backend solution format to frontend format if needed
                    setDevelopmentSelectedSolution(dd.selected_solution);
                  }
                  if (dd.generated_project) {
                    setDevelopmentGeneratedProject(dd.generated_project);
                  }
                  if (dd.solution_selection) {
                    setDevelopmentSolutionSelection(dd.solution_selection);
                  }
                }

                // NEW: Sync ethical considerations data
                if (apiData.ethical_considerations) {
                  setEthicalConsiderations(apiData.ethical_considerations);
                }
                if (typeof apiData.ethical_considerations_acknowledged === 'boolean') {
                  setEthicalConsiderationsAcknowledged(apiData.ethical_considerations_acknowledged);
                }
                
                // Update metadata
                const newMetadata: ProjectMetadata = {
                  lastSync: apiData.updated_at,
                  version: apiData.version || 1
                };
                saveToStorage(projectId, localData, newMetadata);
              } else {
                console.log('Local data is newer or same, keeping local data');
              }
            }
          } catch (error) {
            console.warn('Failed to sync with API, using local data:', error);
          }

          // Load ethical considerations from API (separate call)
          await loadEthicalConsiderations(projectId);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [projectId]);

  const updatePhaseSteps = (phaseId: string, totalSteps: number) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId ? { ...phase, totalSteps } : phase
    ));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ProjectContext.Provider value={{
      isLoading,
      phases, setPhases,
      activePhaseId, setActivePhaseId,
      updatePhaseSteps,
      projectPrompt, setProjectPrompt,
      projectFiles, setProjectFiles,
      reflectionAnswers, setReflectionAnswers,
      scopingActiveStep, setScopingActiveStep,
      selectedUseCase, setSelectedUseCase,
      constraints, setConstraints,
      selectedDataset, setSelectedDataset,
      suitabilityChecks, setSuitabilityChecks,
      scopingFinalDecision, setScopingFinalDecision,
      
      // NEW: Enhanced Development Phase State
      developmentSelectedSolution, setDevelopmentSelectedSolution,
      developmentGeneratedProject, setDevelopmentGeneratedProject,
      developmentSolutionSelection, setDevelopmentSolutionSelection,
      
      // Legacy development state
      developmentSelectedPipeline, setDevelopmentSelectedPipeline,
      developmentGuardrails, setDevelopmentGuardrails,
      developmentMilestones, setDevelopmentMilestones,
      developmentTestResults, setDevelopmentTestResults,
      developmentEvaluationCriteria, setDevelopmentEvaluationCriteria,
      developmentDecision, setDevelopmentDecision,
      
      // Evaluation state
      evaluationTestResults, setEvaluationTestResults,
      evaluationImpactGoalChecks, setEvaluationImpactGoalChecks,
      evaluationRiskAssessments, setEvaluationRiskAssessments,
      evaluationStakeholderFeedback, setEvaluationStakeholderFeedback,
      evaluationDecision, setEvaluationDecision,
      evaluationJustification, setEvaluationJustification,

      // NEW: Ethical Considerations
      ethicalConsiderations, setEthicalConsiderations,
      ethicalConsiderationsAcknowledged, setEthicalConsiderationsAcknowledged,
      loadEthicalConsiderations,
      acknowledgeEthicalConsiderations,
      refreshEthicalConsiderations
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};