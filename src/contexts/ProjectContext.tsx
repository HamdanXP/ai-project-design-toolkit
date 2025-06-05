import React, { createContext, useState, useContext, ReactNode } from "react";
import { ProjectPhase } from "@/types/project";
import { UseCase, Dataset, FeasibilityConstraint, DataSuitabilityCheck } from "@/types/scoping-phase";
import { 
  PipelineTemplate, 
  EthicalGuardrail, 
  PrototypeMilestone, 
  TestResult, 
  EvaluationCriteria,
  DevelopmentDecision,
  RiskAssessment,
  StakeholderFeedback,
  ImpactGoalCheck,
  EvaluationDecision
} from "@/types/development-phase";

// Define the shape of our project context
interface ProjectContextType {
  // Phase tracking
  phases: ProjectPhase[];
  setPhases: React.Dispatch<React.SetStateAction<ProjectPhase[]>>;
  activePhaseId: string;
  setActivePhaseId: React.Dispatch<React.SetStateAction<string>>;
  
  // Dynamic phase step updates
  updatePhaseSteps: (phaseId: string, totalSteps: number) => void;
  
  // Project details
  projectPrompt: string;
  setProjectPrompt: React.Dispatch<React.SetStateAction<string>>;
  projectFiles: string[];
  setProjectFiles: React.Dispatch<React.SetStateAction<string[]>>;
  
  // Reflection phase data
  reflectionAnswers: Record<string, string>;
  setReflectionAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  
  // Scoping phase data
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
  
  // Development phase data
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
  
  // Evaluation phase data
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
}

// Create the context with a default undefined value
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Provider component
export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Phase tracking state
  const [phases, setPhases] = useState<ProjectPhase[]>([
    {
      id: "reflection",
      name: "Reflection",
      status: "in-progress",
      progress: 0,
      totalSteps: 8, // Default fallback, will be updated by backend
      completedSteps: 0
    },
    {
      id: "scoping",
      name: "Scoping",
      status: "not-started",
      progress: 0,
      totalSteps: 5,
      completedSteps: 0
    },
    {
      id: "development",
      name: "Development",
      status: "not-started",
      progress: 0,
      totalSteps: 6,
      completedSteps: 0
    },
    {
      id: "evaluation",
      name: "Evaluation",
      status: "not-started",
      progress: 0,
      totalSteps: 5,
      completedSteps: 0
    }
  ]);
  const [activePhaseId, setActivePhaseId] = useState<string>("reflection");
  
  // Function to update phase step counts based on backend data
  const updatePhaseSteps = (phaseId: string, totalSteps: number) => {
    setPhases(prev => prev.map(phase => 
      phase.id === phaseId 
        ? { ...phase, totalSteps }
        : phase
    ));
  };
  
  // Project details state
  const [projectPrompt, setProjectPrompt] = useState<string>("");
  const [projectFiles, setProjectFiles] = useState<string[]>([]);
  
  // Reflection phase state - using string keys to match backend format
  const [reflectionAnswers, setReflectionAnswers] = useState<Record<string, string>>({});
  
  // Scoping phase state
  const [scopingActiveStep, setScopingActiveStep] = useState<number>(1);
  const [selectedUseCase, setSelectedUseCase] = useState<UseCase | null>(null);
  const [constraints, setConstraints] = useState<FeasibilityConstraint[]>([
    { id: "time", label: "Time Available", value: "medium-term", options: ["short-term", "medium-term", "long-term"], type: "select" },
    { id: "tech", label: "Technical Capacity", value: "moderate", options: ["limited", "moderate", "extensive"], type: "select" },
    { id: "compute", label: "Computing Resources", value: "cloud", options: ["local", "cloud", "hybrid"], type: "select" },
    { id: "internet", label: "Internet Access", value: true, type: "toggle" },
    { id: "infrastructure", label: "Local Infrastructure", value: true, type: "toggle" }
  ]);
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [suitabilityChecks, setSuitabilityChecks] = useState<DataSuitabilityCheck[]>([
    { id: "completeness", question: "When you examine the data, what do you observe?", answer: "unknown", description: "Assess how complete and consistent your dataset appears" },
    { id: "representativeness", question: "Does this data fairly represent the people you want to help?", answer: "unknown", description: "Evaluate if the data covers your target communities adequately" },
    { id: "privacy", question: "Could using this data cause harm or raise privacy concerns?", answer: "unknown", description: "Consider potential risks to individuals and communities" },
    { id: "sufficiency", question: "Do you have enough good quality data for your project?", answer: "unknown", description: "Assess if the data volume and quality meet your project needs" }
  ]);
  const [scopingFinalDecision, setScopingFinalDecision] = useState<'proceed' | 'revise' | null>(null);

  // Development phase state
  const [developmentSelectedPipeline, setDevelopmentSelectedPipeline] = useState<string>("");
  const [developmentGuardrails, setDevelopmentGuardrails] = useState<EthicalGuardrail[]>([]);
  const [developmentMilestones, setDevelopmentMilestones] = useState<PrototypeMilestone[]>([]);
  const [developmentTestResults, setDevelopmentTestResults] = useState<TestResult[]>([]);
  const [developmentEvaluationCriteria, setDevelopmentEvaluationCriteria] = useState<EvaluationCriteria[]>([]);
  const [developmentDecision, setDevelopmentDecision] = useState<DevelopmentDecision>(null);

  // Evaluation phase state
  const [evaluationTestResults, setEvaluationTestResults] = useState<string>("");
  const [evaluationImpactGoalChecks, setEvaluationImpactGoalChecks] = useState<ImpactGoalCheck[]>([
    { id: "goal1", question: "Does the model deliver the benefit I defined earlier?", isAligned: false, notes: "" },
    { id: "goal2", question: "Does my model support the people it's meant to help?", isAligned: false, notes: "" },
    { id: "goal3", question: "Is the solution addressing the original problem effectively?", isAligned: false, notes: "" }
  ]);
  const [evaluationRiskAssessments, setEvaluationRiskAssessments] = useState<RiskAssessment[]>([
    { id: "risk1", category: "Bias", level: "unknown", notes: "" },
    { id: "risk2", category: "Misuse potential", level: "unknown", notes: "" },
    { id: "risk3", category: "Safety concerns", level: "unknown", notes: "" }
  ]);
  const [evaluationStakeholderFeedback, setEvaluationStakeholderFeedback] = useState<StakeholderFeedback[]>([]);
  const [evaluationDecision, setEvaluationDecision] = useState<EvaluationDecision>(null);
  const [evaluationJustification, setEvaluationJustification] = useState<string>("");

  return (
    <ProjectContext.Provider
      value={{
        phases, 
        setPhases,
        activePhaseId, 
        setActivePhaseId,
        updatePhaseSteps,
        projectPrompt, 
        setProjectPrompt,
        projectFiles, 
        setProjectFiles,
        reflectionAnswers,
        setReflectionAnswers,
        scopingActiveStep, 
        setScopingActiveStep,
        selectedUseCase, 
        setSelectedUseCase,
        constraints, 
        setConstraints,
        selectedDataset, 
        setSelectedDataset,
        suitabilityChecks, 
        setSuitabilityChecks,
        scopingFinalDecision, 
        setScopingFinalDecision,
        developmentSelectedPipeline,
        setDevelopmentSelectedPipeline,
        developmentGuardrails,
        setDevelopmentGuardrails,
        developmentMilestones,
        setDevelopmentMilestones,
        developmentTestResults,
        setDevelopmentTestResults,
        developmentEvaluationCriteria,
        setDevelopmentEvaluationCriteria,
        developmentDecision,
        setDevelopmentDecision,
        evaluationTestResults,
        setEvaluationTestResults,
        evaluationImpactGoalChecks,
        setEvaluationImpactGoalChecks,
        evaluationRiskAssessments,
        setEvaluationRiskAssessments,
        evaluationStakeholderFeedback,
        setEvaluationStakeholderFeedback,
        evaluationDecision,
        setEvaluationDecision,
        evaluationJustification,
        setEvaluationJustification
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the project context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
